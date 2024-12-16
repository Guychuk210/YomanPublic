import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export const GradientBackground = ({ children }) => {
  return (
    <>
      <LinearGradient
        colors={[
          theme.colors.background,
          'rgba(255, 255, 255, 0.9)',
          theme.colors.background
        ]}
        style={styles.gradientBackground}
      />
      {children}
    </>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
  },
}); 