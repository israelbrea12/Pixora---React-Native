// src/i18n/LocalizationManager.ts
import { I18n } from 'i18n-js';
import * as RNLocalize from 'react-native-localize';
import { saveLanguage, getLanguage, Language } from '../services/PreferencesManager';
import es from './es';
import en from './en';

// Creamos la instancia de i18n
const i18n = new I18n({ es, en });

// Array de listeners para notificar a la app de cambios
let onLanguageChangeListeners: (() => void)[] = [];

/**
 * Inicializa el sistema de localización.
 * Debe llamarse al inicio de la app.
 */
export const initLocalization = async () => {
    // 1. Obtiene el idioma guardado por el usuario
    const savedLang = await getLanguage();

    if (savedLang) {
        // Si hay un idioma guardado, lo usamos
        i18n.locale = savedLang;
    } else {
        // Si no, detectamos el mejor idioma del dispositivo
        const bestLocale = RNLocalize.findBestLanguageTag(Object.keys(i18n.translations));
        i18n.locale = bestLocale?.languageTag || 'es';
    }
};

/**
 * Cambia el idioma de la aplicación.
 * @param lang El nuevo idioma ('es' o 'en')
 */
export const setLanguage = async (lang: Language) => {
    i18n.locale = lang; // Cambia el idioma en la instancia de i18n
    await saveLanguage(lang); // Guarda la preferencia

    // Notifica a todos los listeners para que la app se actualice
    onLanguageChangeListeners.forEach(listener => listener());
};

/**
 * Permite a los componentes suscribirse a los cambios de idioma.
 * @param listener La función a llamar cuando el idioma cambie.
 * @returns Una función para desuscribirse.
 */
export const onLanguageChange = (listener: () => void) => {
    onLanguageChangeListeners.push(listener);
    return () => {
        onLanguageChangeListeners = onLanguageChangeListeners.filter(l => l !== listener);
    };
};

export default i18n;