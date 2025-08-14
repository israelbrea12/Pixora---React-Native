// src/i18n/index.ts
import { I18n } from 'i18n-js';
import * as RNLocalize from 'react-native-localize';
import en from './en';
import es from './es';

// Obtenemos los locales del dispositivo
const locales = RNLocalize.getLocales();

// Creamos la instancia de I18n con nuestras traducciones
const i18n = new I18n({
    en,
    es,
});

// Establecemos el idioma de la app basándonos en el primer idioma del dispositivo
i18n.locale = locales[0]?.languageCode || 'en';

// Activamos el fallback para que si una traducción no existe en español,
// se muestre la versión en inglés en su lugar.
i18n.enableFallback = true;

export default i18n;