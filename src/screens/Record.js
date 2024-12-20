import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { theme } from '../styles/theme';
import { Audio } from 'expo-av';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  useSharedValue,
} from 'react-native-reanimated';
import { GradientBackground } from '../components/GradientBackground';
import OpenAI from 'openai';

const RENDER_URL = 'https://yoman-server.onrender.com';
const LOCAL_URL = 'http://192.168.10.141:5000';
const API_URL = __DEV__ ? LOCAL_URL : RENDER_URL;

const Record = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Create wave animations (fixed number of hooks)
  const wave1Scale = useSharedValue(1);
  const wave1Opacity = useSharedValue(0.2);
  const wave2Scale = useSharedValue(1);
  const wave2Opacity = useSharedValue(0.15);
  const wave3Scale = useSharedValue(1);
  const wave3Opacity = useSharedValue(0.1);

  const waves = [
    { scale: wave1Scale, opacity: wave1Opacity },
    { scale: wave2Scale, opacity: wave2Opacity },
    { scale: wave3Scale, opacity: wave3Opacity }
  ];

  useEffect(() => {
    if (isRecording) {
      waves.forEach((wave, index) => {
        wave.scale.value = withRepeat(
          withSpring(1.5 + (index * 0.2), {
            damping: 2,
            stiffness: 80,
            mass: 0.5 + (index * 0.2),
            duration: 2000 + (index * 500)
          }),
          -1,
          true
        );
        wave.opacity.value = withRepeat(
          withSpring(0.3 - (index * 0.05), {
            damping: 2,
            stiffness: 80
          }),
          -1,
          true
        );
      });
    } else {
      waves.forEach(wave => {
        wave.scale.value = withSpring(1);
        wave.opacity.value = withSpring(0);
      });
    }
  }, [isRecording]);

  // Pre-create animated styles
  const waveStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: wave1Scale.value }],
    opacity: wave1Opacity.value
  }));

  const waveStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: wave2Scale.value }],
    opacity: wave2Opacity.value
  }));

  const waveStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: wave3Scale.value }],
    opacity: wave3Opacity.value
  }));

  const waveStyles = [waveStyle1, waveStyle2, waveStyle3];

  // Timer effect
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
      console.log("stopRecording, uri:", uri);
      setRecording(null);

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
        console.log("[Client] Audio file info:", {
            size: fileInfo.size,
            exists: fileInfo.exists,
            uri: uri
        });

        const formData = new FormData();
        formData.append('audioFile', {
            uri: uri,
            type: 'audio/m4a',
            name: 'recording.m4a'
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
            setTranscript(data.transcript);
            console.log("Transcription:", data.transcript);
            navigation.navigate('AfterRecord', { transcript: data.transcript });
            //return data.transcript;
        }

    } catch (error) {
        console.error("Error processing recording:", error);
        Alert.alert('Transcription Error', 'Failed to transcribe audio');
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
      <GradientBackground />
      
      <View style={styles.topSection}>
        <Text style={styles.timerText}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Text>
        <Text style={styles.statusText}>
          {isProcessing 
            ? 'Processing your thoughts...' 
            : isRecording 
              ? 'Recording your story' 
              : 'Ready to listen'}
        </Text>
      </View>

      <View style={styles.waveContainer}>
        {isRecording && waveStyles.map((animatedStyle, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.wave,
              animatedStyle,
              { position: 'absolute' }
            ]} 
          />
        ))}
      </View>

      <View style={styles.bottomSection}>
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
        
        <Text style={styles.hintText}>
          {isProcessing 
            ? 'Just a moment...' 
            : isRecording 
              ? 'Tap to finish' 
              : 'Tap to start'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    color: theme.colors.text,
    letterSpacing: 2,
    fontFamily: theme.fonts.light,
  },
  statusText: {
    fontSize: theme.fontSize.normal,
    color: theme.colors.textSecondary,
    marginTop: 10,
    fontFamily: theme.fonts.medium,
  },
  waveContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
  },
  bottomSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 50,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  recordButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.fire,
  },
  recording: {
    transform: [{scale: 1.1}],
  },
  stopButton: {
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
  },
  processing: {
    opacity: 0.7,
  },
  hintText: {
    marginTop: 20,
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  }
});

export default Record;