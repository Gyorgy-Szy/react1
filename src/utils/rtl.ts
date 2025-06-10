// RTL language detection utility

const RTL_LANGUAGES = [
  'ar',    // Arabic
  'he',    // Hebrew
  'fa',    // Persian/Farsi
  'ur',    // Urdu
  'sd',    // Sindhi
  'ps',    // Pashto
  'ku',    // Kurdish
  'dv',    // Divehi
  'yi',    // Yiddish
  'arc',   // Aramaic
];

/**
 * Determines if a language code represents a right-to-left language
 */
export function isRTLLanguage(languageCode: string): boolean {
  // Extract the base language code (e.g., 'ar' from 'ar-SA')
  const baseLanguage = languageCode.toLowerCase().split('-')[0];
  return RTL_LANGUAGES.includes(baseLanguage);
}

/**
 * Gets the text direction for a given language code
 */
export function getTextDirection(languageCode: string): 'ltr' | 'rtl' {
  return isRTLLanguage(languageCode) ? 'rtl' : 'ltr';
}

/**
 * Sets the document direction based on the current language
 */
export function setDocumentDirection(languageCode: string): void {
  const direction = getTextDirection(languageCode);
  document.documentElement.setAttribute('dir', direction);
  document.documentElement.setAttribute('lang', languageCode);
}