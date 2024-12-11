// src/screens/Home.js
import { theme } from '../styles/theme';
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

// mock data - replace with real data later
const mockEntries = [
  { id: '1', title: 'Today was great', date: '2024-03-09', duration: '2:30' },
  { id: '2', title: 'Morning thoughts', date: '2024-03-08', duration: '1:45' },
];

export default function Home({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.entryCard}>
      <Text style={styles.entryTitle}>{item.title}</Text>
      <Text style={styles.entryDetails}>{item.date} • {item.duration}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Diary Entries</Text>
      </View>
      <FlatList
        data={mockEntries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
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
    entryCard: {
      backgroundColor: theme.colors.cardBg,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      marginBottom: theme.spacing.small,
      ...theme.shadows.small,
    },
    entryTitle: {
      fontSize: theme.fontSize.normal,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    entryDetails: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.small,
    },
  });