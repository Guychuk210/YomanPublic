import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { GradientBackground } from '../components/GradientBackground';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <GradientBackground />
      <Ionicons name="book" size={60} color={theme.colors.text} />
      <Text style={styles.message}>Making history...</Text>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  message: {
    fontSize: theme.fontSize.large,
    color: theme.colors.text,
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.medium,
    fontWeight: '600',
  },
  spinner: {
    marginTop: theme.spacing.medium,
  },
});

export default LoadingScreen;
