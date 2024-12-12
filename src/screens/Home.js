// src/screens/Home.js
import { theme } from '../styles/theme';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Animated } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, RectButton } from 'react-native-gesture-handler';

const getTimeOfDay = (date) => {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 21) return 'evening';
  return 'night';
};

export default function Home({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [swipeableRef, setSwipeableRef] = useState(null);

  useEffect(() => {
    fetchDiaryEntries();
  }, []);

  const fetchDiaryEntries = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user logged in');
        return;
      }

      const diariesRef = collection(db, 'users', userId, 'diaries');
      const q = query(diariesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const diaryEntries = querySnapshot.docs.map(doc => {
        const date = doc.data().createdAt?.toDate();
        return {
          id: doc.id,
          ...doc.data(),
          date: date?.toLocaleDateString(),
          dayOfWeek: date?.toLocaleDateString('en-US', { weekday: 'long' }),
          timeOfDay: getTimeOfDay(date),
        };
      });

      setEntries(diaryEntries);
    } catch (error) {
      console.error('Error fetching diary entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async (id) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const diaryRef = doc(db, 'users', userId, 'diaries', id);
      await updateDoc(diaryRef, {
        title: editedTitle
      });

      // Update local state
      setEntries(entries.map(entry => 
        entry.id === id ? { ...entry, title: editedTitle } : entry
      ));
      setEditingId(null);
      setEditedTitle('');
    } catch (error) {
      console.error('Error updating title:', error);
      Alert.alert('Error', 'Failed to update title. Please try again.');
    }
  };

  const renderRightActions = (progress, dragX, id) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          }
        ]}>
          <RectButton
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Delete Entry',
                'Are you sure you want to delete this diary entry?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => swipeableRef?.close(),
                  },
                  {
                    text: 'Delete',
                    onPress: () => handleDelete(id),
                    style: 'destructive',
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={24} color="black" />
            <Text style={styles.deleteText}>Delete</Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
      ref={ref => {
        if (item.id === editingId) {
          setSwipeableRef(ref);
        }
      }}
      renderRightActions={(progress, dragX) => 
        renderRightActions(progress, dragX, item.id)
      }
      rightThreshold={-100}
    >
      <TouchableOpacity 
        style={styles.entryCard}
        onPress={() => navigation.navigate('DiaryView', {
          id: item.id,
          title: item.title,
          date: item.date,
          timeOfDay: item.timeOfDay,
          diaryEntry: item.generatedEntry,
          createdAt: item.createdAt,
        })}
      >
        <View style={styles.entryContent}>
          {editingId === item.id ? (
            <View style={styles.editTitleContainer}>
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity 
                  onPress={() => handleSaveTitle(item.id)}
                  style={styles.editButton}
                >
                  <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setEditingId(null);
                    setEditedTitle('');
                  }}
                  style={styles.editButton}
                >
                  <Ionicons name="close" size={24} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.titleContainer}>
              <Text style={styles.entryTitle}>
                {item.title || 'Untitled Entry'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setEditingId(item.id);
                  setEditedTitle(item.title || '');
                }}
                style={styles.editIcon}
              >
                <Ionicons name="pencil" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.entryDetails}>
            {item.dayOfWeek} {item.timeOfDay} • {item.date}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Diary Entries</Text>
      </View>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onRefresh={fetchDiaryEntries}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.large,
    },
    header: {
      marginBottom: theme.spacing.large,
    },
    title: {
      fontSize: theme.fontSize.title,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    entryContent: {
      flex: 1,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    editTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    titleInput: {
      flex: 1,
      fontSize: theme.fontSize.normal,
      fontWeight: 'bold',
      color: theme.colors.text,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary,
      paddingVertical: 4,
      marginRight: theme.spacing.small,
    },
    editButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editButton: {
      padding: 4,
      marginLeft: theme.spacing.xs,
    },
    editIcon: {
      padding: 4,
    },
    entryCard: {
      backgroundColor: theme.colors.cardBg,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      marginBottom: theme.spacing.small,
      ...theme.shadows.small,
    },
    entryTitle: {
      flex: 1,
      fontSize: theme.fontSize.normal,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    entryDetails: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.small,
      fontStyle: 'italic',
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    rightActions: {
      marginBottom: theme.spacing.small,
      width: 100,
      height: '100%',
    },
    deleteAction: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopRightRadius: theme.borderRadius.medium,
      borderBottomRightRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: 'black',
      marginLeft: 5,
    },
    deleteButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    deleteText: {
      color: 'black',
      fontSize: theme.fontSize.small,
      marginTop: 4,
    },
  });