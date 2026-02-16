# DealerOS Development Log

## 2025-01-XX: E-Mail-Benachrichtigungen implementiert

### Überblick
E-Mail-Benachrichtigungssystem mit Resend als Provider implementiert.

### Neue Features

#### 1. Neue Lead-Benachrichtigung
- E-Mail wird gesendet wenn ein neuer Lead erstellt wird
- Enthält: Kundenname, Kontaktdaten, Fahrzeuginteresse, Nachricht
- Kann pro Dealer in Settings aktiviert/deaktiviert werden (`notification_new_lead`)

#### 2. Tägliche Zusammenfassung
- Cron Job läuft täglich um 08:00 UTC (vercel.json)
- Enthält: Neue Leads von gestern, offene Anfragen, Fahrzeuge im Bestand, Langsteher-Warnung
- Aktivierbar via `notification_daily_summary` Setting

#### 3. Langsteher-Warnung
- Wöchentlicher Cron Job (Montag 09:00 UTC)
- Warnt bei Fahrzeugen die länger als X Tage im Bestand sind
- Schwellenwert konfigurierbar via `notification_longstanding_days` (Default: 30)

### Technische Details

**Neue Dateien:**
- `src/lib/email/index.ts` - Resend Client & sendEmail Funktion
- `src/lib/email/templates.ts` - Deutsche E-Mail-Templates
- `src/lib/notifications/trigger.ts` - Client-seitiger Notification Trigger
- `src/app/api/notifications/new-lead/route.ts` - API Route für neue Leads
- `src/app/api/notifications/daily-summary/route.ts` - Cron Job für tägliche Zusammenfassung
- `src/app/api/notifications/longstanding/route.ts` - Cron Job für Langsteher
- `vercel.json` - Cron Job Konfiguration

**Geänderte Dateien:**
- `src/app/[locale]/dashboard/leads/new/page.tsx` - Trigger nach Lead-Erstellung
- `.env.example` - Neue Umgebungsvariablen dokumentiert

**Neue Dependencies:**
- `resend` - E-Mail Provider SDK

### Setup
1. Resend Account erstellen: https://resend.com
2. API Key generieren
3. Domain verifizieren (für Produktions-E-Mails)
4. Environment Variables setzen:
   ```
   RESEND_API_KEY=re_xxxx
   RESEND_FROM_EMAIL=DealerOS <noreply@dealer-os.ch>
   SUPABASE_SERVICE_ROLE_KEY=xxx
   CRON_SECRET=random-secret
   ```

### Offene Punkte
- [ ] Supabase Webhook einrichten für Leads von externen Quellen (AutoScout24 etc.)
- [ ] Rate Limiting für Langsteher-Warnungen (max 1x pro Woche pro Dealer)
- [ ] E-Mail-Tracking (Öffnungsrate, Klicks)
- [ ] Abmelde-Link in Footern

---
