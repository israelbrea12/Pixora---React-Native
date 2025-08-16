// App.tsx

import React, { Component, useState } from 'react';
import { View, Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutProvider } from './src/context/LayoutContext';
import { MenuProvider } from 'react-native-popup-menu';
import { initDB } from './src/services/DatabaseManager';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { RootStackParamList, TabParamList } from './src/navigation/types';
// Update the import path below if the actual file name or folder structure is different (e.g., 'localizationManager' or 'localization-manager')
import { initLocalization, onLanguageChange } from './src/i18n/LocalizationManager';
import i18n from './src/i18n/LocalizationManager'; // Asegúrate de que la ruta sea correcta

import HomeScreen from './src/screens/HomeScreen';
import SearchPhotosList from './src/screens/SearchPhotosList';
import PhotoDetails from './src/screens/PhotoDetails';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SaveToListScreen from './src/screens/SaveToListScreen';
import PhotoListDetailScreen from './src/screens/PhotoListDetailScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import AddPhotoScreen from './src/screens/AddPhotoScreen'; // --- NUEVO IMPORT ---
import AddPhotoBottomSheet from './src/components/AddPhotoBottomSheet';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

interface AppState {
  isReady: boolean;
  appKey: number; // Esta clave forzará el re-renderizado
}

/**
 * Componente que define el navegador de pestañas inferior
 */
const MainTabs = () => {
  const [isSheetVisible, setSheetVisible] = useState(false);
  const navigation = useNavigation<any>(); // Usamos 'any' para simplificar, se podría tipar mejor

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: i18n.t('cameraPermissionTitle'),
            message: i18n.t('cameraPermissionMessage'),
            buttonNeutral: i18n.t('askMeLater'),
            buttonNegative: i18n.t('cancel'),
            buttonPositive: i18n.t('accept'),
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // En iOS, la librería gestiona el permiso la primera vez.
      // Si falla, es porque el usuario ya lo ha denegado.
      return true;
    }
  };

  // --- NUEVA FUNCIÓN AUXILIAR PARA PERMISOS DE GALERÍA (Android) ---
  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // Para Android 13+ se usa READ_MEDIA_IMAGES
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission, {
          title: i18n.t('galleryPermissionTitle'),
          message: i18n.t('galleryPermissionMessage'),
          buttonPositive: i18n.t('accept'),
          buttonNegative: i18n.t('cancel'),
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  // --- MODIFICACIÓN: Hacemos la función async ---
  const handleLaunchGallery = async () => {
    setSheetVisible(false);

    // 1. Solicitamos permiso ANTES de abrir la galería
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(i18n.t('permissionDenied'), i18n.t('galleryPermissionDeniedMessage'));
      return;
    }

    // 2. Si tenemos permiso, abrimos la galería
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode === 'permission') {
        // El usuario ha denegado el permiso permanentemente
        Alert.alert(
          i18n.t('permissionDenied'),
          i18n.t('galleryPermissionPermanentlyDeniedMessage'),
          [
            { text: i18n.t('cancel'), style: 'cancel' },
            { text: i18n.t('openSettings'), onPress: () => Linking.openSettings() },
          ],
        );
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'No se pudo seleccionar la imagen.');
      } else if (response.assets && response.assets[0].uri) {
        navigation.navigate('AddPhoto', { imageUri: response.assets[0].uri });
      }
    });
  };

  // --- MODIFICACIÓN: Hacemos la función async ---
  const handleLaunchCamera = async () => {
    setSheetVisible(false);

    // 1. Solicitamos permiso ANTES de abrir la cámara
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(i18n.t('permissionDenied'), i18n.t('cameraPermissionDeniedMessage'));
      return;
    }

    // 2. Si tenemos permiso, abrimos la cámara
    launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode === 'permission') {
        // El usuario ha denegado el permiso permanentemente
        Alert.alert(
          i18n.t('permissionDenied'),
          i18n.t('cameraPermissionPermanentlyDeniedMessage'),
          [
            { text: i18n.t('cancel'), style: 'cancel' },
            { text: i18n.t('openSettings'), onPress: () => Linking.openSettings() },
          ],
        );
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
        Alert.alert('Error', 'No se pudo usar la cámara.');
      } else if (response.assets && response.assets[0].uri) {
        navigation.navigate('AddPhoto', { imageUri: response.assets[0].uri });
      }
    });
  };

  return (
    <>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: i18n.t('home'), tabBarIcon: ({ color, size }) => <Ionicon name="home" size={size} color={color} /> }} />
        <Tab.Screen name="SearchTab" component={SearchPhotosList} options={{ title: i18n.t('search'), tabBarIcon: ({ color, size }) => <Ionicon name="search" size={size} color={color} /> }} />
        <Tab.Screen
          name="AddTab"
          component={PlaceholderScreen} // Componente de relleno, nunca se mostrará
          options={{ title: i18n.t('add'), tabBarIcon: ({ color, size }) => <Ionicon name="add-circle" size={size} color={color} /> }}
          listeners={{
            tabPress: e => {
              e.preventDefault(); // Prevenimos la navegación
              setSheetVisible(true); // Abrimos nuestro BottomSheet
            },
          }}
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

export default class App extends Component<{}, AppState> {

  private unsubscribeFromLangChange?: () => void;

  public constructor(props: {}) {
    super(props);
    this.state = {
      isReady: false,
      appKey: 0, // Valor inicial
    };
    initDB();
    // Inicializamos la localización
    initLocalization().then(() => {
      this.setState({ isReady: true });
    });
  }

  public componentDidMount() {
    // --- CAMBIO 3: Nos suscribimos a los cambios de idioma ---
    this.unsubscribeFromLangChange = onLanguageChange(() => {
      // Cuando el idioma cambia, incrementamos la clave para forzar un re-render
      this.setState(prevState => ({ appKey: prevState.appKey + 1 }));
    });
  }

  public componentWillUnmount() {
    // Nos desuscribimos para evitar memory leaks
    if (this.unsubscribeFromLangChange) {
      this.unsubscribeFromLangChange();
    }
  }


  public render() {
    if (!this.state.isReady) {
      return <View />;
    }
    return (
      <NavigationContainer key={this.state.appKey}>
        <LayoutProvider>
          <MenuProvider>
            <RootStack.Navigator>
              {/* Pantalla principal que contiene todas las pestañas */}
              <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

              {/* Pantallas a las que se puede navegar desde cualquier sitio */}
              <RootStack.Screen name="photoDetails" component={PhotoDetails} options={{ headerShown: false }} />
              <RootStack.Screen name="PhotoListDetail" component={PhotoListDetailScreen} />

              {/* Pantallas que se presentan como un modal */}
              <RootStack.Group screenOptions={{ presentation: 'modal' }}>
                <RootStack.Screen name="SaveToList" component={SaveToListScreen} options={{ title: i18n.t('saveTo') }} />
                <RootStack.Screen name="AddPhoto" component={AddPhotoScreen} options={{ title: i18n.t('newPhoto') }} />
              </RootStack.Group>
            </RootStack.Navigator>
          </MenuProvider>
        </LayoutProvider>
      </NavigationContainer>
    );
  }
}