// src/navigation/TabNavigator.js
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home';
import Record from '../screens/Record';  // Changed from RecordScreen
import Settings from '../screens/Settings';  // Changed from SettingsScreen
import { theme } from '../styles/theme';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerStyle: {
          height: 30,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          backgroundColor: theme.colors.background,
        },
        headerTitle: '',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Record') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    > 
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Record"
        component={Record}
        options={{
          title: 'Record',
        }}
      />
      <Tab.Screen 
        name="Settings"
        component={Settings}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;