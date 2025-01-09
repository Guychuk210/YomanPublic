import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { GradientBackground } from '../components/GradientBackground';

const { width } = Dimensions.get('window');
const SQUARE_SIZE = (width - (theme.spacing.large * 3)) / 2; // Calculate size for 2 squares with spacing

const STYLES = [
  {
    id: 'casual',
    label: 'Casual',
    icon: 'man-outline',
    color: '#4ECDC4' // Mint
  },
  {
    id: 'formal',
    label: 'Formal',
    icon: 'man-outline',
    color: '#FF6B6B' // Coral Red
  },
  {
    id: 'raw',
    label: 'Raw',
    icon: 'man-outline',
    color: '#45B7D1' // Sky Blue
  },
  {
    id: 'reflective',
    label: 'Reflective',
    icon: 'man-outline',
    color: '#96CEB4' // Sage Green
  }
];

const WritingStyle = ({ navigation, route }) => {
  const [selectedStyle, setSelectedStyle] = useState(null);

  const handleStyleSelect = (style) => {
    setSelectedStyle(style.id);
  };

  const handleContinue = () => {
    if (selectedStyle) {
      navigation.navigate('Summary', {
        entryId: route.params?.entryId,
        selectedStyle
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GradientBackground />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Writing Style</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.row}>
          {STYLES.slice(0, 2).map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleSquare,
                { backgroundColor: style.color },
                selectedStyle === style.id && styles.selectedStyle
              ]}
              onPress={() => handleStyleSelect(style)}
            >
              <Ionicons name={style.icon} size={110} color="#FFF" />
              <Text style={styles.styleLabel}>{style.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {STYLES.slice(2, 4).map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleSquare,
                { backgroundColor: style.color },
                selectedStyle === style.id && styles.selectedStyle
              ]}
              onPress={() => handleStyleSelect(style)}
            >
              <Ionicons name={style.icon} size={110} color="#FFF" />
              <Text style={styles.styleLabel}>{style.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedStyle && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedStyle}
        >
          <Text style={styles.continueButtonText}>Choose</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.large,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.large,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.large,
  },
  styleSquare: {
    width: SQUARE_SIZE,
    height: 250,
    borderRadius: theme.radius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedStyle: {
    borderWidth: 4,
    borderColor: '#FFF',
    transform: [{ scale: 1 }],
  },
  styleLabel: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: theme.spacing.medium,
  },
  bottomContainer: {
    padding: theme.spacing.large,
    paddingBottom: theme.spacing.xl,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.radius.medium,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: theme.fontSize.normal,
    fontWeight: 'bold',
  },
});

export default WritingStyle;
