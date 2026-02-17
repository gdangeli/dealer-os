import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function applyMigration() {
  console.log('📦 Applying WhatsApp Auto-Reply migration...\n');
  
  try {
    // Read migration SQL
    const sql = fs.readFileSync('./supabase/migrations/008_add_whatsapp_auto_reply.sql', 'utf8');
    
    // Execute via RPC (if you have a function) or manual SQL
    // Since Supabase JS doesn't support raw SQL, we'll do it column by column
    
    // Check if columns already exist
    const { data: testConnection } = await supabase
      .from('whatsapp_connections')
      .select('auto_reply_enabled')
      .limit(1);
    
    if (testConnection !== null) {
      console.log('✅ auto_reply_enabled column already exists');
    } else {
      console.log('❌ Migration needs to be run manually in Supabase SQL Editor');
      console.log('\nSQL to execute:');
      console.log('═'.repeat(60));
      console.log(sql);
      console.log('═'.repeat(60));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor:');
    console.log('   supabase/migrations/008_add_whatsapp_auto_reply.sql');
  }
}

applyMigration();
