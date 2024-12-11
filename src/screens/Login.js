// src/screens/Login.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react'; 


// main login component
const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('MainApp'); // Or whatever your main screen name is
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    // make sure we have both email and password
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      // try to sign in with firebase
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('MainApp');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.colors.textLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password" 
          placeholderTextColor={theme.colors.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Log In'}
          </Text>
        </TouchableOpacity>


        <TouchableOpacity 
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerLinkText}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// styles matching the cozy theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
  },
  header: {
    marginTop: theme.spacing.xl * 2,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.fontSize.subtitle,
    color: theme.colors.textSecondary,
  },
  form: {
    marginTop: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.cardBg,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    fontSize: theme.fontSize.normal,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.large,
    ...theme.shadows.small,
  },
  buttonText: {
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: theme.fontSize.normal,
  },
  registerLink: {
    marginTop: theme.spacing.large,
    padding: theme.spacing.small,
  },
  registerLinkText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: theme.fontSize.normal,
  }
});

export default Login;