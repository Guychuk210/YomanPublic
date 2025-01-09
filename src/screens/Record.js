import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Alert, TouchableOpacity } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { GradientBackground } from '../components/GradientBackground';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { auth, db } from '../config/firebase';
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { API_URL } from '../config/variables';

const Record = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeScale] = useState(new Animated.Value(1));
  const pageOffset = useRef(new Animated.Value(1)).current;
  const pagerRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      console.log("Requesting permissions");
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone access to record.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setTimer(0);
      console.log("Recording started automatically");
    } catch (err) {
      console.error("Recording error:", err);
      Alert.alert('Failed to start recording', err.message);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!recording) {
        console.error('No recording to stop');
        return;
      }

      setIsProcessing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Create initial Firestore entry first
      const userId = auth.currentUser?.uid;
      const entryRef = await addDoc(collection(db, 'users', userId, 'diaries'), {
        status: 'draft',
        createdAt: serverTimestamp()
      });
      
      // Navigate to WritingStyle immediately
      navigation.navigate('WritingStyle', {
        entryId: entryRef.id
      });

      // Start transcription in background
      const formData = new FormData();
      formData.append('audioFile', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a'
      });

      // Fire and forget - don't await this
      fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'entry-id': entryRef.id,
          'user-id': userId
        }
      });

    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process recording');
    } finally {
      setIsProcessing(false);
      setRecording(null);
      setIsRecording(false);
      setTimer(0);
    }
  };

  const handleUpload = async () => {
    try {
      setIsProcessing(true);
      
      // Pick an audio file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        setIsProcessing(false);
        return;
      }

      const uri = result.assets[0].uri;
      console.log("[Client] Selected audio file:", uri);

      // Process the file similar to recording
      await processAudioFile(uri);
      
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert('Upload Error', 'Failed to upload audio file');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAudioFile = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log("[Client] Audio file info:", {
        size: fileInfo.size,
        exists: fileInfo.exists,
        uri: uri
      });

      const formData = new FormData();
      formData.append('audioFile', {
        uri: uri,
        type: 'audio/mpeg', // Generic audio type
        name: 'upload.mp3'
      });
      
      const serverUrl = `${API_URL}/transcribe`;
      console.log('[Client] Sending request to:', serverUrl);

      const response = await fetch(serverUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.transcript) {
        navigation.navigate('AfterRecord', { transcript: data.transcript });
      }
    } catch (error) {
      console.error("Error processing audio file:", error);
      Alert.alert('Transcription Error', 'Failed to transcribe audio');
    }
  };

  const handleIconPress = (pageId) => {
    if (pageId === 'record') {
      if (isRecording) {
        setIsRecording(false);
        handleStopRecording();
      } else {
        startRecording();
      }
    } else if (pageId === 'write') {
      navigation.navigate('AfterRecord', { transcript: '' });
    } else if (pageId === 'upload') {
      handleUpload();
    }
  };

  const pages = [
    {
      id: 'write',
      title: 'Write',
      icon: 'pencil',
      description: 'Write your thoughts',
      color: 'transparent'
    },
    {
      id: 'record',
      title: 'Record',
      icon: 'mic',
      description: 'Record your thoughts',
      color: 'transparent'
    },
    {
      id: 'upload',
      title: 'Upload',
      icon: 'cloud-upload',
      description: 'Upload audio file',
      color: 'transparent'
    }
  ];

  const handlePageScroll = (e) => {
    const { offset, position } = e.nativeEvent;
    pageOffset.setValue(position + offset);
  };

  const getIconScale = (index) => {
    return pageOffset.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [0.2, 3, 0.2],
      extrapolate: 'clamp'
    });
  };

  return (
    <View style={styles.container}>
      <GradientBackground />

      {isRecording && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      )}

      <View style={styles.indicatorContainer}>
        {pages.map((_, index) => (
          <View 
            key={index}
            style={[
              styles.indicator,
              currentPage === index && styles.indicatorActive
            ]}
          />
        ))}
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={1}
        onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
        onPageScroll={handlePageScroll}
      >
        {pages.map((page, index) => (
          <View key={`${page.id}-${index}`} style={styles.pageContainer}>
            <Animated.View 
              style={[
                styles.iconContainer,
                { 
                  backgroundColor: page.color,
                  transform: [{ scale: getIconScale(index) }]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.iconInnerCircle}
                onPress={() => handleIconPress(page.id)}
                disabled={isProcessing}
              >
                <Ionicons 
                  name={isRecording && page.id === 'record' ? 'stop' : page.icon} 
                  size={60} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.pageTitle}>
              {isProcessing && page.id === 'record' ? 'Processing...' : page.title}
            </Text>
            <Text style={styles.pageDescription}>{page.description}</Text>
          </View>
        ))}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
    //position: 'absolute',
    top: '20%'
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.3,    
  },
  indicatorActive: {
    opacity: 1,
    backgroundColor: theme.colors.primary,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },  
  pageTitle: {
    fontSize: theme.fontSize.xlarge,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pageDescription: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  timerContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
    paddingTop: 20
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
    color: theme.colors.text,
    letterSpacing: 2,
  },
});

export default Record;