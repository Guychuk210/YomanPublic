import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { 
  BottomSheetView,
  BottomSheetBackdrop
} from '@gorhom/bottom-sheet';

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
  const [selectedStyleInfo, setSelectedStyleInfo] = useState(null);

  // Define the ref
  const bottomSheetRef = useRef(null);

  // Define snap points
  const snapPoints = useMemo(() => ['40%'], []);

  // Handle style info
  const handleStyleInfo = useCallback((style) => {
    setSelectedStyleInfo(style);
    bottomSheetRef.current?.expand();
  }, []);

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

  const renderStyleButton = (style) => (
    <View key={style.id} style={styles.styleButtonContainer}>
      <TouchableOpacity
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
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => handleStyleInfo(style)}
      >
        <Ionicons 
          name="information-circle-outline" 
          size={24} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
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
              {DIARY_STYLES.map(renderStyleButton)}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isGenerating}
          >
            <Text style={styles.submitButtonText}>
              {isGenerating ? 'Creating...' : 'Create Diary Entry'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={styles.bottomSheetBackground}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>
              {selectedStyleInfo?.label}
            </Text>
            <Text style={styles.bottomSheetDescription}>
              {selectedStyleInfo?.description}
            </Text>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
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
  styleButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    marginBottom: theme.spacing.small,
  },
  styleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.medium,
    alignItems: 'center',
    marginRight: 8,
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
  styleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.small,
  },
  infoButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AfterRecord;