import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const API_BASE_URL = '/api';

// Custom backend to load translations from our API
const customBackend = {
  type: 'backend',
  init: function() {},
  read: async function(language: string, namespace: string, callback: (err: any, data?: any) => void) {
    try {
      const response = await fetch(`${API_BASE_URL}/translations/${language}`);
      
      if (!response.ok) {
        // If language not found, try fallback
        if (response.status === 404) {
          const fallbackResponse = await fetch(`${API_BASE_URL}/translations/en`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            callback(null, fallbackData.translations);
            return;
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      callback(null, data.translations);
    } catch (error) {
      console.error('Error loading translations:', error);
      callback(error, null);
    }
  },
  create: function() {}
};

i18n
  .use(customBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    backend: {
      loadPath: `${API_BASE_URL}/translations/{{lng}}`
    }
  });

// Function to get available languages from API
export async function getAvailableLanguages() {
  try {
    const response = await fetch(`${API_BASE_URL}/languages`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Map language codes to display names
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'hu': 'Magyar'
    };
    
    return data.languages.map((code: string) => ({
      code,
      name: languageMap[code] || code
    }));
  } catch (error) {
    console.error('Error fetching available languages:', error);
    // Return default languages as fallback
    return [
      { code: 'en', name: 'English' },
      { code: 'hu', name: 'Magyar' }
    ];
  }
}

export default i18n;