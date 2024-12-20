import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { 
  BottomSheetView,
  BottomSheetBackdrop
} from '@gorhom/bottom-sheet';
import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc, setDoc } from 'firebase/firestore';
import { GradientBackground } from '../components/GradientBackground';

const RENDER_URL = 'https://yoman-server.onrender.com';
const LOCAL_URL = 'http://192.168.10.141:5000';
const API_URL = __DEV__ ? LOCAL_URL : RENDER_URL;
//const API_URL = LOCAL_URL;

const DIARY_STYLES = [
  {
    id: 'casual',
    label: 'Casual',
    description: "Example:\n\nHey diary! Today was pretty awesome! 😊 Had lunch with Sarah at that new café downtown - their matcha latte was literally to die for! We spent hours just chatting and laughing about the most random things. Can't believe how time flies when you're having fun! Feeling super grateful for friends who just get me, you know?"
  },
  {
    id: 'formal',
    label: 'Formal',
    description: "Example:\n\nOn this Wednesday afternoon, I attended a significant meeting with the project stakeholders. The discussion proved to be highly productive, as we successfully outlined our quarterly objectives and established clear metrics for success. Notable progress was made in addressing our primary concerns, particularly regarding resource allocation and timeline management."
  },
  {
    id: 'raw',
    label: 'Raw',
    description: "Example:\n\nThe entry will be exactly what you say, no editing or formatting."
  },
  {
    id: 'reflective',
    label: 'Reflective',
    description: "Example:\n\nToday I found myself contemplating the nature of change. As I watched the city wake up from my window, I realized how much I've grown over the past year. Each challenge has shaped me, like water molding stone over time. I'm learning that discomfort often precedes growth, and that perhaps the questions themselves are as valuable as the answers."
  }
];

const AfterRecord = ({ navigation, route }) => {
  const { transcript, type } = route.params;
  const [editedTranscript, setEditedTranscript] = useState(transcript || '');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyleInfo, setSelectedStyleInfo] = useState(null);

  // Define the ref
  const bottomSheetRef = useRef(null);

  // Define snap points
  const snapPoints = useMemo(() => ['44%'], []);

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

    setIsGenerating(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get user's assistant ID from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      const assistantId = userDoc.data()?.assistantId;

      console.log('IM HERE1');

      // Generate diary entry
      const response = await fetch(`${API_URL}/generate-diary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editedTranscript,
          style: selectedStyle,
          assistantId: assistantId // Pass existing assistantID if available
        }),
      });

      console.log('IM HERE2');

      if (!response.ok) {
        throw new Error('Failed to generate diary entry');
      }

      const data = await response.json();

     
      // If this is the first time, save the assistantID
      if (!assistantId && data.assistantId) {
        await setDoc(doc(db, 'users', userId), {
          assistantId: data.assistantId
        }, { merge: true });
      }

      console.log('userID', userId);
      console.log('data.assistantId', data.assistantId);

      // Save diary entry to Firestore
      await addDoc(collection(db, 'users', userId, 'diaries'), {
        originalText: editedTranscript,
        generatedEntry: data.entry,
        title: data.title,
        style: selectedStyle,
        createdAt: serverTimestamp(),
      });

      // Navigate back to MainApp
      navigation.navigate('MainApp', {
        screen: 'Diary'
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
      <View style={styles.buttonGroup}>
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
          style={[
            styles.infoButton,
            selectedStyle === style.id && styles.selectedInfoButton
          ]}
          onPress={() => handleStyleInfo(style)}
        >
          <Ionicons 
            name="information-circle-outline" 
            size={24} 
            color={selectedStyle === style.id ? '#FFFFFF' : theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add this backdrop component handler
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <GradientBackground />
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>View Entry</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.transcriptContainer}>
            <Text style={styles.label}>Edit if needed:</Text>
            <TextInput
              style={styles.transcriptInput}
              multiline
              value={editedTranscript}
              onChangeText={setEditedTranscript}
              placeholder="Start writing your diary entry..."
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
          overDragResistanceFactor={5}
          enablePanDownToClose={true}
          backgroundStyle={styles.bottomSheetBackground}
          backdropComponent={renderBackdrop}
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
    paddingTop: theme.spacing.large,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.large,
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
    paddingTop: 16,
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
    flex: 1,
    minWidth: '45%',
    marginBottom: theme.spacing.small,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  styleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    borderRightWidth: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: theme.spacing.medium,
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
  styleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.small,
  },
  infoButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    padding: theme.spacing.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedInfoButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  bottomSheetBackground: {
    backgroundColor: theme.colors.backgroundDark || '#fef8ec',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  bottomSheetContent: {
    padding: theme.spacing.large,
  },
  bottomSheetTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  bottomSheetDescription: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.textSecondary || '#000000',
    lineHeight: 22,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    width: 40,
    paddingTop: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    paddingTop: 30,
  },
});

export default AfterRecord;