import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DIARY_STYLES = [
  { id: 'casual', label: 'Casual & Friendly' },
  { id: 'formal', label: 'Formal & Professional' },
  { id: 'poetic', label: 'Poetic & Creative' },
  { id: 'reflective', label: 'Deep & Reflective' },
];

const AfterRecord = ({ navigation, route }) => {
  const { transcript } = route.params;
  const [editedTranscript, setEditedTranscript] = useState(transcript);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStyle) {
      Alert.alert('Style Required', 'Please select a diary style');
      return;
    }

    console.log('Submitting with style:', selectedStyle);
    setIsGenerating(true);
    
    try {
      const response = await fetch('http://192.168.10.119:5000/generate-diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editedTranscript,
          style: selectedStyle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diary entry');
      }

      const data = await response.json();
      console.log('Diary entry generated:', data.entry);
      
      // Save to Firestore
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const diaryRef = await addDoc(collection(db, 'users', userId, 'diaries'), {
        originalText: editedTranscript,
        generatedEntry: data.entry,
        title: data.title,
        style: selectedStyle,
        createdAt: serverTimestamp(),
        // You can add more fields here as needed
      });

      console.log('Diary entry saved with ID:', diaryRef.id);
      
      // Navigate back to MainApp and then to the Home tab
      navigation.navigate('MainApp', {
        screen: 'Home'
      });

    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'Failed to process diary entry. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Review Your Entry</Text>
      
      <View style={styles.transcriptContainer}>
        <Text style={styles.label}>Edit if needed:</Text>
        <TextInput
          style={styles.transcriptInput}
          multiline
          value={editedTranscript}
          onChangeText={setEditedTranscript}
          placeholder="Your transcribed text appears here"
        />
      </View>

      <View style={styles.styleSection}>
        <Text style={styles.label}>Choose your diary style:</Text>
        <View style={styles.styleButtons}>
          {DIARY_STYLES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleButton,
                selectedStyle === style.id && styles.selectedStyle
              ]}
              onPress={() => setSelectedStyle(style.id)}
            >
              <Text style={[
                styles.styleButtonText,
                selectedStyle === style.id && styles.selectedStyleText
              ]}>
                {style.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Create Diary Entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
  },
  title: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },
  transcriptContainer: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
  },
  transcriptInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.medium,
    minHeight: 150,
    color: theme.colors.text,
    backgroundColor: '#FFFFFF',
  },
  styleSection: {
    marginBottom: theme.spacing.xl,
  },
  styleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
  },
  styleButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  selectedStyle: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  styleButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
  },
  selectedStyleText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.radius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.large,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.normal,
    fontWeight: 'bold',
  },
});

export default AfterRecord;