// src/screens/Settings.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GradientBackground } from '../components/GradientBackground';
//import { API_URL } from '../config/variables';

const Settings = ({ navigation }) => {
  
  const [userEmail, setUserEmail] = useState('');
  const [assistantId, setAssistantId] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in');
          return;
        }

        setUserEmail(user.email);
        
        // Fetch assistantId from Firestore with proper error handling
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.log('User document not found');
          return;
        }

        const userData = userDoc.data();
        const currentAssistantId = userData?.assistantId;
        console.log('Retrieved assistantId:', currentAssistantId); // Debug log
        setAssistantId(currentAssistantId || null);

      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    loadUserData();
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

  const handleShowMemory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No user logged in");
        return;
      }

      if (!assistantId) {
        Alert.alert("No Memory", "The assistant hasn't learned anything about you yet.");
        return;
      }

      // Navigate to Memory screen with assistantId
      navigation.navigate('Memory', { 
        assistantId: assistantId,
        created: user.metadata.creationTime
      });

    } catch (error) {
      console.error('Error showing memory:', error);
      Alert.alert('Error', 'Failed to access memory data');
    }
  };

  const handleClearMemory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      Alert.alert(
        "Clear Memory",
        "This will completely delete your diary assistant and all its learned preferences. Are you sure?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Clear",
            style: "destructive",
            onPress: async () => {
              await updateDoc(doc(db, 'users', user.uid), {
                assistantId: deleteField()
              });
              setAssistantId(null);
              Alert.alert("Success", "Assistant memory has been cleared.");
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error clearing memory:', error);
      Alert.alert('Error', 'Failed to clear memory');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.userInfo}>
            <Text style={styles.label}>Logged in as:</Text>
            <Text style={styles.email}>{userEmail}</Text>
          </View>
        </View>

        <View style={styles.memorySection}>
          <Text style={styles.sectionTitle}>Memory Management</Text>
          <View style={styles.memoryInfo}>
            <Text style={styles.label}>Memory Status:</Text>
            <Text style={styles.memoryStatus}>
              {assistantId ? 'Active' : 'Not initialized'}
            </Text>
          </View>
          
          <View style={styles.memoryButtons}>
            <TouchableOpacity 
              style={styles.showButton} 
              onPress={handleShowMemory}
            >
              <Text style={styles.showButtonText}>Show Me</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClearMemory}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
    paddingHorizontal: '5%',
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
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
  memorySection: {
    backgroundColor: theme.colors.cardBg,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
    ...theme.shadows.small,
  },
  memoryInfo: {
    flexDirection: 'column',
    gap: theme.spacing.small,
    marginBottom: theme.spacing.medium,
  },
  memoryStatus: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.text,
    fontWeight: '500',
  },
  memoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.medium,
  },
  showButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  showButtonText: {
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: theme.fontSize.normal,
  },
  clearButton: {
    flex: 1,
    backgroundColor: theme.colors.danger,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  clearButtonText: {
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: theme.fontSize.normal,
  },
  signOutButton: {
    backgroundColor: 'black',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
    width: '40%',
    alignSelf: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: theme.fontSize.normal,
  },
});

export default Settings;