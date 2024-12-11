import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { theme } from '../styles/theme';
//import { transcribeAudio } from '../services/openai';
import OpenAI from 'openai';

const Record = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  //const openai = new OpenAI();

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
      // Request permissions
      console.log("Requesting permissions");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone access to record.');
        return;
      }
      console.log("Permissions granted");

      // Configure audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Audio mode set");

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      console.log("Recording created");
      setRecording(recording);
      setIsRecording(true);
      setTimer(0);
      console.log("Recording started");
    } catch (err) {
      Alert.alert('Failed to start recording', err.message);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      console.log("Stopping recording");

      const status = await recording.getStatusAsync();
      console.log("Recording duration:", status.durationMillis);

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and URI obtained");
      // Process the recording
      await processRecording(uri);
      console.log("Recording processed");
      // Clean up
      setRecording(null);
      setTimer(0);
    } catch (err) {
      Alert.alert('Failed to stop recording', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const processRecording = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log("Audio file size:", fileInfo.size);
      console.log("Audio file exists:", fileInfo.exists);

      // Create audio file object for OpenAI processing
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a',
        name: 'recording.m4a'
      });
      console.log("Form data created");

      try{
        const transcript = await transcribeAudio(formData);
        console.log("Transcript:", transcript);
      } catch (transcriptError) {
        console.error("Error transcribing audio:", transcriptError);
      }
    } catch (error) {
      console.error("Error processing recording:", error);
    }
  };

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.recordingInfo}>
        <Text style={styles.timerText}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.recordButton, 
          isRecording && styles.recording,
          isProcessing && styles.processing
        ]}
        onPress={handleRecordPress}
        disabled={isProcessing}
      >
        <View style={[
          styles.recordButtonInner, 
          isRecording && styles.stopButton,
          isProcessing && styles.processingInner
        ]} />
      </TouchableOpacity>
      
      <Text style={styles.recordingText}>
        {isProcessing 
          ? 'Processing your entry...' 
          : isRecording 
            ? 'Tap to stop' 
            : 'Tap to start recording'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.fire,
  },
  stopButton: {
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
  },
  processing: {
    opacity: 0.7,
  },
  processingInner: {
    opacity: 0.5,
  },
  recordingText: {
    marginTop: theme.spacing.large,
    fontSize: theme.fontSize.normal,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  }
});

export default Record;