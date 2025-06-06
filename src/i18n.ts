import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "title": "Vite + React",
      "count": "count is {{count}}",
      "edit": "Edit <1>src/App.tsx</1> and save to test HMR",
      "clickLogos": "Click on the Vite and React logos to learn more",
      "language": "Language"
    }
  },
  hu: {
    translation: {
      "title": "Vite + React",
      "count": "számláló: {{count}}",
      "edit": "Szerkeszd a <1>src/App.tsx</1> fájlt és mentsd el a HMR teszteléséhez",
      "clickLogos": "Kattints a Vite és React logókra, hogy többet megtudj",
      "language": "Nyelv"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage']
    }
  });

export default i18n;
export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hu', name: 'Magyar' }
];