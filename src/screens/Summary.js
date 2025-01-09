import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { db, auth } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { API_URL } from '../config/variables';
//import LoadingScreen from '../screens/LoadingScreen';

const Summary = ({ navigation, route }) => {
  const { entryId, selectedStyle } = route.params;
  const [transcript, setTranscript] = useState('');
  const [editedTranscript, setEditedTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let intervalId;
    let attempts = 0;
    const maxAttempts = 30; // 1 minute maximum waiting time

    const checkTranscript = async () => {
      try {
        console.log(`Checking transcript... Attempt ${attempts + 1}`);
        const userId = auth.currentUser?.uid;
        console.log('User ID:', userId);
        console.log('Entry ID:', entryId);

        const entryRef = doc(db, 'users', userId, 'diaries', entryId);
        const entryDoc = await getDoc(entryRef);

        console.log('Document exists:', entryDoc.exists());
        if (entryDoc.exists()) {
          const data = entryDoc.data();
          console.log('Document data:', data);
          
          if (data.transcript) {
            console.log('Transcript found:', data.transcript);
            setTranscript(data.transcript);
            setEditedTranscript(data.transcript);
            setIsLoading(false);
            clearInterval(intervalId);
          } else {
            console.log('No transcript yet');
            attempts++;
            if (attempts >= maxAttempts) {
              console.log('Max attempts reached, stopping checks');
              clearInterval(intervalId);
              setIsLoading(false);
              Alert.alert('Error', 'Transcript not available after 1 minute');
            }
          }
        } else {
          console.log('Document does not exist');
        }
      } catch (error) {
        console.error('Error fetching transcript:', error);
        setIsLoading(false);
        clearInterval(intervalId);
      }
    };

    console.log('Starting transcript check, on ip address: ', API_URL);
    // Check immediately
    checkTranscript();
    
    // Then check every 2 seconds until we get the transcript
    intervalId = setInterval(checkTranscript, 2000);

    // Cleanup interval on unmount
    return () => {
      console.log('Cleaning up interval');
      clearInterval(intervalId);
    };
  }, [entryId]); // Add entryId as dependency

  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Get user's assistant ID - Fixed retrieval
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      const assistantId = userData?.assistantId;
      
      console.log('Retrieved assistantId:', assistantId); // Debug log

      // Navigate to LoadingScreen immediately
      navigation.navigate('LoadingScreen', { entryId });

      // Generate diary entry and wait for completion
      const response = await fetch(`${API_URL}/generate-diary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editedTranscript,
          style: selectedStyle,
          assistantId: assistantId || null, // Explicitly handle null case
          entryId,
          userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.details || 'Failed to generate diary entry');
      }

      // After successful generation, navigate to DiaryView
      navigation.reset({
        index: 0,
        routes: [
          { 
            name: 'MainApp',
            params: { 
              screen: 'Diary',
              params: {
                screen: 'DiaryView',
                params: { entryId }
              }
            }
          }
        ],
      });

    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to generate diary entry');
      navigation.goBack();
    } finally {
      setIsGenerating(false);
    }
  };

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <GradientBackground />
  //       <ActivityIndicator size="large" color={theme.colors.primary} />
  //       <Text style={styles.loadingText}>Loading transcript...</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <GradientBackground />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Review Entry</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          <Text style={styles.sectionSubtitle}>Edit if needed:</Text>
          <TextInput
            style={styles.transcriptInput}
            multiline
            value={editedTranscript || ''}
            onChangeText={setEditedTranscript}
            placeholder="Your transcribed text will appear here..."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Style</Text>
          <View style={styles.styleChip}>
            <Text style={styles.styleText}>
              {selectedStyle ? selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1) : ''}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isGenerating && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isGenerating}
        >
          <Text style={styles.submitButtonText}>
            {isGenerating ? 'Generating...' : 'Generate Entry'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    color: theme.colors.text,
    fontSize: theme.fontSize.normal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.large,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
  },
  title: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.large,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
  },
  transcriptInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.medium,
    minHeight: 150,
    color: theme.colors.text,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  styleChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  styleText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.normal,
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: theme.spacing.large,
    paddingBottom: theme.spacing.xl,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.radius.medium,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.normal,
    fontWeight: 'bold',
  },
});

export default Summary;
