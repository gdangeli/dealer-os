#!/usr/bin/env node

/**
 * Translation Checker & Auto-Translator
 * 
 * Checks for missing translation keys across all language files
 * and optionally auto-translates using DeepL API.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');

// Languages - German (de) is the source of truth
const SOURCE_LANG = 'de';
const TARGET_LANGS = ['en', 'fr', 'it'];

// DeepL API (optional - set via env var)
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

/**
 * Flatten nested object to dot-notation keys
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

/**
 * Unflatten dot-notation keys back to nested object
 */
function unflattenObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

/**
 * Translate text using DeepL API
 */
async function translateWithDeepL(text, targetLang) {
  if (!DEEPL_API_KEY) return null;
  
  const langMap = { en: 'EN', fr: 'FR', it: 'IT' };
  const target = langMap[targetLang] || targetLang.toUpperCase();
  
  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: 'DE',
        target_lang: target,
      }),
    });
    
    if (!response.ok) {
      console.error(`DeepL API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.translations?.[0]?.text || null;
  } catch (error) {
    console.error('DeepL translation failed:', error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Checking translations...\n');
  
  // Load source (German) translations
  const sourcePath = path.join(MESSAGES_DIR, `${SOURCE_LANG}.json`);
  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const sourceKeys = flattenObject(sourceData);
  
  console.log(`📚 Source (${SOURCE_LANG}): ${Object.keys(sourceKeys).length} keys\n`);
  
  const missingByLang = {};
  let totalMissing = 0;
  
  // Check each target language
  for (const lang of TARGET_LANGS) {
    const langPath = path.join(MESSAGES_DIR, `${lang}.json`);
    
    if (!fs.existsSync(langPath)) {
      console.log(`⚠️  ${lang}.json does not exist!`);
      continue;
    }
    
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    const langKeys = flattenObject(langData);
    
    // Find missing keys
    const missing = [];
    for (const key of Object.keys(sourceKeys)) {
      if (!(key in langKeys)) {
        missing.push(key);
      }
    }
    
    missingByLang[lang] = missing;
    totalMissing += missing.length;
    
    if (missing.length > 0) {
      console.log(`❌ ${lang}: ${missing.length} missing keys`);
      missing.slice(0, 5).forEach(k => console.log(`   - ${k}`));
      if (missing.length > 5) console.log(`   ... and ${missing.length - 5} more`);
    } else {
      console.log(`✅ ${lang}: Complete`);
    }
  }
  
  console.log(`\n📊 Total missing: ${totalMissing} keys across ${TARGET_LANGS.length} languages`);
  
  // Auto-translate if DeepL key is available and there are missing keys
  if (DEEPL_API_KEY && totalMissing > 0) {
    console.log('\n🤖 Auto-translating with DeepL...\n');
    
    for (const lang of TARGET_LANGS) {
      const missing = missingByLang[lang];
      if (!missing || missing.length === 0) continue;
      
      const langPath = path.join(MESSAGES_DIR, `${lang}.json`);
      const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
      const langKeys = flattenObject(langData);
      
      let translated = 0;
      for (const key of missing) {
        const sourceText = sourceKeys[key];
        if (typeof sourceText !== 'string') continue;
        
        const translatedText = await translateWithDeepL(sourceText, lang);
        if (translatedText) {
          langKeys[key] = translatedText;
          translated++;
          process.stdout.write('.');
        }
      }
      
      if (translated > 0) {
        // Save updated translations
        const unflattened = unflattenObject(langKeys);
        fs.writeFileSync(langPath, JSON.stringify(unflattened, null, 2) + '\n', 'utf8');
        console.log(`\n✅ ${lang}: Translated ${translated} keys`);
      }
    }
    
    console.log('\n🎉 Auto-translation complete!');
  } else if (totalMissing > 0 && !DEEPL_API_KEY) {
    console.log('\n💡 Set DEEPL_API_KEY to enable auto-translation');
    console.log('   Get a free key at: https://www.deepl.com/pro-api');
  }
  
  // Return exit code based on missing translations
  return totalMissing > 0 ? 1 : 0;
}

main().then(code => process.exit(code));
