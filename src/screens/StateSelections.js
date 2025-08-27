import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const NewsSourceScreen = ({ navigation }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [showSplash, setShowSplash] = useState(false);

  const handleSelect = (state) => {
    setSelectedState(state);
    setShowSplash(true);

    setTimeout(() => {
      setShowSplash(false);
      navigation.navigate('LanguageScreen', { state });
    }, 2200); // 5.5 seconds
  };

  const handleNext = () => {
    if (!selectedState) {
      alert('Please select a state');
      return;
    }
    navigation.navigate('LanguageScreen', { state: selectedState });
  };

  const states = [
    {
      name: 'Andhra Pradesh',
      image: require('../Assets/Rectangle 1457.png'), // Replace with your image
    },
    {
      name: 'Telangana',
      image: require('../Assets/Rectangle 1458.png'), // Replace with your image
    },
  ];

  return (
    <View style={styles.container}>
      {/* Fullscreen Splash */}
      {showSplash && selectedState && (
        <View style={styles.splashOverlay}>
          <Image
            source={states.find((state) => state.name === selectedState)?.image}
            style={styles.splashImage}
            resizeMode="cover"
          />
          <View style={styles.splashOverlayText}>
            <Text style={styles.splashStateText}>{selectedState}</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      {!showSplash && (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {states.map((state, index) => {
              const isSelected = selectedState === state.name;
              return (
                <TouchableOpacity
                  key={state.name}
                  onPress={() => handleSelect(state.name)}
                  style={[
                    styles.stateCard,
                    isSelected && styles.selectedCard,
                    index !== 0 && styles.cardSpacing, // spacing between cards
                  ]}
                  activeOpacity={0.9}
                >
                  <Image
                    source={state.image}
                    style={styles.stateImage}
                    resizeMode="cover"
                  />
                  <View style={styles.overlay}>
                    <Text style={styles.stateText}>{state.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default NewsSourceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 20,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  stateCard: {
    width: '100%',
    height: height * 0.3, // ~30% of screen height
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  cardSpacing: {
    marginTop: 24, // space between cards
  },

  selectedCard: {
    borderColor: '#007bff',
  },

  stateImage: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },

  stateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  nextButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },

  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Fullscreen splash
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  splashImage: {
    width: '100%',
    height: '100%',
  },

  splashOverlayText: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 14,
    borderRadius: 8,
  },

  splashStateText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
