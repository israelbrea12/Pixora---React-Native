// src/navigation/types.ts

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Photo } from '../api/UnsplashApiClient';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// --- ÚNICO PARAMLIST PARA EL STACK RAÍZ ---
// Define TODAS las pantallas de la aplicación.
export type RootStackParamList = {
    MainTabs: NavigatorScreenParams<TabParamList>; // La pantalla que contiene el TabNavigator
    photoDetails: { photo: Photo };
    SaveToList: { photo: Photo };
    PhotoListDetail: { listId: number; listName: string };
    AddPhoto: { imageUri: string };
};

// Define las pestañas del navegador inferior
export type TabParamList = {
    HomeTab: undefined;
    SearchTab: undefined;
    AddTab: undefined;
    ActivityTab: undefined;
    SettingsTab: undefined;
};

// Define las pestañas del navegador superior en el perfil
export type ProfileTabParamList = {
    MyPhotos: { title: string };
    Lists: undefined; // No necesita params
    Favorites: undefined;
};

// --- TIPOS DE PROPS PARA CADA PANTALLA ---
// Usaremos 'CompositeScreenProps' para que las pantallas anidadas conozcan las rutas del navegador raíz.

export type HomeScreenProps = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'HomeTab'>,
    NativeStackScreenProps<RootStackParamList>
>;
export type SearchScreenProps = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'SearchTab'>,
    NativeStackScreenProps<RootStackParamList>
>;
export type ProfileScreenProps = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'SettingsTab'>,
    NativeStackScreenProps<RootStackParamList>
>;
export type ListsScreenProps = CompositeScreenProps<
    MaterialTopTabScreenProps<ProfileTabParamList, 'Lists'>,
    NativeStackScreenProps<RootStackParamList>
>;

export type ActivityScreenProps = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'ActivityTab'>,
    NativeStackScreenProps<RootStackParamList>
>;

export type FavoritesScreenProps = CompositeScreenProps<
    MaterialTopTabScreenProps<ProfileTabParamList, 'Favorites'>,
    NativeStackScreenProps<RootStackParamList>
>;

export type PhotoDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'photoDetails'>;
export type SaveToListScreenProps = NativeStackScreenProps<RootStackParamList, 'SaveToList'>;
export type PhotoListDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PhotoListDetail'>;

// Props para las pantallas Placeholder (pueden ser genéricas)
export type PlaceholderScreenProps = CompositeScreenProps<
    BottomTabScreenProps<TabParamList>,
    NativeStackScreenProps<RootStackParamList>
>;

export type AddPhotoScreenProps = NativeStackScreenProps<RootStackParamList, 'AddPhoto'>;

export type MyPhotosScreenProps = CompositeScreenProps<
    MaterialTopTabScreenProps<ProfileTabParamList, 'MyPhotos'>,
    NativeStackScreenProps<RootStackParamList>
>;
