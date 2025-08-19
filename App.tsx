import React, { Component, useState } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutProvider } from './src/context/LayoutContext';
import { MenuProvider } from 'react-native-popup-menu';
import { initDB } from './src/services/DatabaseManager';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import InAppSplash from './src/components/InAppSplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList, TabParamList } from './src/navigation/types';
import { initLocalization, onLanguageChange } from './src/i18n/LocalizationManager';
import i18n from './src/i18n/LocalizationManager';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import PhotoDetailsScreen from './src/screens/PhotoDetailsScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SaveToListScreen from './src/screens/SaveToListScreen';
import PhotoListDetailScreen from './src/screens/PhotoListDetailScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import AddPhotoScreen from './src/screens/AddPhotoScreen';
import AddPhotoBottomSheet from './src/components/AddPhotoBottomSheet';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  const [isSheetVisible, setSheetVisible] = useState(false);
  const navigation = useNavigation<any>();

  const requestPermission = async (permission: any): Promise<boolean> => {
    try {
      const result = await check(permission);
      switch (result) {
        case RESULTS.GRANTED: return true;
        case RESULTS.LIMITED: return true;
        case RESULTS.DENIED:
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        case RESULTS.BLOCKED:
          Alert.alert(
            i18n.t('permissionDenied'),
            i18n.t('cameraPermissionPermanentlyDeniedMessage'),
            [
              { text: i18n.t('cancel'), style: 'cancel' },
              { text: i18n.t('openSettings'), onPress: () => Linking.openSettings() },
            ],
          );
          return false;
        case RESULTS.UNAVAILABLE:
          Alert.alert('Error', 'Esta función no está disponible en tu dispositivo.');
          return false;
      }
    } catch (error) {
      console.error("Error requesting permission", error);
      return false;
    }
    return false;
  };

  const handleLaunchGallery = async () => {
    setSheetVisible(false);
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY
      : (Number(Platform.Version) >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    const hasPermission = await requestPermission(permission);
    if (!hasPermission) return;
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
    if (!result.didCancel && result.assets && result.assets[0].uri) {
      navigation.navigate('AddPhoto', { imageUri: result.assets[0].uri });
    }
  };

  const handleLaunchCamera = async () => {
    setSheetVisible(false);
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const hasPermission = await requestPermission(permission);
    if (!hasPermission) return;
    setTimeout(async () => {
      const result = await launchCamera({ mediaType: 'photo', saveToPhotos: true, quality: 1 });
      if (result.errorCode) {
        Alert.alert(`Error: ${result.errorCode}`, result.errorMessage || 'Ocurrió un error.');
      } else if (!result.didCancel && result.assets && result.assets[0].uri) {
        navigation.navigate('AddPhoto', { imageUri: result.assets[0].uri });
      }
    }, 200);
  };

  return (
    <>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: i18n.t('home'), tabBarIcon: ({ color, size }) => <Ionicon name="home" size={size} color={color} /> }} />
        <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: i18n.t('search'), tabBarIcon: ({ color, size }) => <Ionicon name="search" size={size} color={color} /> }} />
        <Tab.Screen
          name="AddTab"
          component={PlaceholderScreen}
          options={{ title: i18n.t('add'), tabBarIcon: ({ color, size }) => <Ionicon name="add-circle" size={size} color={color} /> }}
          listeners={{ tabPress: e => { e.preventDefault(); setSheetVisible(true); }, }}
        />
        <Tab.Screen name="ActivityTab" component={ActivityScreen} options={{ title: i18n.t('activity'), tabBarIcon: ({ color, size }) => <Ionicon name="heart" size={size} color={color} /> }} />
        <Tab.Screen name="SettingsTab" component={ProfileScreen} options={{ title: i18n.t('profile'), tabBarIcon: ({ color, size }) => <Ionicon name="person-circle" size={size} color={color} /> }} />
      </Tab.Navigator>
      <AddPhotoBottomSheet
        isVisible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        onLaunchCamera={handleLaunchCamera}
        onLaunchGallery={handleLaunchGallery}
      />
    </>
  );
};

interface AppState {
  isDataReady: boolean;
  isSplashFinished: boolean;
  appKey: number;
}

export default class App extends Component<{}, AppState> {
  private unsubscribeFromLangChange?: () => void;

  public constructor(props: {}) {
    super(props);
    this.state = {
      isDataReady: false,
      isSplashFinished: false,
      appKey: 0,
    };
    initDB();
    initLocalization().then(() => {
      this.setState({ isDataReady: true });
    });
  }

  public componentDidMount() {
    this.unsubscribeFromLangChange = onLanguageChange(() => {
      this.setState(prevState => ({ appKey: prevState.appKey + 1 }));
    });
  }

  public componentWillUnmount() {
    if (this.unsubscribeFromLangChange) {
      this.unsubscribeFromLangChange();
    }
  }

  private handleSplashFinish = () => {
    this.setState({ isSplashFinished: true });
  };

  public render() {
    const { isDataReady, isSplashFinished, appKey } = this.state;
    const isAppReady = isDataReady && isSplashFinished;

    if (!isAppReady) {
      return <InAppSplash onFinished={this.handleSplashFinish} />;
    }

    return (
      <SafeAreaProvider>
        <NavigationContainer key={appKey}>
          <LayoutProvider>
            <MenuProvider>
              <RootStack.Navigator>
                <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
                <RootStack.Screen name="photoDetails" component={PhotoDetailsScreen} options={{ headerShown: false }} />
                <RootStack.Screen name="PhotoListDetail" component={PhotoListDetailScreen} />
                <RootStack.Group screenOptions={{ presentation: 'modal' }}>
                  <RootStack.Screen name="SaveToList" component={SaveToListScreen} options={{ title: i18n.t('saveTo') }} />
                  <RootStack.Screen name="AddPhoto" component={AddPhotoScreen} options={{ title: i18n.t('newPhoto') }} />
                </RootStack.Group>
              </RootStack.Navigator>
            </MenuProvider>
          </LayoutProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}