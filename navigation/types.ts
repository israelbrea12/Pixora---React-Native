// src/navigation/types.ts

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Photo } from '../api/UnsplashApiClient';

// Define qué pantallas hay en los stacks principales y qué parámetros esperan.
// 'undefined' significa que la pantalla no recibe parámetros.
// Probablemente tengas algo así:
export type MainStackParamList = {
    home: undefined;
    searchList: undefined;
    photoDetails: { photo: Photo };
    // --- AÑADE LA NUEVA PANTALLA DE PERFIL AQUÍ ---
    profile: undefined;
};

// Y aquí, puedes eliminar la de settings si ya no la usarás para otra cosa
export type PlaceholderStackParamList = {
    add: { title: string };
    activity: { title: string };
    settings: { title: string }; // <-- Esta línea podría quedarse o irse
};


// Crea tipos de props específicos para cada pantalla para usarlos en los componentes.
// Esto nos dará tipado estricto para 'navigation' y 'route'.
export type HomeScreenProps = NativeStackScreenProps<MainStackParamList, 'home'>;
export type SearchScreenProps = NativeStackScreenProps<MainStackParamList, 'searchList'>;
export type PhotoDetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'photoDetails'>;
export type PlaceholderScreenProps = NativeStackScreenProps<PlaceholderStackParamList>;