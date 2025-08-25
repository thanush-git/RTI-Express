import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, PhoneAuthProvider, firebaseConfig } from '../../config.js/firebase';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const recaptchaVerifier = React.useRef(null);

  // Validate Indian 10-digit phone number starting with 6-9
  const isValidPhone = (num) => /^[6-9]\d{9}$/.test(num);

  // Format phone number for Firebase (add country code)
  const formatPhoneForFirebase = (phoneNumber) => {
    return `+91${phoneNumber}`;
  };

  // Save token and user data locally
  const saveAuthData = async (token, user) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    } catch (e) {
      console.error('Storage Error:', e);
    }
  };

  const handleSendOTP = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    if (!agreed) {
      Alert.alert('Terms Required', 'Please accept the Terms & Conditions.');
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhoneForFirebase(phone);

      // Send OTP using Firebase v9 SDK
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedPhone,
        recaptchaVerifier.current
      );

      // Navigate to OTP verification screen with verificationId
      navigation.navigate('OTPScreen', {
        phone: formattedPhone,
        verificationId: verificationId
      });

    } catch (error) {
      console.error('OTP sending failed:', error);
      let errorMessage = 'Failed to send OTP. Please try again.';

      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'SMS quota exceeded. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Failed to send OTP. Please try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Firebase reCAPTCHA */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />

      <View>
        <Text style={styles.title}>Hello!</Text>
        <Text style={styles.subtitle}>Signup to get Started</Text>

        <Text style={styles.label}>Mobile Number*</Text>
        <View style={styles.phoneInputContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            placeholder="Enter your mobile number"
            keyboardType="number-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
            style={styles.input}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreed(!agreed)}
          disabled={loading}
        >
          <Ionicons
            name={agreed ? 'checkbox' : 'square-outline'}
            size={22}
            color={agreed ? '#007bff' : '#aaa'}
          />
          <Text style={styles.checkboxLabel}>Terms & Conditions</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
    //justifyContent: 'space-between',
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  countryCode: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
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