import React, { Component } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { LayoutProvider } from './src/context/LayoutContext';
import { MenuProvider } from 'react-native-popup-menu';
import { initDB } from './src/services/DatabaseManager';

// --- CAMBIO 1: Importamos los nuevos tipos ---
import { RootStackParamList, MainStackParamList, PlaceholderStackParamList, TabParamList } from './src/navigation/types';

import HomeScreen from './src/screens/HomeScreen';
import SearchPhotosList from './src/screens/SearchPhotosList';
import PhotoDetails from './src/screens/PhotoDetails';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SaveToListScreen from './src/screens/SaveToListScreen'; // El .tsx es redundante

// --- CAMBIO 2: Creamos los navegadores con los tipos correctos ---
const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const PlaceholderStack = createNativeStackNavigator<PlaceholderStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// --- CAMBIO 3: Mantenemos los Stacks de cada pestaña simples ---
// Ahora PhotoDetails será una pantalla global, no anidada aquí
const HomeStack = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="home" component={HomeScreen} options={{ title: 'Pixora' }} />
  </MainStack.Navigator>
);

const SearchStack = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="searchList" component={SearchPhotosList} options={{ title: 'Buscar' }} />
  </MainStack.Navigator>
);

const AddStack = () => (
  <PlaceholderStack.Navigator>
    <PlaceholderStack.Screen name="add" component={PlaceholderScreen} initialParams={{ title: 'Añadir' }} options={{ title: 'Añadir' }} />
  </PlaceholderStack.Navigator>
);

const ActivityStack = () => (
  <PlaceholderStack.Navigator>
    <PlaceholderStack.Screen name="activity" component={PlaceholderScreen} initialParams={{ title: 'Actividad' }} options={{ title: 'Actividad' }} />
  </PlaceholderStack.Navigator>
);

// El stack de ajustes ahora solo contiene el perfil.
const SettingsStack = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="profile" component={ProfileScreen} options={{ headerShown: false }} />
  </MainStack.Navigator>
);

// --- CAMBIO 4: Creamos un componente para el TabNavigator ---
const MainTabNavigator = () => {
  // La lógica de estado para la pestaña inicial puede vivir aquí si es necesario,
  // o puedes pasarla como prop desde App.
  // Por simplicidad, la movemos a App y pasamos initialRouteName.

  const handleTabPress = (tabName: keyof TabParamList) => {
    AsyncStorage.setItem('lastSelectedTab', tabName);
  };

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        listeners={{ tabPress: () => handleTabPress('HomeTab') }}
        options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicon name="home" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        listeners={{ tabPress: () => handleTabPress('SearchTab') }}
        options={{ tabBarLabel: 'Buscar', tabBarIcon: ({ color, size }) => <Ionicon name="search" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddStack}
        listeners={{ tabPress: () => handleTabPress('AddTab') }}
        options={{ tabBarLabel: 'Añadir', tabBarIcon: ({ color, size }) => <Ionicon name="add-circle" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityStack}
        listeners={{ tabPress: () => handleTabPress('ActivityTab') }}
        options={{ tabBarLabel: 'Actividad', tabBarIcon: ({ color, size }) => <Ionicon name="heart" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        listeners={{ tabPress: () => handleTabPress('SettingsTab') }}
        options={{ tabBarLabel: 'Ajustes', tabBarIcon: ({ color, size }) => <Ionicon name="settings" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
};


interface AppState {
  isReady: boolean; // Usaremos un solo booleano para saber si estamos listos
}

export default class App extends Component<{}, AppState> {

  public constructor(props: {}) {
    super(props);
    this.state = {
      isReady: false,
    };
    initDB();
  }

  public componentDidMount() {
    // Puedes dejar la lógica de `AsyncStorage` aquí o moverla si es necesario
    // Por ahora, simplemente marcaremos la app como lista.
    this.setState({ isReady: true });
  }

  public render() {
    if (!this.state.isReady) {
      return <View />; // Vista de carga
    }

    // --- CAMBIO 5: El render principal ahora usa el RootStack ---
    return (
      <LayoutProvider>
        <MenuProvider>
          <NavigationContainer>
            <RootStack.Navigator>
              {/* Grupo para las pantallas principales de la app */}
              <RootStack.Group>
                <RootStack.Screen
                  name="MainTabs"
                  component={MainTabNavigator}
                  options={{ headerShown: false }}
                />
                <RootStack.Screen
                  name="photoDetails"
                  component={PhotoDetails}
                  options={{ headerShown: false }}
                />
              </RootStack.Group>

              {/* Grupo para las pantallas que se presentan como modales */}
              <RootStack.Group screenOptions={{ presentation: 'modal' }}>
                <RootStack.Screen
                  name="SaveToList"
                  component={SaveToListScreen}
                />
              </RootStack.Group>
            </RootStack.Navigator>
          </NavigationContainer>
        </MenuProvider>
      </LayoutProvider>
    );
  }
}