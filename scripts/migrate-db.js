#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../server/translations.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('📁 Connected to the SQLite database.');
    migrateDatabase();
  }
});

function migrateDatabase() {
  console.log('🔧 Running database migrations...');
  
  // Create extracted_keys table if it doesn't exist
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
  `, (err) => {
    if (err) {
      console.error('❌ Error creating extracted_keys table:', err.message);
      process.exit(1);
    } else {
      console.log('✅ extracted_keys table created successfully');
      
      // Check if table exists and has correct structure
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='extracted_keys'", [], (err, row) => {
        if (err) {
          console.error('❌ Error checking table:', err.message);
        } else if (row) {
          console.log('✅ Database migration completed successfully');
          console.log('🚀 You can now run: npm run extract-keys');
        } else {
          console.error('❌ Table was not created properly');
        }
        
        db.close();
      });
    }
  });
}