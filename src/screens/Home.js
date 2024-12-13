// src/screens/Home.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { auth, db } from '../config/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const Home = ({ navigation }) => {
  const [streakCount, setStreakCount] = useState(0);

  // Calculate streak from entries
  const calculateStreak = (entries) => {
    if (!entries.length) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day

    // Sort entries by date, newest first
    const sortedEntries = entries.sort((a, b) => 
      b.createdAt.toDate() - a.createdAt.toDate()
    );

    // Check if wrote today
    const lastEntryDate = sortedEntries[0].createdAt.toDate();
    lastEntryDate.setHours(0, 0, 0, 0);

    // If haven't written today, check if wrote yesterday
    if (lastEntryDate.getTime() !== currentDate.getTime()) {
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastEntryDate.getTime() !== yesterday.getTime()) {
        return 0; // Streak broken
      }
    }

    // Count consecutive days
    let checkDate = new Date(lastEntryDate);
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = sortedEntries[i].createdAt.toDate();
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === checkDate.getTime()) {
        if (i === 0 || checkDate.getTime() !== lastEntryDate.getTime()) {
          streak++;
        }
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (entryDate.getTime() > checkDate.getTime()) {
        // Skip future dates
        continue;
      } else {
        // Streak broken
        break;
      }
    }

    return streak;
  };

  // Fetch entries and calculate streak
  const fetchStreakCount = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const diariesRef = collection(db, 'users', userId, 'diaries');
      const q = query(diariesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const streak = calculateStreak(entries);
      setStreakCount(streak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  // Fetch streak on component mount and when entries change
  useEffect(() => {
    fetchStreakCount();
  }, []);

  // Streak Card Component
  const StreakCard = () => (
    <View style={styles.streakCard}>
      <View style={styles.streakContent}>
        <Text style={styles.streakTitle}>Writing Streak</Text>
        <View style={styles.streakCountContainer}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{streakCount}</Text>
          <Text style={styles.streakDays}>days</Text>
        </View>
      </View>
    </View>
  );

  // Quick Actions Panel
  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.newEntryButton}
          onPress={() => navigation.navigate('AfterRecord', {
            type: 'direct',
            transcript: ''
          })}
        >
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.newEntryText}>New Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.newEntryButton}
          onPress={() => navigation.navigate('Record')}
        >
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.newEntryText}>Voice Note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, {auth.currentUser?.displayName || 'there'} 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
      </View>

      <StreakCard />
      <QuickActions />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#A0A0A0',
  },
  streakCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    backgroundColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakContent: {
    alignItems: 'center',
  },
  streakTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  streakCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakCount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 8,
  },
  streakDays: {
    color: 'white',
    fontSize: 16,
  },
  quickActionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newEntryGradient: {
    backgroundColor: '#FF6B6B',
  },
  voiceNoteGradient: {
    backgroundColor: '#4D96FF',
  },
  photoEntryGradient: {
    backgroundColor: '#6BCB77',
  },
  actionLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newEntryText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default Home;