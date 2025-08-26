import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

const NewsSourceScreen = ({ navigation }) => {
  const [selectedState, setSelectedState] = useState(null);

  const handleSelect = (state) => {
    setSelectedState(state);
  };

  const handleNext = () => {
    if (!selectedState) {
      alert('Please select a state');
      return;
    }
    console.log('Selected:', selectedState);
    navigation.navigate('LanguageScreen', { state: selectedState });
  };

  const states = [
    {
      name: 'Andhra Pradesh',
      image: require('../Assets/Rectangle 1457.png'), // <-- Replace with actual image path
    },
    {
      name: 'Telangana',
      image: require('../Assets/Rectangle 1458.png'), // <-- Replace with actual image path
    },
  ];

  return (
    <View style={styles.container}>
      <View>
        {states.map((state) => {
          const isSelected = selectedState === state.name;
          return (
            <TouchableOpacity
              key={state.name}
              onPress={() => handleSelect(state.name)}
              style={[
                styles.stateCard,
                isSelected && styles.selectedCard,
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
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NewsSourceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  stateCard: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
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
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  stateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
