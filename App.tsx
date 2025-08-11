// App.tsx

import React, { Component } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicon from 'react-native-vector-icons/Ionicons';

// --- CAMBIO: Importamos los tipos de ParamList ---
import { MainStackParamList, PlaceholderStackParamList } from './navigation/types';

import HomeScreen from './screens/HomeScreen';
import SearchPhotosList from './screens/SearchPhotosList';
import PhotoDetails from './screens/PhotoDetails';
import PlaceholderScreen from './screens/PlaceholderScreen';
import ProfileScreen from './screens/ProfileScreen';

// --- CAMBIO: Aplicamos los tipos a los navegadores ---
const MainStack = createNativeStackNavigator<MainStackParamList>();
const PlaceholderStack = createNativeStackNavigator<PlaceholderStackParamList>();
const Tab = createBottomTabNavigator();

// Stacks para las pestañas principales
const HomeStack = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="home" component={HomeScreen} options={{ title: 'Pixora' }} />
    <MainStack.Screen name="photoDetails" component={PhotoDetails} options={{ headerShown: false }} />
  </MainStack.Navigator>
);

const SearchStack = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="searchList" component={SearchPhotosList} options={{ title: 'Buscar' }} />
    <MainStack.Screen name="photoDetails" component={PhotoDetails} options={{ headerShown: false }} />
  </MainStack.Navigator>
);

// Stacks para las pantallas placeholder
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

const SettingsStack = () => (
  <MainStack.Navigator>
    <MainStack.Screen
      name="profile" // Usamos el nombre que añadimos a MainStackParamList
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    {/* Y muy importante, le damos acceso a photoDetails */}
    <MainStack.Screen
      name="photoDetails"
      component={PhotoDetails}
      options={{ headerShown: false }}
    />
  </MainStack.Navigator>
);


interface AppState {
  initialRouteName: string | null;
}

export default class App extends Component<{}, AppState> {

  public constructor(props: {}) {
    super(props);
    this.state = {
      initialRouteName: null,
    };
  }

  public componentDidMount() {
    AsyncStorage.getItem('lastSelectedTab').then(lastSelectedTab => {
      this.setState({ initialRouteName: lastSelectedTab || 'HomeTab' });
    });
  }

  private handleTabPress = (tabName: string) => {
    AsyncStorage.setItem('lastSelectedTab', tabName);
  };

  public render() {
    if (this.state.initialRouteName === null) {
      // Muestra una vista de carga mientras se obtiene la pestaña inicial
      return <View />;
    }

    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName={this.state.initialRouteName}
          screenOptions={{ headerShown: false }}>
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            listeners={{ tabPress: () => this.handleTabPress('HomeTab') }}
            options={{
              tabBarLabel: 'Inicio',
              tabBarIcon: ({ color, size }) => <Ionicon name="home" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="SearchTab"
            component={SearchStack}
            listeners={{ tabPress: () => this.handleTabPress('SearchTab') }}
            options={{
              tabBarLabel: 'Buscar',
              tabBarIcon: ({ color, size }) => <Ionicon name="search" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="AddTab"
            component={AddStack}
            listeners={{ tabPress: () => this.handleTabPress('AddTab') }}
            options={{
              tabBarLabel: 'Añadir',
              tabBarIcon: ({ color, size }) => <Ionicon name="add-circle" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="ActivityTab"
            component={ActivityStack}
            listeners={{ tabPress: () => this.handleTabPress('ActivityTab') }}
            options={{
              tabBarLabel: 'Actividad',
              tabBarIcon: ({ color, size }) => <Ionicon name="heart" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="SettingsTab"
            component={SettingsStack}
            listeners={{ tabPress: () => this.handleTabPress('SettingsTab') }}
            options={{
              tabBarLabel: 'Ajustes',
              tabBarIcon: ({ color, size }) => <Ionicon name="settings" size={size} color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}