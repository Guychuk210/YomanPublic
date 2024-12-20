import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';

const RENDER_URL = 'https://yoman-server.onrender.com';
const LOCAL_URL = 'http://192.168.10.141:5000';
const API_URL = __DEV__ ? LOCAL_URL : RENDER_URL;

const Memory = ({ navigation, route }) => {
  const { assistantId, created } = route.params;
  const [memory, setMemory] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editedMemory, setEditedMemory] = useState('');

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const response = await fetch(`${API_URL}/assistant-memory/${assistantId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch memory');
      }

      setMemory(data.memory);
      setEditedMemory(data.memory);
    } catch (error) {
      console.error('Error fetching memory:', error);
      Alert.alert('Error', 'Failed to retrieve memory data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/assistant-memory/${assistantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memory: editedMemory }),
      });

      if (!response.ok) {
        throw new Error('Failed to update memory');
      }

      setMemory(editedMemory);
      setIsEditing(false);
      Alert.alert('Success', 'Memory updated successfully');
    } catch (error) {
      console.error('Error updating memory:', error);
      Alert.alert('Error', 'Failed to update memory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Assistant Memory</Text>
          <TouchableOpacity 
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Collecting memories since: {new Date(created).toLocaleDateString()}
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <ScrollView 
            style={styles.memoryContainer}
            contentContainerStyle={styles.memoryContent}
          >
            {isEditing ? (
              <TextInput
                style={styles.memoryInput}
                multiline
                value={editedMemory}
                onChangeText={setEditedMemory}
                placeholder="No memories collected yet..."
              />
            ) : (
              <Text style={styles.memoryText}>
                {memory || 'No memories collected yet...'}
              </Text>
            )}
          </ScrollView>
        )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: 50,
  },
  backButton: {
    padding: theme.spacing.small,
  },
  title: {
    fontSize: theme.fontSize.sub,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  editButton: {
    padding: theme.spacing.small,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.normal,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    padding: theme.spacing.medium,
    textAlign: 'center',
  },
  memoryContainer: {
    flex: 1,
  },
  memoryContent: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.xl,
  },
  memoryText: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.text,
    lineHeight: 24,
  },
  memoryInput: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.text,
    lineHeight: 24,
    padding: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.cardBg,
    minHeight: 200,
  },
});

export default Memory;
