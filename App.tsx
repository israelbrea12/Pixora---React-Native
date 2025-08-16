// App.tsx

import React, { Component, useState } from 'react';
import { View, Alert } from 'react-native';
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

  const handleLaunchGallery = () => {
    setSheetVisible(false); // Cerramos el sheet
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'No se pudo seleccionar la imagen.');
      } else if (response.assets && response.assets[0].uri) {
        navigation.navigate('AddPhoto', { imageUri: response.assets[0].uri });
      }
    });
  };

  const handleLaunchCamera = () => {
    setSheetVisible(false);
    launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
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