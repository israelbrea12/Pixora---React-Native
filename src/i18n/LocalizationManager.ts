import { I18n } from 'i18n-js';
import * as RNLocalize from 'react-native-localize';
import { saveLanguage, getLanguage, Language } from '../services/PreferencesManager';
import es from './es';
import en from './en';

const i18n = new I18n({ es, en });

let onLanguageChangeListeners: (() => void)[] = [];

export const initLocalization = async () => {
    const savedLang = await getLanguage();

    if (savedLang) {
        i18n.locale = savedLang;
    } else {
        const bestLocale = RNLocalize.findBestLanguageTag(Object.keys(i18n.translations));
        i18n.locale = bestLocale?.languageTag || 'es';
    }
};

export const setLanguage = async (lang: Language) => {
    i18n.locale = lang;
    await saveLanguage(lang);

    onLanguageChangeListeners.forEach(listener => listener());
};

export const onLanguageChange = (listener: () => void) => {
    onLanguageChangeListeners.push(listener);
    return () => {
        onLanguageChangeListeners = onLanguageChangeListeners.filter(l => l !== listener);
    };
};

export default i18n;