import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../config.js/firebase'; // Adjust path as needed

const OTPScreen = ({ route, navigation }) => {
  const { phone, verificationId } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    // Start countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Save user data after successful authentication
  const saveUserData = async (firebaseUser) => {
    try {
      const userData = {
        uid: firebaseUser.uid,
        phone: firebaseUser.phoneNumber,
        createdAt: new Date().toISOString(),
      };

      const token = await firebaseUser.getIdToken();

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  // Check if user is new or existing (you can implement your own logic here)
  const checkUserStatus = async (firebaseUser) => {
    // This is where you'd typically check your backend to see if the user exists
    // For now, we'll assume all users are existing and go to StateSelection
    // You can modify this logic based on your requirements

    try {
      // Option 1: Check your backend API
      // const response = await fetch(`YOUR_API_ENDPOINT/users/${firebaseUser.uid}`);
      // const userExists = response.ok;

      // Option 2: Check AsyncStorage for previous user data
      const existingData = await AsyncStorage.getItem('userData');
      const userExists = existingData !== null;

      return userExists;
    } catch (error) {
      console.error('Error checking user status:', error);
      return false; // Assume new user if error
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      // Create credential with verification code
      const credential = PhoneAuthProvider.credential(verificationId, otp);

      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      console.log('Firebase user:', firebaseUser);

      // Save user data locally
      await saveUserData(firebaseUser);

      // Check if user is new or existing
      const isExistingUser = await checkUserStatus(firebaseUser);

      if (isExistingUser) {
        // Existing user - navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'StateSelections' }],
        });
      } else {
        // New user - navigate to profile completion or onboarding
        navigation.reset({
          index: 0,
          routes: [{ name: 'ProfileSetup' }], // or wherever new users should go
        });
      }

    } catch (error) {
      console.error('OTP verification failed:', error);

      let errorMessage = 'Invalid OTP. Please try again.';

      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid OTP. Please check and try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'OTP has expired. Please request a new one.';
          break;
        case 'auth/session-expired':
          errorMessage = 'Session expired. Please go back and try again.';
          break;
        default:
          errorMessage = error.message || 'Verification failed. Please try again.';
      }

      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setResending(true);
    setTimer(30);

    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const newVerificationId = await phoneProvider.verifyPhoneNumber(
        phone,
        null // We don't need reCAPTCHA for resend
      );

      // Update the verification ID
      route.params.verificationId = newVerificationId;

      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
    } catch (error) {
      console.error('Resend OTP failed:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      setTimer(0);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {phone}
        </Text>

        <Text style={styles.label}>OTP Code*</Text>
        <TextInput
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
          style={styles.input}
          editable={!loading}
          autoFocus
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={timer > 0 || resending}
          >
            <Text style={[
              styles.resendButton,
              (timer > 0 || resending) && styles.resendButtonDisabled
            ]}>
              {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    letterSpacing: 3,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resendButton: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#94a3b8',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});