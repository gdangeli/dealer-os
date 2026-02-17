# WhatsApp Integration - Database Migration

## Status
✅ Migration files created:
- `supabase/migrations/007_whatsapp_integration.sql`
- `supabase/migrations/008_add_whatsapp_auto_reply.sql`
- `combined-whatsapp-migration.sql` (beide kombiniert)

## Migration ausführen

### Option 1: Supabase SQL Editor (EMPFOHLEN - 2 Minuten)

1. Öffne: https://supabase.com/dashboard/project/xcefcwcpqbhglwholvvd/sql/new

2. Kopiere den Inhalt von `combined-whatsapp-migration.sql`

3. Füge ihn in den SQL Editor ein und klicke "Run"

4. Fertig! ✅

### Option 2: Supabase CLI

```bash
# Login (öffnet Browser)
npx supabase login

# Project linken
npx supabase link --project-ref xcefcwcpqbhglwholvvd

# Migrations pushen
npx supabase db push
```

### Option 3: psql mit DB Password

Wenn du das Database Password hast:

1. Hole Passwort aus: https://supabase.com/dashboard/project/xcefcwcpqbhglwholvvd/settings/database

2. Füge zu `.env.local` hinzu:
   ```
   SUPABASE_DB_PASSWORD='dein-passwort-hier'
   ```

3. Führe aus:
   ```bash
   ./run-psql-migration.sh
   ```

## Prüfen ob Migration erfolgreich war

```bash
node check-migrations.mjs
```

Erwartete Ausgabe:
```
✅ whatsapp_connections table exists
✅ auto_reply_enabled column exists
✅ whatsapp_messages table exists
✅ leads table has whatsapp columns
🎉 All migrations are applied!
```

## Nächste Schritte

Nach erfolgreicher Migration:
1. Settings UI implementieren (`/dashboard/settings/whatsapp`)
2. Conversations UI implementieren (`/dashboard/whatsapp`)
