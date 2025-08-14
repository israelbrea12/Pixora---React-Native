// App.tsx

import React, { Component } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutProvider } from './src/context/LayoutContext';
import { MenuProvider } from 'react-native-popup-menu';
import { initDB } from './src/services/DatabaseManager';

import { RootStackParamList, TabParamList } from './src/navigation/types';

import HomeScreen from './src/screens/HomeScreen';
import SearchPhotosList from './src/screens/SearchPhotosList';
import PhotoDetails from './src/screens/PhotoDetails';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SaveToListScreen from './src/screens/SaveToListScreen';
import PhotoListDetailScreen from './src/screens/PhotoListDetailScreen';
import Ionicon from 'react-native-vector-icons/Ionicons';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Componente que define el navegador de pestañas inferior
 */
const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicon name="home" size={size} color={color} /> }} />
    <Tab.Screen name="SearchTab" component={SearchPhotosList} options={{ title: 'Buscar', tabBarIcon: ({ color, size }) => <Ionicon name="search" size={size} color={color} /> }} />
    <Tab.Screen name="AddTab" component={PlaceholderScreen} options={{ title: 'Añadir', tabBarIcon: ({ color, size }) => <Ionicon name="add-circle" size={size} color={color} /> }} />
    <Tab.Screen name="ActivityTab" component={PlaceholderScreen} options={{ title: 'Actividad', tabBarIcon: ({ color, size }) => <Ionicon name="heart" size={size} color={color} /> }} />
    <Tab.Screen name="SettingsTab" component={ProfileScreen} options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicon name="person-circle" size={size} color={color} /> }} />
  </Tab.Navigator>
);

export default class App extends Component {
  constructor(props: {}) {
    super(props);
    initDB();
  }

  render() {
    return (
      <LayoutProvider>
        <MenuProvider>
          <NavigationContainer>
            <RootStack.Navigator>
              {/* Pantalla principal que contiene todas las pestañas */}
              <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

              {/* Pantallas a las que se puede navegar desde cualquier sitio */}
              <RootStack.Screen name="photoDetails" component={PhotoDetails} options={{ headerShown: false }} />
              <RootStack.Screen name="PhotoListDetail" component={PhotoListDetailScreen} />

              {/* Pantallas que se presentan como un modal */}
              <RootStack.Group screenOptions={{ presentation: 'modal' }}>
                <RootStack.Screen name="SaveToList" component={SaveToListScreen} options={{ title: 'Guardar en...' }} />
              </RootStack.Group>
            </RootStack.Navigator>
          </NavigationContainer>
        </MenuProvider>
      </LayoutProvider>
    );
  }
}