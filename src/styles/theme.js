// src/styles/theme.js
export const theme = {
    colors: {
      // warm, woodsy colors
      primary: '#8B4513',      // saddle brown - like dark wood
      secondary: '#DEB887',    // burly wood - lighter wood tone
      accent: '#CD853F',       // peru - warm wood highlight
      
      // fire inspired
      fire: '#FF4500',         // orange red - for recording/active states
      fireLight: '#FFD700',    // warm yellow - for highlights/accents
      
      // backgrounds
      background: '#FDF5E6',   // old lace - warm, paper-like background
      cardBg: '#FAF0E6',       // linen - slightly different warm background
      
      // text colors
      text: '#3E2723',         // dark brown - main text
      textSecondary: '#6D4C41', // lighter brown - secondary text
      textLight: '#8D6E63',    // even lighter - tertiary text
      
      // other
      border: '#D7CCC8',       // soft brown border
      success: '#2E7D32',      // forest green
      danger: '#C62828',       // deep red
    },
    
    spacing: {
      xs: 5,
      small: 10,
      medium: 15,
      large: 20,
      xl: 30,
    },
    
    fontSize: {
      title: 24,
      subtitle: 20,
      normal: 16,
      small: 14,
      tiny: 12,
    },
    
    // shadows for depth
    shadows: {
      small: {
        shadowColor: '#3E2723',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      medium: {
        shadowColor: '#3E2723',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
      }
    },
    
    // border radius
    borderRadius: {
      small: 8,
      medium: 12,
      large: 16,
    },
    
    // Add radius definitions
    radius: {
      small: 4,
      medium: 8,
      large: 16,
      xl: 24,
      round: 999,
    },
  };