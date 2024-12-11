// src/navigation/index.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import Settings from '../screens/Settings';
import Record from '../screens/Record';

const Stack = createNativeStackNavigator();

console.log("I'm in the navigation file");

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Logged in screens
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Record" component={Record} />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen 
              name="Login" 
              component={Login} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={Register} 
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  }
});