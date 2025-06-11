import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'translations.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create translations table with namespace support
    db.run(`
      CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language_code TEXT NOT NULL,
        namespace TEXT NOT NULL DEFAULT 'general',
        translation_key TEXT NOT NULL,
        translation_value TEXT NOT NULL,
        UNIQUE(language_code, namespace, translation_key)
      )
    `);

    // Create notes table
    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create delay_settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS delay_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint_name TEXT NOT NULL UNIQUE,
        delay_ms INTEGER NOT NULL DEFAULT 500,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create extracted_keys table
    db.run(`
      CREATE TABLE IF NOT EXISTS extracted_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        namespace TEXT NOT NULL,
        translation_key TEXT NOT NULL,
        file_path TEXT,
        line_number INTEGER,
        usage_count INTEGER DEFAULT 1,
        last_extracted DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(namespace, translation_key)
      )
    `);

    // Insert initial namespaced translations
    const translations = [
      // General namespace - common UI elements
      // English
      { lang: 'en', namespace: 'general', key: 'save', value: 'Save' },
      { lang: 'en', namespace: 'general', key: 'cancel', value: 'Cancel' },
      { lang: 'en', namespace: 'general', key: 'edit', value: 'Edit' },
      { lang: 'en', namespace: 'general', key: 'delete', value: 'Delete' },
      { lang: 'en', namespace: 'general', key: 'loading', value: 'Loading...' },
      { lang: 'en', namespace: 'general', key: 'language', value: 'Language' },
      { lang: 'en', namespace: 'general', key: 'home', value: 'Home' },
      { lang: 'en', namespace: 'general', key: 'title', value: 'Vite + React' },
      { lang: 'en', namespace: 'general', key: 'count', value: 'count is {{count}}' },
      { lang: 'en', namespace: 'general', key: 'editCode', value: 'Edit <1>src/App.tsx</1> and save to test HMR' },
      { lang: 'en', namespace: 'general', key: 'clickLogos', value: 'Click on the Vite and React logos to learn more' },
      
      // Hungarian
      { lang: 'hu', namespace: 'general', key: 'save', value: 'Mentés' },
      { lang: 'hu', namespace: 'general', key: 'cancel', value: 'Mégse' },
      { lang: 'hu', namespace: 'general', key: 'edit', value: 'Szerkesztés' },
      { lang: 'hu', namespace: 'general', key: 'delete', value: 'Törlés' },
      { lang: 'hu', namespace: 'general', key: 'loading', value: 'Betöltés...' },
      { lang: 'hu', namespace: 'general', key: 'language', value: 'Nyelv' },
      { lang: 'hu', namespace: 'general', key: 'home', value: 'Főoldal' },
      { lang: 'hu', namespace: 'general', key: 'title', value: 'Vite + React' },
      { lang: 'hu', namespace: 'general', key: 'count', value: 'számláló: {{count}}' },
      { lang: 'hu', namespace: 'general', key: 'editCode', value: 'Szerkeszd a <1>src/App.tsx</1> fájlt és mentsd el a HMR teszteléséhez' },
      { lang: 'hu', namespace: 'general', key: 'clickLogos', value: 'Kattints a Vite és React logókra, hogy többet megtudj' },
      
      // Sindhi
      { lang: 'sd', namespace: 'general', key: 'save', value: 'محفوظ ڪريو' },
      { lang: 'sd', namespace: 'general', key: 'cancel', value: 'منسوخ' },
      { lang: 'sd', namespace: 'general', key: 'edit', value: 'تبديل ڪريو' },
      { lang: 'sd', namespace: 'general', key: 'delete', value: 'ڊاهيو' },
      { lang: 'sd', namespace: 'general', key: 'loading', value: 'لوڊ ٿي رهيو...' },
      { lang: 'sd', namespace: 'general', key: 'language', value: 'ٻولي' },
      { lang: 'sd', namespace: 'general', key: 'home', value: 'گهر' },
      { lang: 'sd', namespace: 'general', key: 'title', value: 'Vite + React' },
      { lang: 'sd', namespace: 'general', key: 'count', value: 'شمار آهي {{count}}' },
      { lang: 'sd', namespace: 'general', key: 'editCode', value: '<1>src/App.tsx</1> کي تبديل ڪريو ۽ HMR ٽيسٽ ڪرڻ لاءِ محفوظ ڪريو' },
      { lang: 'sd', namespace: 'general', key: 'clickLogos', value: 'وڌيڪ سکڻ لاءِ Vite ۽ React جي لوگو تي ڪلڪ ڪريو' },

      // Config namespace - configuration page
      // English
      { lang: 'en', namespace: 'config', key: 'title', value: 'Configuration' },
      { lang: 'en', namespace: 'config', key: 'subtitle', value: 'Manage your application settings and translations' },
      { lang: 'en', namespace: 'config', key: 'translationEditor', value: 'Translation Editor' },
      { lang: 'en', namespace: 'config', key: 'translationEditorDesc', value: 'Edit translations for different languages. Changes are saved automatically.' },
      { lang: 'en', namespace: 'config', key: 'selectLanguage', value: 'Select Language:' },
      { lang: 'en', namespace: 'config', key: 'chooseLanguage', value: 'Choose language' },
      { lang: 'en', namespace: 'config', key: 'loadingTranslations', value: 'Loading translations...' },
      { lang: 'en', namespace: 'config', key: 'noTranslations', value: 'No translations found for this language.' },
      { lang: 'en', namespace: 'config', key: 'translationSaved', value: 'Translation "{{key}}" saved successfully!' },
      { lang: 'en', namespace: 'config', key: 'translationError', value: 'Error saving translation "{{key}}"' },
      { lang: 'en', namespace: 'config', key: 'delaySettings', value: 'API Delay Settings' },
      { lang: 'en', namespace: 'config', key: 'delaySettingsDesc', value: 'Configure response delays for different API endpoints to simulate loading states.' },
      { lang: 'en', namespace: 'config', key: 'endpoint', value: 'Endpoint' },
      { lang: 'en', namespace: 'config', key: 'delayMs', value: 'Delay (ms)' },
      { lang: 'en', namespace: 'config', key: 'description', value: 'Description' },
      { lang: 'en', namespace: 'config', key: 'loadingDelaySettings', value: 'Loading delay settings...' },
      { lang: 'en', namespace: 'config', key: 'delaySettingsSaved', value: 'Delay settings saved successfully!' },
      { lang: 'en', namespace: 'config', key: 'delaySettingsError', value: 'Error saving delay settings' },
      { lang: 'en', namespace: 'config', key: 'openAll', value: 'Open All' },
      { lang: 'en', namespace: 'config', key: 'remove', value: 'Remove' },
      { lang: 'en', namespace: 'config', key: 'add', value: 'Add' },
      { lang: 'en', namespace: 'config', key: 'missing', value: '(Missing)' },
      { lang: 'en', namespace: 'config', key: 'removeConfirm', value: 'Are you sure you want to remove this translation?' },
      { lang: 'en', namespace: 'config', key: 'translationRemoved', value: 'Translation removed successfully!' },
      { lang: 'en', namespace: 'config', key: 'translationAdded', value: 'Translation added successfully!' },
      { lang: 'en', namespace: 'config', key: 'removeError', value: 'Error removing translation' },
      { lang: 'en', namespace: 'config', key: 'addError', value: 'Error adding translation' },
      { lang: 'en', namespace: 'config', key: 'extractedKeys', value: 'Extracted Keys' },
      { lang: 'en', namespace: 'config', key: 'extractedKeysDesc', value: 'Translation keys found in your codebase. Run "npm run extract-keys" to scan for new keys.' },
      
      // Hungarian
      { lang: 'hu', namespace: 'config', key: 'title', value: 'Beállítások' },
      { lang: 'hu', namespace: 'config', key: 'subtitle', value: 'Alkalmazás beállítások és fordítások kezelése' },
      { lang: 'hu', namespace: 'config', key: 'translationEditor', value: 'Fordítás szerkesztő' },
      { lang: 'hu', namespace: 'config', key: 'translationEditorDesc', value: 'Fordítások szerkesztése különböző nyelveken. A módosítások automatikusan mentődnek.' },
      { lang: 'hu', namespace: 'config', key: 'selectLanguage', value: 'Nyelv kiválasztása:' },
      { lang: 'hu', namespace: 'config', key: 'chooseLanguage', value: 'Nyelv választása' },
      { lang: 'hu', namespace: 'config', key: 'loadingTranslations', value: 'Fordítások betöltése...' },
      { lang: 'hu', namespace: 'config', key: 'noTranslations', value: 'Nem találhatók fordítások ehhez a nyelvhez.' },
      { lang: 'hu', namespace: 'config', key: 'translationSaved', value: 'A "{{key}}" fordítás sikeresen mentve!' },
      { lang: 'hu', namespace: 'config', key: 'translationError', value: 'Hiba a "{{key}}" fordítás mentésekor' },
      { lang: 'hu', namespace: 'config', key: 'delaySettings', value: 'API késleltetési beállítások' },
      { lang: 'hu', namespace: 'config', key: 'delaySettingsDesc', value: 'Válaszidő késleltetések beállítása különböző API végpontokhoz a betöltési állapotok szimulálásához.' },
      { lang: 'hu', namespace: 'config', key: 'endpoint', value: 'Végpont' },
      { lang: 'hu', namespace: 'config', key: 'delayMs', value: 'Késleltetés (ms)' },
      { lang: 'hu', namespace: 'config', key: 'description', value: 'Leírás' },
      { lang: 'hu', namespace: 'config', key: 'loadingDelaySettings', value: 'Késleltetési beállítások betöltése...' },
      { lang: 'hu', namespace: 'config', key: 'delaySettingsSaved', value: 'Késleltetési beállítások sikeresen mentve!' },
      { lang: 'hu', namespace: 'config', key: 'delaySettingsError', value: 'Hiba a késleltetési beállítások mentésekor' },
      { lang: 'hu', namespace: 'config', key: 'openAll', value: 'Összes megnyitása' },
      { lang: 'hu', namespace: 'config', key: 'remove', value: 'Eltávolítás' },
      { lang: 'hu', namespace: 'config', key: 'add', value: 'Hozzáadás' },
      { lang: 'hu', namespace: 'config', key: 'missing', value: '(Hiányzó)' },
      { lang: 'hu', namespace: 'config', key: 'removeConfirm', value: 'Biztosan el szeretnéd távolítani ezt a fordítást?' },
      { lang: 'hu', namespace: 'config', key: 'translationRemoved', value: 'Fordítás sikeresen eltávolítva!' },
      { lang: 'hu', namespace: 'config', key: 'translationAdded', value: 'Fordítás sikeresen hozzáadva!' },
      { lang: 'hu', namespace: 'config', key: 'removeError', value: 'Hiba a fordítás eltávolításakor' },
      { lang: 'hu', namespace: 'config', key: 'addError', value: 'Hiba a fordítás hozzáadásakor' },
      { lang: 'hu', namespace: 'config', key: 'extractedKeys', value: 'Kivont kulcsok' },
      { lang: 'hu', namespace: 'config', key: 'extractedKeysDesc', value: 'A kódbázisban talált fordítási kulcsok. Futtasd az "npm run extract-keys" parancsot új kulcsok kereséséhez.' },
      
      // Sindhi
      { lang: 'sd', namespace: 'config', key: 'title', value: 'ترتيبات' },
      { lang: 'sd', namespace: 'config', key: 'subtitle', value: 'پنهنجي ايپليڪيشن جي سيٽنگس ۽ ترجمي جو انتظام ڪريو' },
      { lang: 'sd', namespace: 'config', key: 'translationEditor', value: 'ترجمي ايڊيٽر' },
      { lang: 'sd', namespace: 'config', key: 'translationEditorDesc', value: 'مختلف ٻولين لاءِ ترجما ايڊٽ ڪريو. تبديليون خودڪار طور محفوظ ٿين ٿيون.' },
      { lang: 'sd', namespace: 'config', key: 'selectLanguage', value: 'ٻولي چونڊيو:' },
      { lang: 'sd', namespace: 'config', key: 'chooseLanguage', value: 'ٻولي چونڊيو' },
      { lang: 'sd', namespace: 'config', key: 'loadingTranslations', value: 'ترجما لوڊ ٿي رهيا آهن...' },
      { lang: 'sd', namespace: 'config', key: 'noTranslations', value: 'هن ٻولي لاءِ ڪو ترجمو نه مليو.' },
      { lang: 'sd', namespace: 'config', key: 'translationSaved', value: '"{{key}}" ترجمو ڪاميابيءَ سان محفوظ ٿيو!' },
      { lang: 'sd', namespace: 'config', key: 'translationError', value: '"{{key}}" ترجمي کي محفوظ ڪرڻ ۾ خرابي' },
      { lang: 'sd', namespace: 'config', key: 'delaySettings', value: 'API دير جون سيٽنگس' },
      { lang: 'sd', namespace: 'config', key: 'delaySettingsDesc', value: 'مختلف API endpoints لاءِ جوابي دير کي ترتيب ڏيو لوڊنگ حالتن جي نقل لاءِ.' },
      { lang: 'sd', namespace: 'config', key: 'endpoint', value: 'Endpoint' },
      { lang: 'sd', namespace: 'config', key: 'delayMs', value: 'دير (ms)' },
      { lang: 'sd', namespace: 'config', key: 'description', value: 'تفصيل' },
      { lang: 'sd', namespace: 'config', key: 'loadingDelaySettings', value: 'دير جون سيٽنگس لوڊ ٿي رهيون آهن...' },
      { lang: 'sd', namespace: 'config', key: 'delaySettingsSaved', value: 'دير جون سيٽنگس ڪاميابيءَ سان محفوظ ٿيون!' },
      { lang: 'sd', namespace: 'config', key: 'delaySettingsError', value: 'دير جون سيٽنگس محفوظ ڪرڻ ۾ خرابي' },
      { lang: 'sd', namespace: 'config', key: 'openAll', value: 'سڀ کوليو' },
      { lang: 'sd', namespace: 'config', key: 'remove', value: 'هٽايو' },
      { lang: 'sd', namespace: 'config', key: 'add', value: 'شامل ڪريو' },
      { lang: 'sd', namespace: 'config', key: 'missing', value: '(غائب)' },
      { lang: 'sd', namespace: 'config', key: 'removeConfirm', value: 'ڇا توهان واقعي هن ترجمي کي هٽائڻ چاهيو ٿا؟' },
      { lang: 'sd', namespace: 'config', key: 'translationRemoved', value: 'ترجمو ڪاميابيءَ سان هٽايو ويو!' },
      { lang: 'sd', namespace: 'config', key: 'translationAdded', value: 'ترجمو ڪاميابيءَ سان شامل ڪيو ويو!' },
      { lang: 'sd', namespace: 'config', key: 'removeError', value: 'ترجمو هٽائڻ ۾ خرابي' },
      { lang: 'sd', namespace: 'config', key: 'addError', value: 'ترجمو شامل ڪرڻ ۾ خرابي' },
      { lang: 'sd', namespace: 'config', key: 'extractedKeys', value: 'ڪڍيل چاٻيون' },
      { lang: 'sd', namespace: 'config', key: 'extractedKeysDesc', value: 'توهان جي ڪوڊ بيس ۾ مليل ترجمي جون چاٻيون. نئون چاٻيون ڳولڻ لاءِ "npm run extract-keys" هلايو.' },

      // Notes namespace - notes page
      // English
      { lang: 'en', namespace: 'notes', key: 'title', value: 'Notes' },
      { lang: 'en', namespace: 'notes', key: 'subtitle', value: 'Keep track of your development notes and implementation tips' },
      { lang: 'en', namespace: 'notes', key: 'developmentNotes', value: 'Development Notes' },
      { lang: 'en', namespace: 'notes', key: 'notesDesc', value: 'Add, edit, and manage your notes. Click edit to modify existing notes.' },
      { lang: 'en', namespace: 'notes', key: 'addNewNote', value: 'Add New Note' },
      { lang: 'en', namespace: 'notes', key: 'enterNote', value: 'Enter your note...' },
      { lang: 'en', namespace: 'notes', key: 'loadingNotes', value: 'Loading notes...' },
      { lang: 'en', namespace: 'notes', key: 'noNotes', value: 'No notes found. Click "Add New Note" to create your first note.' },
      { lang: 'en', namespace: 'notes', key: 'noteCreated', value: 'Note created successfully!' },
      { lang: 'en', namespace: 'notes', key: 'noteUpdated', value: 'Note updated successfully!' },
      { lang: 'en', namespace: 'notes', key: 'noteDeleted', value: 'Note deleted successfully!' },
      { lang: 'en', namespace: 'notes', key: 'noteError', value: 'Error saving note' },
      { lang: 'en', namespace: 'notes', key: 'deleteConfirm', value: 'Are you sure you want to delete this note?' },
      
      // Hungarian
      { lang: 'hu', namespace: 'notes', key: 'title', value: 'Jegyzetek' },
      { lang: 'hu', namespace: 'notes', key: 'subtitle', value: 'Fejlesztési jegyzetek és implementációs tippek nyilvántartása' },
      { lang: 'hu', namespace: 'notes', key: 'developmentNotes', value: 'Fejlesztési jegyzetek' },
      { lang: 'hu', namespace: 'notes', key: 'notesDesc', value: 'Jegyzetek hozzáadása, szerkesztése és kezelése. Kattints a szerkesztés gombra a meglévő jegyzetek módosításához.' },
      { lang: 'hu', namespace: 'notes', key: 'addNewNote', value: 'Új jegyzet hozzáadása' },
      { lang: 'hu', namespace: 'notes', key: 'enterNote', value: 'Írd be a jegyzeted...' },
      { lang: 'hu', namespace: 'notes', key: 'loadingNotes', value: 'Jegyzetek betöltése...' },
      { lang: 'hu', namespace: 'notes', key: 'noNotes', value: 'Nem találhatók jegyzetek. Kattints az "Új jegyzet hozzáadása" gombra az első jegyzet létrehozásához.' },
      { lang: 'hu', namespace: 'notes', key: 'noteCreated', value: 'Jegyzet sikeresen létrehozva!' },
      { lang: 'hu', namespace: 'notes', key: 'noteUpdated', value: 'Jegyzet sikeresen frissítve!' },
      { lang: 'hu', namespace: 'notes', key: 'noteDeleted', value: 'Jegyzet sikeresen törölve!' },
      { lang: 'hu', namespace: 'notes', key: 'noteError', value: 'Hiba a jegyzet mentésekor' },
      { lang: 'hu', namespace: 'notes', key: 'deleteConfirm', value: 'Biztosan törölni szeretnéd ezt a jegyzetet?' },
      
      // Sindhi
      { lang: 'sd', namespace: 'notes', key: 'title', value: 'نوٽس' },
      { lang: 'sd', namespace: 'notes', key: 'subtitle', value: 'پنهنجي ڊولپمينٽ نوٽس ۽ implementation جا ٽپس رکو' },
      { lang: 'sd', namespace: 'notes', key: 'developmentNotes', value: 'ڊولپمينٽ نوٽس' },
      { lang: 'sd', namespace: 'notes', key: 'notesDesc', value: 'نوٽس شامل ڪريو، ايڊٽ ڪريو ۽ منظم ڪريو. موجوده نوٽس تبديل ڪرڻ لاءِ ايڊٽ تي ڪلڪ ڪريو.' },
      { lang: 'sd', namespace: 'notes', key: 'addNewNote', value: 'نئون نوٽ شامل ڪريو' },
      { lang: 'sd', namespace: 'notes', key: 'enterNote', value: 'پنهنجو نوٽ داخل ڪريو...' },
      { lang: 'sd', namespace: 'notes', key: 'loadingNotes', value: 'نوٽس لوڊ ٿي رهيا آهن...' },
      { lang: 'sd', namespace: 'notes', key: 'noNotes', value: 'ڪو نوٽ نه مليو. پهريون نوٽ ٺاهڻ لاءِ "نئون نوٽ شامل ڪريو" تي ڪلڪ ڪريو.' },
      { lang: 'sd', namespace: 'notes', key: 'noteCreated', value: 'نوٽ ڪاميابيءَ سان ٺهيو!' },
      { lang: 'sd', namespace: 'notes', key: 'noteUpdated', value: 'نوٽ ڪاميابيءَ سان اپڊيٽ ٿيو!' },
      { lang: 'sd', namespace: 'notes', key: 'noteDeleted', value: 'نوٽ ڪاميابيءَ سان ڊاهيو ويو!' },
      { lang: 'sd', namespace: 'notes', key: 'noteError', value: 'نوٽ محفوظ ڪرڻ ۾ خرابي' },
      { lang: 'sd', namespace: 'notes', key: 'deleteConfirm', value: 'ڇا توهان واقعي هن نوٽ کي ڊاهڻ چاهيو ٿا؟' },

      // Testbay namespace - testing and debugging page
      // English
      { lang: 'en', namespace: 'testbay', key: 'title', value: 'Testbay' },
      { lang: 'en', namespace: 'testbay', key: 'subtitle', value: 'Test i18next functionality and debug translation issues' },
      { lang: 'en', namespace: 'testbay', key: 'differentCases', value: 'Different cases' },
      { lang: 'en', namespace: 'testbay', key: 'exampleTextLabel', value: 'Example text in the current language' },
      { lang: 'en', namespace: 'testbay', key: 'exampleText', value: 'This is the example text in English' },
      { lang: 'en', namespace: 'testbay', key: 'missingTranslationLabel', value: 'Text missing in all languages but English' },
      { lang: 'en', namespace: 'testbay', key: 'missingTranslation', value: 'There is no translation for this sentence' },
      { lang: 'en', namespace: 'testbay', key: 'ltrOnlyLabel', value: 'This text is always ltr, no translation' },
      { lang: 'en', namespace: 'testbay', key: 'debugInfo', value: 'Debug Information' },
      { lang: 'en', namespace: 'testbay', key: 'debugInfoDesc', value: 'Current application state and i18next configuration details' },
      { lang: 'en', namespace: 'testbay', key: 'currentLanguage', value: 'Current Language' },
      { lang: 'en', namespace: 'testbay', key: 'languageValue', value: 'English (en)' },
      { lang: 'en', namespace: 'testbay', key: 'loadedNamespaces', value: 'Loaded Namespaces' },
      { lang: 'en', namespace: 'testbay', key: 'browserDirection', value: 'Browser Direction' },
      { lang: 'en', namespace: 'testbay', key: 'htmlContentLabel', value: 'Example HTML content' },
      { lang: 'en', namespace: 'testbay', key: 'htmlContent', value: 'example html with <b>bold</b>' },
      { lang: 'en', namespace: 'testbay', key: 'rtlOnlyLabel', value: 'This text is always rtl, no translation' },
      
      // Hungarian
      { lang: 'hu', namespace: 'testbay', key: 'title', value: 'Tesztkörnyezet' },
      { lang: 'hu', namespace: 'testbay', key: 'subtitle', value: 'i18next funkciók tesztelése és fordítási problémák hibakeresése' },
      { lang: 'hu', namespace: 'testbay', key: 'differentCases', value: 'Különböző esetek' },
      { lang: 'hu', namespace: 'testbay', key: 'exampleTextLabel', value: 'Példa szöveg a jelenlegi nyelven' },
      { lang: 'hu', namespace: 'testbay', key: 'exampleText', value: 'Ez a példa szöveg magyarul' },
      { lang: 'hu', namespace: 'testbay', key: 'missingTranslationLabel', value: 'Szöveg ami hiányzik minden nyelvből, csak angolul van' },
      { lang: 'hu', namespace: 'testbay', key: 'ltrOnlyLabel', value: 'Ez a szöveg mindig balról jobbra, nincs fordítás' },
      { lang: 'hu', namespace: 'testbay', key: 'debugInfo', value: 'Hibakeresési információk' },
      { lang: 'hu', namespace: 'testbay', key: 'debugInfoDesc', value: 'Jelenlegi alkalmazás állapot és i18next konfigurációs részletek' },
      { lang: 'hu', namespace: 'testbay', key: 'currentLanguage', value: 'Jelenlegi nyelv' },
      { lang: 'hu', namespace: 'testbay', key: 'languageValue', value: 'Magyar (hu)' },
      { lang: 'hu', namespace: 'testbay', key: 'loadedNamespaces', value: 'Betöltött névterek' },
      { lang: 'hu', namespace: 'testbay', key: 'browserDirection', value: 'Böngésző irány' },
      { lang: 'hu', namespace: 'testbay', key: 'htmlContentLabel', value: 'Példa HTML tartalom' },
      { lang: 'hu', namespace: 'testbay', key: 'htmlContent', value: 'példa html <b>félkövér</b> szöveggel' },
      { lang: 'hu', namespace: 'testbay', key: 'rtlOnlyLabel', value: 'Ez a szöveg mindig jobbról balra, nincs fordítás' },
      
      // Sindhi
      { lang: 'sd', namespace: 'testbay', key: 'title', value: 'ٽيسٽ بي' },
      { lang: 'sd', namespace: 'testbay', key: 'subtitle', value: 'i18next جي ڪارڪردگي کي ٽيسٽ ڪريو ۽ ترجمي جي مسئلن کي حل ڪريو' },
      { lang: 'sd', namespace: 'testbay', key: 'differentCases', value: 'مختلف حالتون' },
      { lang: 'sd', namespace: 'testbay', key: 'exampleTextLabel', value: 'موجوده ٻولي ۾ مثال متن' },
      { lang: 'sd', namespace: 'testbay', key: 'exampleText', value: 'هي سنڌي ۾ مثال جو متن آهي' },
      { lang: 'sd', namespace: 'testbay', key: 'missingTranslationLabel', value: 'متن جيڪو سڀني ٻولين ۾ غائب آهي سواءِ انگريزي جي' },
      { lang: 'sd', namespace: 'testbay', key: 'ltrOnlyLabel', value: 'هي متن هميشه کاٻي کان ساڄي طرف، ڪو ترجمو ناهي' },
      { lang: 'sd', namespace: 'testbay', key: 'debugInfo', value: 'ڊيبگ معلومات' },
      { lang: 'sd', namespace: 'testbay', key: 'debugInfoDesc', value: 'موجوده ايپليڪيشن جي حالت ۽ i18next ترتيبات جا تفصيل' },
      { lang: 'sd', namespace: 'testbay', key: 'currentLanguage', value: 'موجوده ٻولي' },
      { lang: 'sd', namespace: 'testbay', key: 'languageValue', value: 'سنڌي (sd)' },
      { lang: 'sd', namespace: 'testbay', key: 'loadedNamespaces', value: 'لوڊ ٿيل نيم اسپيس' },
      { lang: 'sd', namespace: 'testbay', key: 'browserDirection', value: 'برائوزر جو رخ' },
      { lang: 'sd', namespace: 'testbay', key: 'htmlContentLabel', value: 'مثال HTML مواد' },
      { lang: 'sd', namespace: 'testbay', key: 'htmlContent', value: 'مثال html <b>ڳرو</b> متن سان' },
      { lang: 'sd', namespace: 'testbay', key: 'rtlOnlyLabel', value: 'هي متن هميشه ساڄي کان ڪابي، ڪو ترجمو ناهي' }
    ];

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO translations (language_code, namespace, translation_key, translation_value)
      VALUES (?, ?, ?, ?)
    `);

    translations.forEach(({ lang, namespace, key, value }) => {
      stmt.run(lang, namespace, key, value);
    });

    stmt.finalize();

    // Insert initial delay settings
    const delaySettings = [
      { endpoint: 'translations_by_namespace', delay: 500, description: 'Delay for /api/translations/:language endpoint (all namespaces)' },
      { endpoint: 'translations_single_namespace', delay: 500, description: 'Delay for /api/translations/:language/:namespace endpoint' },
      { endpoint: 'translations_single_value', delay: 0, description: 'Delay for /api/translations/:language/:namespace/:key endpoint (single value)' },
      { endpoint: 'languages', delay: 0, description: 'Delay for /api/languages endpoint' },
      { endpoint: 'notes', delay: 0, description: 'Delay for /api/notes endpoints' }
    ];

    const delayStmt = db.prepare(`
      INSERT OR REPLACE INTO delay_settings (endpoint_name, delay_ms, description)
      VALUES (?, ?, ?)
    `);

    delaySettings.forEach(({ endpoint, delay, description }) => {
      delayStmt.run(endpoint, delay, description);
    });

    delayStmt.finalize();

    console.log('Database initialized with translations, notes, and delay settings.');
  });
  
  // Insert initial notes about i18next implementation (only if notes table is empty)
  db.get(`SELECT COUNT(*) as count FROM notes`, [], (err, row) => {
    if (!err && row.count === 0) {
      const notes = [
        'When setting up i18next, always define fallback languages to ensure users see content even when translations are missing. Use `fallbackLng: ["en"]` as a minimum configuration.',
        'Structure your translation keys hierarchically using nested objects. For example: `user.profile.name` instead of flat keys like `userProfileName`. This makes maintenance easier.',
        'Use interpolation for dynamic content: `"Welcome {{username}}"` instead of string concatenation. This ensures proper RTL support and maintains translation context.',
        'Implement lazy loading for translations to reduce initial bundle size. Load translation files only when needed, especially for large applications with many languages.',
        'Always use the `Trans` component for complex translations containing HTML or React components. Never use `dangerouslySetInnerHTML` with translated content.',
        'Set up proper language detection with multiple fallback methods: localStorage, navigator language, and URL parameters. Use `i18next-browser-languagedetector` for this.',
        'Create a consistent naming convention for translation keys. Use present tense verbs and descriptive names: `button.save`, `message.success.userCreated`.',
        'For RTL languages (Arabic, Hebrew, Urdu), ensure your CSS supports `dir="rtl"` and test layout carefully. Consider using logical CSS properties like `margin-inline-start`.',
        'Implement pluralization rules correctly using i18next plural forms. Different languages have different pluralization rules - English has 2 forms, Polish has 4.',
        'Set up automated translation management with tools like Crowdin or Lokalise. This prevents translation keys from becoming outdated and helps manage translator workflows.'
      ];

      const noteStmt = db.prepare(`
        INSERT INTO notes (content)
        VALUES (?)
      `);

      notes.forEach((content) => {
        noteStmt.run(content);
      });

      noteStmt.finalize();
    }
  });
}

export function getSingleTranslation(languageCode, namespace, translationKey, callback) {
  const query = `
    SELECT translation_value 
    FROM translations 
    WHERE language_code = ? AND namespace = ? AND translation_key = ?
  `;
  
  db.get(query, [languageCode, namespace, translationKey], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    // Return the value or null if not found
    callback(null, row ? row.translation_value : null);
  });
}

export function getTranslations(languageCode, namespace = null, callback) {
  let query, params;
  
  if (namespace) {
    query = `
      SELECT translation_key, translation_value 
      FROM translations 
      WHERE language_code = ? AND namespace = ?
    `;
    params = [languageCode, namespace];
  } else {
    query = `
      SELECT translation_key, translation_value 
      FROM translations 
      WHERE language_code = ?
    `;
    params = [languageCode];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    const translations = {};
    rows.forEach(row => {
      translations[row.translation_key] = row.translation_value;
    });
    
    callback(null, translations);
  });
}

export function getTranslationsByNamespace(languageCode, callback) {
  const query = `
    SELECT namespace, translation_key, translation_value 
    FROM translations 
    WHERE language_code = ?
    ORDER BY namespace, translation_key
  `;
  
  db.all(query, [languageCode], (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    const translationsByNamespace = {};
    rows.forEach(row => {
      if (!translationsByNamespace[row.namespace]) {
        translationsByNamespace[row.namespace] = {};
      }
      translationsByNamespace[row.namespace][row.translation_key] = row.translation_value;
    });
    
    callback(null, translationsByNamespace);
  });
}

export function getAllLanguages(callback) {
  const query = `SELECT DISTINCT language_code FROM translations`;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    const languages = rows.map(row => row.language_code);
    callback(null, languages);
  });
}

export function updateTranslation(languageCode, namespace, translationKey, translationValue, callback) {
  const query = `
    UPDATE translations 
    SET translation_value = ? 
    WHERE language_code = ? AND namespace = ? AND translation_key = ?
  `;
  
  db.run(query, [translationValue, languageCode, namespace, translationKey], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    if (this.changes === 0) {
      callback(new Error('Translation not found'), null);
      return;
    }
    
    callback(null, { success: true, changes: this.changes });
  });
}

export function deleteTranslation(languageCode, namespace, translationKey, callback) {
  const query = `
    DELETE FROM translations 
    WHERE language_code = ? AND namespace = ? AND translation_key = ?
  `;
  
  db.run(query, [languageCode, namespace, translationKey], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    if (this.changes === 0) {
      callback(new Error('Translation not found'), null);
      return;
    }
    
    callback(null, { success: true, changes: this.changes });
  });
}

export function createTranslation(languageCode, namespace, translationKey, translationValue, callback) {
  const query = `
    INSERT INTO translations (language_code, namespace, translation_key, translation_value)
    VALUES (?, ?, ?, ?)
  `;
  
  db.run(query, [languageCode, namespace, translationKey, translationValue], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    callback(null, { success: true, id: this.lastID });
  });
}

// Notes CRUD operations
export function getAllNotes(callback) {
  const query = `SELECT * FROM notes ORDER BY updated_at DESC`;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    callback(null, rows);
  });
}

export function createNote(content, callback) {
  const query = `
    INSERT INTO notes (content)
    VALUES (?)
  `;
  
  db.run(query, [content], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    callback(null, { id: this.lastID, content });
  });
}

export function updateNote(noteId, content, callback) {
  const query = `
    UPDATE notes 
    SET content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(query, [content, noteId], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    if (this.changes === 0) {
      callback(new Error('Note not found'), null);
      return;
    }
    
    callback(null, { success: true, changes: this.changes });
  });
}

export function deleteNote(noteId, callback) {
  const query = `DELETE FROM notes WHERE id = ?`;
  
  db.run(query, [noteId], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    if (this.changes === 0) {
      callback(new Error('Note not found'), null);
      return;
    }
    
    callback(null, { success: true, changes: this.changes });
  });
}

// Delay settings CRUD operations
export function getAllDelaySettings(callback) {
  const query = `SELECT * FROM delay_settings ORDER BY endpoint_name`;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    callback(null, rows);
  });
}

export function getDelayForEndpoint(endpointName, callback) {
  const query = `SELECT delay_ms FROM delay_settings WHERE endpoint_name = ?`;
  
  db.get(query, [endpointName], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    // Return 0 if no setting found
    callback(null, row ? row.delay_ms : 0);
  });
}

export function updateDelaySettings(endpointName, delayMs, callback) {
  const query = `
    UPDATE delay_settings 
    SET delay_ms = ?, updated_at = CURRENT_TIMESTAMP
    WHERE endpoint_name = ?
  `;
  
  db.run(query, [delayMs, endpointName], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    if (this.changes === 0) {
      callback(new Error('Delay setting not found'), null);
      return;
    }
    
    callback(null, { success: true, changes: this.changes });
  });
}

// Extracted keys CRUD operations
export function getAllExtractedKeys(callback) {
  const query = `
    SELECT ek.*, 
           t.translation_value as english_value
    FROM extracted_keys ek
    LEFT JOIN translations t ON (
      t.language_code = 'en' AND 
      t.namespace = ek.namespace AND 
      t.translation_key = ek.translation_key
    )
    ORDER BY ek.namespace, ek.translation_key
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    callback(null, rows);
  });
}

export function insertExtractedKey(namespace, translationKey, filePath, lineNumber, callback) {
  const query = `
    INSERT OR REPLACE INTO extracted_keys 
    (namespace, translation_key, file_path, line_number, usage_count, last_extracted)
    VALUES (?, ?, ?, ?, 
      COALESCE((SELECT usage_count + 1 FROM extracted_keys WHERE namespace = ? AND translation_key = ?), 1),
      CURRENT_TIMESTAMP)
  `;
  
  db.run(query, [namespace, translationKey, filePath, lineNumber, namespace, translationKey], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    callback(null, { success: true, id: this.lastID });
  });
}

export function clearExtractedKeys(callback) {
  const query = `DELETE FROM extracted_keys`;
  
  db.run(query, [], function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    
    callback(null, { success: true, deleted: this.changes });
  });
}

export default db;