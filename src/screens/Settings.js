// src/screens/Settings.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

const Settings = ({ navigation }) => {
  
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  const handleSignOut = async () => { // handle sign out
    try {
      await signOut(auth);
      navigation.navigate('Login');  // go back to login screen after signing out
    } catch (error) {
      console.log('Error signing out:', error);
      alert('Error signing out: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.userSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.userInfo}>
          <Text style={styles.label}>Logged in as:</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  userSection: {
    backgroundColor: theme.colors.cardBg,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: theme.fontSize.subtitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'column',
    gap: theme.spacing.small,
  },
  label: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.textSecondary,
  },
  email: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.text,
    fontWeight: '500',
  },
  button: {
    backgroundColor: theme.colors.danger,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  buttonText: {
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: theme.fontSize.normal,
  },
});

export default Settings;