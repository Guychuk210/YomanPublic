// src/navigation/RootNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Login from '../screens/Login';
import Register from '../screens/Register';
import TabNavigator from './TabNavigator';
import AfterRecord from '../screens/AfterRecord';
import DiaryView from '../screens/DiaryView';
import Memory from '../screens/Memory';
import { theme } from '../styles/theme';

console.log("I'm in the RootNavigator file");

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="MainApp" component={TabNavigator} />
          <Stack.Screen name="AfterRecord" component={AfterRecord} />
          <Stack.Screen name="Memory" component={Memory} options={{ headerShown: false }} />
          <Stack.Screen 
            name="DiaryView" 
            component={DiaryView}
            options={{
              headerShown: true,
              title: 'Diary Entry',
              headerStyle: {
                backgroundColor: theme.colors.secondary,
              },
              headerTintColor: theme.colors.text,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default RootNavigator;