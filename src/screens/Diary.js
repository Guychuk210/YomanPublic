import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, TextInput, Alert, Keyboard, ActivityIndicator, Easing, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GradientBackground } from '../components/GradientBackground';

const Diary = ({ navigation }) => {
  // State management
  const [entries, setEntries] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEntries, setSelectedDateEntries] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [activeSwipeRef, setActiveSwipeRef] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const entriesPerPage = 10;

  // Initialize animation value based on initial view mode
  const [toggleAnimation] = useState(new Animated.Value(viewMode === 'list' ? 0 : 1));

  // Helper function to get time of day
  const getTimeOfDay = (date) => {
    const hours = date.getHours();
    if (hours >= 5 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 17) return 'afternoon';
    if (hours >= 17 && hours < 21) return 'evening';
    return 'night';
  };

  // Fetch entries from Firestore
  const fetchEntries = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log('No user logged in');
        return;
      }

      const diariesRef = collection(db, 'users', userId, 'diaries');
      const q = query(diariesRef, orderBy('createdAt', sortOrder));
      
      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map(doc => {
        const date = doc.data().createdAt?.toDate();
        return {
          id: doc.id,
          ...doc.data(),
          date: date?.toLocaleDateString(),
          dayOfWeek: date?.toLocaleDateString('en-US', { weekday: 'long' }),
          timeOfDay: getTimeOfDay(date),
        };
      });
      setEntries(entriesData);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // Fetch entries on component mount
  useEffect(() => {
    fetchEntries();
  }, [sortOrder]);

  // Process entries to mark calendar dates whenever entries change
  useEffect(() => {
    const marks = {};
    entries.forEach(entry => {
      const dateStr = new Date(entry.createdAt.toDate()).toISOString().split('T')[0];
      marks[dateStr] = {
        marked: true,
        dotColor: '#32df69',
        selected: selectedDate === dateStr,
        selectedColor: 'rgba(0, 200, 0, 0.1)', // Light green background for selected date
      };
    });
    setMarkedDates(marks);
  }, [entries, selectedDate]);

  // Filter entries for selected date
  const filterEntriesForDate = (dateString) => {
    return entries.filter(entry => {
      const entryDate = entry.createdAt.toDate().toISOString().split('T')[0];
      return entryDate === dateString;
    });
  };

  // Animate the toggle with simplified configuration
  const animateToggle = (toValue) => {
    Animated.spring(toggleAnimation, {
      toValue,
      useNativeDriver: false,
      bounciness: 4,
      speed: 12,
    }).start();
  };

  // Toggle button between list and calendar views
  const ViewToggle = () => {
    const togglePosition = toggleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: Platform.OS === 'ios' ? [2, 44] : [2, 42],
    });

    const handleToggle = () => {
      const newMode = viewMode === 'list' ? 'calendar' : 'list';
      setViewMode(newMode);
      
      toggleAnimation.stopAnimation();
      
      if (Platform.OS === 'ios') {
        Animated.timing(toggleAnimation, {
          toValue: newMode === 'list' ? 0 : 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }).start();
      } else {
        Animated.timing(toggleAnimation, {
          toValue: newMode === 'list' ? 0 : 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }).start();
      }
    };

    return (
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggle,
            Platform.OS === 'ios' && styles.toggleIOS
          ]}
          activeOpacity={0.8}
          onPress={handleToggle}
        >
          <View style={styles.toggleIcons}>
            <Ionicons 
              name="list-outline" 
              size={20} 
              color={viewMode === 'list' ? theme.colors.primary : '#BDBDBD'}
            />
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={viewMode === 'calendar' ? theme.colors.primary : '#BDBDBD'}
            />
          </View>
          
          <Animated.View 
            style={[
              styles.toggleSlider,
              Platform.OS === 'ios' && styles.toggleSliderIOS,
              { 
                transform: [{ translateX: togglePosition }],
              }
            ]}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Calendar view component with selected date entries
  const CalendarView = () => (
    <View style={styles.calendarContainer}>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => {
          const dateStr = day.dateString;
          setSelectedDate(dateStr);
          const filteredEntries = filterEntriesForDate(dateStr);
          setSelectedDateEntries(filteredEntries);
        }}
        theme={{
          // Calendar background
          calendarBackground: theme.colors.background,
          
          // Text colors
          textSectionTitleColor: theme.colors.textSecondary,
          textDayFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
          
          // Day colors
          dayTextColor: theme.colors.textSecondary,
          todayTextColor: theme.colors.primary,
          selectedDayBackgroundColor: 'transparent',
          selectedDayTextColor: theme.colors.textSecondary,
          
          // Month title
          monthTextColor: theme.colors.textSecondary,
          
          // Arrows
          arrowColor: theme.colors.primary,
          
          // Dot style
          dotColor: theme.colors.primary,
          selectedDotColor: theme.colors.primary,
          dotStyle: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginTop: 1,
          },
        }}
      />
      
      {/* Selected Date Entries List */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>
            Entries for {new Date(selectedDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          {selectedDateEntries.length > 0 ? (
            <FlatList
              data={selectedDateEntries}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.selectedDateList}
            />
          ) : (
            <Text style={styles.noEntriesText}>No entries for this date</Text>
          )}
        </View>
      )}
    </View>
  );

  // Calculate paginated entries
  const paginatedEntries = useMemo(() => {
    return entries.slice(0, page * entriesPerPage);
  }, [entries, page]);

  // Handle load more
  const handleLoadMore = () => {
    if (paginatedEntries.length < entries.length) {
      setPage(prev => prev + 1);
    }
  };

  // List view component
  const ListView = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.subtitle}>
          Here are your {Math.min(entriesPerPage, entries.length)} last entries. 
          {entries.length > entriesPerPage ? ' Scroll down to see more.' : ''}
        </Text>
      </View>
      <FlatList
        data={paginatedEntries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchEntries}
        refreshing={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          isLoadingMore ? (
            <ActivityIndicator 
              size="small" 
              color={theme.colors.primary} 
              style={styles.loadingMore}
            />
          ) : null
        )}
      />
    </>
  );

  // Function to update entry title
  const updateEntryTitle = async (id, newTitle) => {
    console.log('Starting title update for entry:', id);
    console.log('New title:', newTitle);

    try {
      if (!auth.currentUser?.uid) {
        console.error('No user logged in');
        Alert.alert('Error', 'You must be logged in to update entries');
        return;
      }

      if (!id) {
        console.error('No entry ID provided');
        Alert.alert('Error', 'Invalid entry ID');
        return;
      }

      if (!newTitle || newTitle.trim() === '') {
        console.error('Empty title provided');
        Alert.alert('Error', 'Title cannot be empty');
        return;
      }

      const entryRef = doc(db, 'users', auth.currentUser.uid, 'diaries', id);
      console.log('Updating Firestore document:', entryRef.path);

      await updateDoc(entryRef, {
        title: newTitle.trim()
      });
      
      console.log('Firestore update successful');

      // Update local state
      setEntries(prevEntries => {
        const updated = prevEntries.map(entry => 
          entry.id === id ? { ...entry, title: newTitle.trim() } : entry
        );
        console.log('Local state updated:', 
          updated.find(entry => entry.id === id)?.title
        );
        return updated;
      });

      setEditingId(null);
      setEditingTitle('');
      console.log('Edit state reset');

    } catch (error) {
      console.error('Error updating title:', error);
      console.error('Error details:', {
        userId: auth.currentUser?.uid,
        entryId: id,
        newTitle: newTitle
      });
      Alert.alert(
        'Error', 
        'Failed to update entry title. Please check console for details.'
      );
    }
  };

  const deleteEntry = async (id) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to delete entries');
        return;
      }

      await deleteDoc(doc(db, 'users', userId, 'diaries', id));
      
      // Update local state
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
      
      // Close any open swipe actions
      if (activeSwipeRef) {
        activeSwipeRef.close();
        setActiveSwipeRef(null);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteEntry(id)
        }
      ]
    );
  };

  const renderRightActions = useCallback((progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Animated.View style={[styles.deleteButtonContent, { transform: [{ scale }] }]}>
          <Ionicons name="trash-outline" size={30} color="red" />
        </Animated.View>
      </RectButton>
    );
  }, []);

  // Memoize the renderItem function
  const renderItem = useCallback(({ item }) => (
    <Swipeable
      ref={ref => {
        if (ref && item.id === editingId) {
          setActiveSwipeRef(ref);
        }
      }}
      renderRightActions={(progress, dragX) => 
        renderRightActions(progress, dragX, item)
      }
      rightThreshold={-80}
      overshootRight={false}  // Prevent full swipe
    >
      <TouchableOpacity 
        style={styles.entryCard}
        onPress={() => {
          if (editingId) {
            setEditingId(null);
            setEditingTitle(originalTitle);
          } else {
            navigation.navigate('DiaryView', {
              id: item.id,
              title: item.title || 'Untitled Entry',
              date: item.date,
              timeOfDay: item.timeOfDay,
              diaryEntry: item.generatedEntry,
              createdAt: item.createdAt,
            });
          }
        }}
      >
        <View style={styles.entryContent}>
          {editingId === item.id ? (
            // Edit mode
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editingTitle}
                onChangeText={text => setEditingTitle(text)}
                onBlur={() => {
                  setEditingId(null);
                  setEditingTitle(originalTitle);
                }}
                autoFocus
                returnKeyType="done"
              />
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  if (editingTitle.trim() !== '') {
                    updateEntryTitle(item.id, editingTitle);
                    setOriginalTitle('');
                  }
                  setEditingId(null);
                }}
                style={styles.checkIcon}
              >
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            // View mode
            <View style={styles.titleContainer}>
              <Text 
                style={styles.entryTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title || 'Untitled Entry'}
              </Text>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  setEditingId(item.id);
                  setEditingTitle(item.title || '');
                  setOriginalTitle(item.title || '');
                }}
                style={styles.editIcon}
              >
                <Ionicons name="pencil" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.entryDetails}>
            {item.dayOfWeek} {item.timeOfDay} • {item.date}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  ), [editingId, editingTitle, originalTitle, navigation]);

  // Sort button component
  const SortButton = () => (
    <TouchableOpacity 
      style={styles.sortButton}
      onPress={() => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
      }}
    >
      <Ionicons 
        name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} 
        size={20} 
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );

  // Main render
  return (
    <View style={styles.container}>
      <GradientBackground />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Diary</Text>
          <View style={styles.headerControls}>
            {viewMode === 'list' && <SortButton />}
            <ViewToggle />
          </View>
        </View>

        {viewMode === 'list' ? (
          <ListView />
        ) : (
          <CalendarView />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  toggleContainer: {
    alignItems: 'center',
  },
  toggle: {
    width: 80,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    padding: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  toggleIOS: {
    height: 38,
    padding: 3,
  },
  toggleIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    zIndex: 1,
  },
  toggleSlider: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    zIndex: 2,
  },
  toggleSliderIOS: {
    width: 32,
    height: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: 20,
  },
  entryCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: '5%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  entryContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    marginRight: 8,
    fontFamily: theme.fonts.semiBold,
  },
  entryDetails: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
    fontFamily: theme.fonts.light,
  },
  selectedDateContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    flex: 1,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  selectedDateList: {
    paddingTop: 8,
  },
  noEntriesText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 20,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Space between sort button and toggle
  },
  sortButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editIcon: {
    padding: 8,
  },
  editInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    minHeight: 30,
    marginRight: 8, // Add space between input and check icon
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    padding: 4,
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  deleteButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: theme.spacing.medium,
    backgroundColor: 'transparent',
  },
  subtitle: {
    fontSize: theme.fontSize.small,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 0,
    marginTop: 0,
    fontFamily: theme.fonts.medium,
  },
  loadingMore: {
    paddingVertical: theme.spacing.medium,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  }
});

export default Diary;