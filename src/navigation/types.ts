// src/navigation/types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Photo } from '../api/UnsplashApiClient';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';


// --- NUEVO: Pila Raíz que contiene las pestañas y los modales globales ---
export type RootStackParamList = {
    MainTabs: NavigatorScreenParams<TabParamList>; // Contendrá todo el TabNavigator
    SaveToList: { photo: Photo };
    photoDetails: { photo: Photo }; // Mantenemos photoDetails aquí también para acceso global
};

// --- CAMBIO: Esta es ahora la lista de parámetros para el TabNavigator ---
export type TabParamList = {
    HomeTab: undefined;
    SearchTab: undefined;
    AddTab: undefined;
    ActivityTab: undefined;
    SettingsTab: undefined;
}

// Define qué pantallas hay DENTRO de los stacks de cada pestaña
export type MainStackParamList = {
    home: undefined;
    searchList: undefined;
    // photoDetails se mueve a la pila raíz para que sea accesible desde cualquier stack
    // SaveToList también se ha movido
    profile: undefined;
};

export type PlaceholderStackParamList = {
    add: { title: string };
    activity: { title: string };
    settings: { title: string }; // <-- Esta línea podría quedarse o irse
};

// --- Tipos para el TopTabNavigator del Perfil (sin cambios) ---
export type ProfileTabParamList = {
    MyPhotos: { title: string };
    Lists: { title: string };
    Favorites: undefined;
};

// --- ACTUALIZAR TIPOS DE PROPS ---
// Prop para la pantalla de detalles, ahora referenciando la RootStack
export type PhotoDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'photoDetails'>;

// Prop para la pantalla de guardar en lista, también referenciando la RootStack
export type SaveToListScreenProps = NativeStackScreenProps<RootStackParamList, 'SaveToList'>;

// (HomeScreenProps, SearchScreenProps, etc. pueden seguir referenciando MainStackParamList si las pantallas están anidadas)
export type HomeScreenProps = CompositeScreenProps<
    NativeStackScreenProps<MainStackParamList, 'home'>,
    NativeStackScreenProps<RootStackParamList>
>;
export type SearchScreenProps = CompositeScreenProps<
    NativeStackScreenProps<MainStackParamList, 'searchList'>,
    NativeStackScreenProps<RootStackParamList>
>;

// El resto de tipos...
export type PlaceholderScreenProps = NativeStackScreenProps<PlaceholderStackParamList>;
export type FavoritesScreenProps = CompositeScreenProps<
    MaterialTopTabScreenProps<ProfileTabParamList, 'Favorites'>,
    NativeStackScreenProps<MainStackParamList>
>;