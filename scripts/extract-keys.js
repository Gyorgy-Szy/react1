#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { insertExtractedKey, clearExtractedKeys } from '../server/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for key extraction
const SCAN_PATTERNS = [
  'src/**/*.tsx',
  'src/**/*.ts',
  'src/**/*.jsx',
  'src/**/*.js'
];

const TRANSLATION_PATTERNS = [
  // useTranslation hook patterns
  /useTranslation\(\s*\[\s*['"`]([^'"`]+)['"`]/g,
  /useTranslation\(\s*['"`]([^'"`]+)['"`]/g,
  
  // t() function calls
  /\bt\(\s*['"`]([^'"`]+)['"`]/g,
  
  // Trans component i18nKey
  /<Trans\s+i18nKey\s*=\s*['"`]([^'"`]+)['"`]/g,
  
  // Other common patterns
  /i18n\.t\(\s*['"`]([^'"`]+)['"`]/g,
];

function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const extractedKeys = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineIndex) => {
    TRANSLATION_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const fullKey = match[1];
        
        // Parse namespace:key format
        let namespace = 'general'; // default namespace
        let key = fullKey;
        
        if (fullKey.includes(':')) {
          [namespace, key] = fullKey.split(':', 2);
        }
        
        extractedKeys.push({
          namespace,
          key,
          fullKey,
          filePath: filePath.replace(process.cwd() + '/', ''),
          lineNumber: lineIndex + 1,
          line: line.trim()
        });
      }
    });
  });
  
  return extractedKeys;
}

function globToRegex(glob) {
  const regexPattern = glob
    .replace(/\*\*/g, '____DOUBLESTAR____')
    .replace(/\*/g, '[^/]*')
    .replace(/____DOUBLESTAR____/g, '.*')
    .replace(/\?/g, '[^/]');
  
  return new RegExp('^' + regexPattern + '$');
}

function findMatchingFiles(patterns) {
  const files = [];
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other common directories
        if (!entry.name.startsWith('.') && 
            entry.name !== 'node_modules' && 
            entry.name !== 'dist' &&
            entry.name !== 'build') {
          walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        const relativePath = path.relative(process.cwd(), fullPath);
        
        // Check if file matches any pattern
        for (const pattern of patterns) {
          const regex = globToRegex(pattern);
          if (regex.test(relativePath)) {
            files.push(fullPath);
            break;
          }
        }
      }
    }
  }
  
  walkDir(process.cwd());
  return files;
}

async function extractAllKeys() {
  console.log('🔍 Scanning codebase for i18next translation keys...');
  
  try {
    // Clear existing extracted keys
    await new Promise((resolve, reject) => {
      clearExtractedKeys((err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    console.log('🗑️  Cleared existing extracted keys');
    
    // Find all matching files
    const files = findMatchingFiles(SCAN_PATTERNS);
    console.log(`📁 Found ${files.length} files to scan`);
    
    let totalKeys = 0;
    const keyStats = {};
    
    // Extract keys from each file
    for (const filePath of files) {
      const extractedKeys = extractKeysFromFile(filePath);
      
      for (const keyInfo of extractedKeys) {
        try {
          await new Promise((resolve, reject) => {
            insertExtractedKey(
              keyInfo.namespace,
              keyInfo.key,
              keyInfo.filePath,
              keyInfo.lineNumber,
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            );
          });
          
          totalKeys++;
          
          // Track stats
          if (!keyStats[keyInfo.namespace]) {
            keyStats[keyInfo.namespace] = 0;
          }
          keyStats[keyInfo.namespace]++;
          
        } catch (err) {
          console.error(`❌ Error inserting key ${keyInfo.fullKey}:`, err.message);
        }
      }
    }
    
    console.log('\n✅ Key extraction completed!');
    console.log(`📊 Total keys extracted: ${totalKeys}`);
    console.log('\n📋 Keys by namespace:');
    
    Object.entries(keyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([namespace, count]) => {
        console.log(`   ${namespace}: ${count} keys`);
      });
    
    console.log('\n🎯 Run the application and visit the Configuration page to view extracted keys.');
    
  } catch (error) {
    console.error('❌ Error during key extraction:', error);
    process.exit(1);
  }
}

// Run the extraction
extractAllKeys();