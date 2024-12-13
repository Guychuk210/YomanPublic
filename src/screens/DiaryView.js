import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { theme } from '../styles/theme';

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

  return (
    <ScrollView style={styles.container}>
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
          
          <View style={styles.dateContainer}>
            <Text style={styles.date}>
              {date} • {formatTime(createdAt)}
            </Text>
            <Text style={styles.timeOfDay}>{timeOfDay}</Text>
          </View>
        </View>

        {/* Decorative Line */}
        <View style={styles.divider} />

        {/* Entry Content */}
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
});

export default DiaryView;
