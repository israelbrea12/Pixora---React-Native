// src/services/PreferencesManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Modo de visualización
export type LayoutMode = 'masonry' | 'list';

const LAYOUT_MODE_KEY = 'user_layout_preference';

export const saveLayoutMode = async (mode: LayoutMode): Promise<void> => {
    try {
        await AsyncStorage.setItem(LAYOUT_MODE_KEY, mode);
    } catch (e) {
        console.error("Failed to save layout mode.", e);
    }
};

export const getLayoutMode = async (): Promise<LayoutMode> => {
    try {
        const mode = await AsyncStorage.getItem(LAYOUT_MODE_KEY);
        // Devuelve el modo guardado, o 'masonry' por defecto si no hay nada.
        return (mode as LayoutMode) || 'masonry';
    } catch (e) {
        console.error("Failed to fetch layout mode.", e);
        return 'masonry'; // Devuelve el modo por defecto en caso de error
    }
};

// -------------------------------------------------------------------------------------
// Preferencias de idioma
export type Language = 'es' | 'en';

const LANGUAGE_KEY = 'user_language_preference';

export const saveLanguage = async (language: Language): Promise<void> => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (e) {
        console.error("Failed to save language.", e);
    }
};

export const getLanguage = async (): Promise<Language | null> => {
    try {
        const language = await AsyncStorage.getItem(LANGUAGE_KEY);
        return language as Language | null;
    } catch (e) {
        console.error("Failed to fetch language.", e);
        return null;
    }
};