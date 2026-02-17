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

// Extract project ref from URL: https://xcefcwcpqbhglwholvvd.supabase.co
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref from SUPABASE_URL');
  process.exit(1);
}

// For hosted Supabase, we need the DB password
// This should be in SUPABASE_DB_PASSWORD or we use service role key approach
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!dbPassword) {
  console.error('❌ Missing SUPABASE_DB_PASSWORD in .env.local');
  console.error('   Get it from: Supabase Dashboard → Settings → Database → Connection string');
  console.error('   Add to .env.local: SUPABASE_DB_PASSWORD="your-db-password"');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

async function runMigrations() {
  const client = new pg.Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    const migrations = [
      './supabase/migrations/007_whatsapp_integration.sql',
      './supabase/migrations/008_add_whatsapp_auto_reply.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`📝 Running: ${migrationFile}`);
      const sql = fs.readFileSync(migrationFile, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ ${migrationFile} executed successfully\n`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  ${migrationFile} - already applied (skipped)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 All migrations completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
