// App.tsx

import React, { Component, JSX } from 'react';
import { Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicon from 'react-native-vector-icons/Ionicons';

// Importamos los nuevos componentes
import NewPhotosList from './screens/NewPhotosList';
import SearchPhotosList from './screens/SearchPhotosList';
import PhotoDetails from './screens/PhotoDetails';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

interface AppState {
  ready: boolean;
}

interface AppProps { }

export default class App extends Component<AppProps, AppState> {
  private newPhotosStack!: () => JSX.Element;
  private searchPhotosStack!: () => JSX.Element;
  private mainTab!: () => JSX.Element;
  private navigationContainer!: () => JSX.Element;

  public constructor(props: AppProps) {
    super(props);
    this.state = {
      ready: false,
    };
  }

  public async componentDidMount() {
    AsyncStorage.getItem('lastSelectedTab').then(lastSelectedTab => {
      this.createMainNavigation(lastSelectedTab);
    });
  }

  private createMainNavigation(initialTab: string | null) {
    if (initialTab === null) {
      initialTab = 'newPhotos';
    }

    this.newPhotosStack = () => {
      return (
        <Stack.Navigator>
          <Stack.Screen name="photoList" component={NewPhotosList as any} />
          <Stack.Screen name="photoDetails" component={PhotoDetails as any} />
        </Stack.Navigator>
      );
    };

    this.searchPhotosStack = () => {
      return (
        <Stack.Navigator>
          <Stack.Screen name="searchList" component={SearchPhotosList as any} />
          <Stack.Screen name="photoDetails" component={PhotoDetails as any} />
        </Stack.Navigator>
      );
    };

    this.mainTab = () => {
      const tabBarOnPress = (tabName: string) => {
        return () => {
          AsyncStorage.setItem('lastSelectedTab', tabName);
        };
      };

      return (
        <Tab.Navigator initialRouteName={initialTab}>
          <Tab.Screen
            name="newPhotos"
            component={this.newPhotosStack}
            listeners={{ tabPress: tabBarOnPress('newPhotos') }}
            options={{
              headerShown: false,
              tabBarLabel: 'Novedades',
              tabBarIcon: ({ color, size }) => (
                <Ionicon name="sparkles" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="searchPhotos"
            component={this.searchPhotosStack}
            listeners={{ tabPress: tabBarOnPress('searchPhotos') }}
            options={{
              headerShown: false,
              tabBarLabel: 'Buscar',
              tabBarIcon: ({ color, size }) => (
                <Ionicon name="search" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      );
    };

    this.navigationContainer = () => {
      return (
        <NavigationContainer>
          <this.mainTab />
        </NavigationContainer>
      );
    };

    this.setState({ ready: true });
  }

  public render() {
    return this.state.ready ? <this.navigationContainer /> : <View />;
  }
}