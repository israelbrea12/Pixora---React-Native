// src/services/PreferencesManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

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