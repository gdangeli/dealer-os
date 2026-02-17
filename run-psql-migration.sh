#!/bin/bash

# Load env variables
source .env.local

PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | grep -oP '(?<=https://).*(?=\.supabase\.co)')

echo "🔌 Attempting database connection..."
echo "   Project: $PROJECT_REF"
echo ""

# Try connection pooler (port 6543) with service role key as password
# Note: For production, you'd need the actual DB password from Supabase settings

# Let's try the direct connection with transaction pooler
PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
  "postgresql://postgres.$PROJECT_REF:@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" \
  -f combined-whatsapp-migration.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration applied successfully!"
  exit 0
else
  echo ""
  echo "❌ Connection failed. You need the database password from Supabase."
  echo ""
  echo "📋 Manual steps:"
  echo "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
  echo "   2. Copy the 'Connection string' and note the password"
  echo "   3. Add to .env.local: SUPABASE_DB_PASSWORD='your-password'"
  echo "   4. OR copy-paste combined-whatsapp-migration.sql into SQL Editor:"
  echo "      https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
  exit 1
fi
