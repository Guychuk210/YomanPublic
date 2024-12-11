// src/screens/Register.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const Register = ({ navigation }) => {
    console.log("I'm in the register screen");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth1 = auth;

  // handle registration - add proper auth logic later
  const handleRegister = async () => {
    console.log("I'm in the handle registegr function");
    setLoading(true);
    try{
        const response = await createUserWithEmailAndPassword(auth1, email, password);
        console.log(response);
        alert("User created successfully");
        navigation.navigate('Login');
    } catch (error) {
        console.log(error);
        alert("Error creating user:" + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={theme.colors.textLight}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.registerButton, loading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  registerButton: {
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
  loginLink: {
    marginTop: theme.spacing.large,
    padding: theme.spacing.small,
  },
  loginLinkText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: theme.fontSize.normal,
  }
});

export default Register;