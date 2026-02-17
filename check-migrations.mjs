#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
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

async function checkMigrations() {
  console.log('🔍 Checking migration status...\n');
  
  try {
    // Test whatsapp_connections table
    const { data: connections, error: connError } = await supabase
      .from('whatsapp_connections')
      .select('id, auto_reply_enabled')
      .limit(1);
    
    if (connError) {
      console.log('❌ whatsapp_connections table does NOT exist');
      console.log('   Error:', connError.message);
      console.log('\n📋 Manual steps required:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] + '/editor');
      console.log('   2. Open SQL Editor');
      console.log('   3. Copy & paste: supabase/migrations/007_whatsapp_integration.sql');
      console.log('   4. Run it');
      console.log('   5. Copy & paste: supabase/migrations/008_add_whatsapp_auto_reply.sql');
      console.log('   6. Run it');
      return false;
    }
    
    console.log('✅ whatsapp_connections table exists');
    if (typeof connections !== 'undefined' && connections !== null) {
      console.log('✅ auto_reply_enabled column exists');
    }
    
    // Test whatsapp_messages table
    const { data: messages, error: msgError } = await supabase
      .from('whatsapp_messages')
      .select('id')
      .limit(1);
    
    if (msgError) {
      console.log('❌ whatsapp_messages table does NOT exist');
      console.log('   Error:', msgError.message);
      return false;
    }
    
    console.log('✅ whatsapp_messages table exists');
    
    // Test leads columns
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, whatsapp_number, whatsapp_last_message_at')
      .limit(1);
    
    if (leadsError) {
      console.log('⚠️  leads table missing whatsapp columns');
      console.log('   Error:', leadsError.message);
      return false;
    }
    
    console.log('✅ leads table has whatsapp columns');
    
    console.log('\n🎉 All migrations are applied!');
    return true;
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    return false;
  }
}

checkMigrations().then(success => process.exit(success ? 0 : 1));
