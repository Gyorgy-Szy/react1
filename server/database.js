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
    // Create translations table
    db.run(`
      CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language_code TEXT NOT NULL,
        translation_key TEXT NOT NULL,
        translation_value TEXT NOT NULL,
        UNIQUE(language_code, translation_key)
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

    // Insert initial translations
    const translations = [
      // English translations
      { lang: 'en', key: 'title', value: 'Vite + React' },
      { lang: 'en', key: 'count', value: 'count is {{count}}' },
      { lang: 'en', key: 'edit', value: 'Edit <1>src/App.tsx</1> and save to test HMR' },
      { lang: 'en', key: 'clickLogos', value: 'Click on the Vite and React logos to learn more' },
      { lang: 'en', key: 'language', value: 'Language' },
      { lang: 'en', key: 'configuration', value: 'Configuration' },
      { lang: 'en', key: 'general', value: 'General' },
      { lang: 'en', key: 'theme', value: 'Theme' },
      { lang: 'en', key: 'light', value: 'Light' },
      { lang: 'en', key: 'dark', value: 'Dark' },
      { lang: 'en', key: 'notifications', value: 'Notifications' },
      { lang: 'en', key: 'enableNotifications', value: 'Enable notifications' },
      
      // Hungarian translations
      { lang: 'hu', key: 'title', value: 'Vite + React' },
      { lang: 'hu', key: 'count', value: 'számláló: {{count}}' },
      { lang: 'hu', key: 'edit', value: 'Szerkeszd a <1>src/App.tsx</1> fájlt és mentsd el a HMR teszteléséhez' },
      { lang: 'hu', key: 'clickLogos', value: 'Kattints a Vite és React logókra, hogy többet megtudj' },
      { lang: 'hu', key: 'language', value: 'Nyelv' },
      { lang: 'hu', key: 'configuration', value: 'Beállítások' },
      { lang: 'hu', key: 'general', value: 'Általános' },
      { lang: 'hu', key: 'theme', value: 'Téma' },
      { lang: 'hu', key: 'light', value: 'Világos' },
      { lang: 'hu', key: 'dark', value: 'Sötét' },
      { lang: 'hu', key: 'notifications', value: 'Értesítések' },
      { lang: 'hu', key: 'enableNotifications', value: 'Értesítések engedélyezése' },
      
      // Sindhi translations (in Arabic script)
      { lang: 'sd', key: 'title', value: 'Vite + React' },
      { lang: 'sd', key: 'count', value: 'شمار آهي {{count}}' },
      { lang: 'sd', key: 'edit', value: '<1>src/App.tsx</1> کي تبديل ڪريو ۽ HMR ٽيسٽ ڪرڻ لاءِ محفوظ ڪريو' },
      { lang: 'sd', key: 'clickLogos', value: 'وڌيڪ سکڻ لاءِ Vite ۽ React جي لوگو تي ڪلڪ ڪريو' },
      { lang: 'sd', key: 'language', value: 'ٻولي' },
      { lang: 'sd', key: 'configuration', value: 'ترتيبات' },
      { lang: 'sd', key: 'general', value: 'عام' },
      { lang: 'sd', key: 'theme', value: 'موضوع' },
      { lang: 'sd', key: 'light', value: 'روشن' },
      { lang: 'sd', key: 'dark', value: 'اونداهو' },
      { lang: 'sd', key: 'notifications', value: 'اطلاعات' },
      { lang: 'sd', key: 'enableNotifications', value: 'اطلاعات فعال ڪريو' }
    ];

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO translations (language_code, translation_key, translation_value)
      VALUES (?, ?, ?)
    `);

    translations.forEach(({ lang, key, value }) => {
      stmt.run(lang, key, value);
    });

    stmt.finalize();

    // Insert initial notes about i18next implementation
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
      INSERT OR IGNORE INTO notes (content)
      VALUES (?)
    `);

    notes.forEach((content) => {
      noteStmt.run(content);
    });

    noteStmt.finalize();
    console.log('Database initialized with translations and notes.');
  });
}

export function getTranslations(languageCode, callback) {
  const query = `
    SELECT translation_key, translation_value 
    FROM translations 
    WHERE language_code = ?
  `;
  
  db.all(query, [languageCode], (err, rows) => {
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

export function updateTranslation(languageCode, translationKey, translationValue, callback) {
  const query = `
    UPDATE translations 
    SET translation_value = ? 
    WHERE language_code = ? AND translation_key = ?
  `;
  
  db.run(query, [translationValue, languageCode, translationKey], function(err) {
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

export default db;