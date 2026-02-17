import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl ? 'found' : 'missing');
console.log('Key:', supabaseKey ? 'found' : 'missing');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  // Check if table already exists
  const { data: existing, error } = await supabase
    .from('email_templates')
    .select('id')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.log('❌ Tabelle existiert nicht noch.');
    console.log('Migration muss im Supabase SQL Editor ausgeführt werden.');
    return;
  }
  
  if (existing !== null) {
    console.log('✅ Tabelle email_templates existiert bereits!');
    const count = existing.length;
    console.log(`   ${count} Einträge gefunden.`);
    return;
  }
  
  console.log('Error:', error);
}

runMigration().catch(console.error);
