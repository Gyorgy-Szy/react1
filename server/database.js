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
      { lang: 'hu', key: 'enableNotifications', value: 'Értesítések engedélyezése' }
    ];

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO translations (language_code, translation_key, translation_value)
      VALUES (?, ?, ?)
    `);

    translations.forEach(({ lang, key, value }) => {
      stmt.run(lang, key, value);
    });

    stmt.finalize();
    console.log('Database initialized with translations.');
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

export default db;