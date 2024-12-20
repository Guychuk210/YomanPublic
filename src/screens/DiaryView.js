import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Keyboard, Clipboard, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const DiaryView = ({ route }) => {
  const { date, timeOfDay, diaryEntry, createdAt } = route.params;
  const [title, setTitle] = useState(route.params.title);
  const [isEditing, setIsEditing] = useState(false);
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleTitlePress = () => {
    setIsEditing(true);
  };

  const handleTitleSubmit = () => {
    setIsEditing(false);
    Keyboard.dismiss();
    // Here you can add logic to save the title to your database
  };

  const handleCopyText = async () => {
    try {
      await Clipboard.setString(diaryEntry);
      Alert.alert('Success', 'Entry copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy text');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.diaryPage}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              onBlur={handleTitleSubmit}
              onSubmitEditing={handleTitleSubmit}
              autoFocus={true}
              maxLength={50}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={handleTitlePress}>
              <Text style={styles.titleText}>{title}</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.metadataContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>
                {date} • {formatTime(createdAt)}
              </Text>
              <Text style={styles.timeOfDay}>{timeOfDay}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleCopyText}
              style={styles.copyButton}
            >
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative Line */}
        <View style={styles.divider} />

        {/* Entry Content with Copy Button */}
        <View style={styles.contentContainer}>
          <Text style={styles.entryText}>{diaryEntry}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  diaryPage: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF9F0',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    minHeight: '95%',
  },
  titleSection: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
    padding: 5,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 5,
  },
  dateContainer: {
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  timeOfDay: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 2,
  },
  divider: {
    height: 2,
    backgroundColor: '#E8DCCA',
    marginVertical: 15,
    width: '100%',
  },
  contentContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFF9F0',
    minHeight: 500,
  },
  entryText: {
    fontSize: 16,
    lineHeight: 25,
    color: '#34495E',
    paddingHorizontal: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundLight,
    ...theme.shadows.small,
  },
  copyButtonText: {
    marginLeft: 4,
    color: theme.colors.primary,
    fontSize: theme.fontSize.small,
    fontWeight: '500',
  },
});

export default DiaryView;
