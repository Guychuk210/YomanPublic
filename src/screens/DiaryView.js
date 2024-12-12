import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const DiaryView = ({ route }) => {
  const { title, date, timeOfDay, diaryEntry, createdAt } = route.params;
  
  // Format the specific time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.diaryPage}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
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
    backgroundColor: '#FFF9F0', // Warm paper-like color
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
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
    // Add subtle lines like a paper notebook
    backgroundColor: '#FFF9F0',
    backgroundImage: `linear-gradient(#E8DCCA 1px, transparent 1px)`,
    backgroundSize: '100% 25px',
    minHeight: 500,
  },
  entryText: {
    fontSize: 16,
    lineHeight: 25, // Match the background lines
    color: '#34495E',
    paddingHorizontal: 10,
  },
});

export default DiaryView;
