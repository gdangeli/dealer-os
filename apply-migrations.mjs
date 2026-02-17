#!/usr/bin/env node
import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Extract project ref
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref from SUPABASE_URL');
  process.exit(1);
}

// Use transaction pooler with postgres user
// Format: postgresql://postgres.[project-ref]:[service-role-key]@aws-0-[region].pooler.supabase.com:6543/postgres
// But we need the actual pooler URL. Let's try the direct connection with service role.

// Actually, for migrations we should use the direct database connection
// The pooler URL format for Supabase is:
// postgresql://postgres.xcefcwcpqbhglwholvvd:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

console.log('⚠️  Direct database connection required for migrations.\n');
console.log('📋 Please run these SQL files manually in Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');
console.log('1️⃣  First run: supabase/migrations/007_whatsapp_integration.sql');
console.log('2️⃣  Then run: supabase/migrations/008_add_whatsapp_auto_reply.sql\n');

console.log('📄 Or install Supabase CLI and run:');
console.log('   npx supabase link --project-ref ' + projectRef);
console.log('   npx supabase db push\n');

// Alternative: Create a combined file for easy copy-paste
const combinedSql = 
  fs.readFileSync('./supabase/migrations/007_whatsapp_integration.sql', 'utf8') + 
  '\n\n-- ========================================\n' +
  '-- Migration 008: Auto-Reply\n' +
  '-- ========================================\n\n' +
  fs.readFileSync('./supabase/migrations/008_add_whatsapp_auto_reply.sql', 'utf8');

fs.writeFileSync('./combined-whatsapp-migration.sql', combinedSql);
console.log('✅ Created combined-whatsapp-migration.sql for easy copy-paste\n');

process.exit(0);
