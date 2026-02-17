# WhatsApp Business Integration - Phase 1

## ✅ Implementiert

### 1. Datenbank-Schema
- **Migration**: `supabase/migrations/008_add_whatsapp_auto_reply.sql`
- Erweitert `whatsapp_connections` mit:
  - `auto_reply_enabled` (Boolean)
  - `auto_reply_message` (Text)
- Muss manuell im Supabase SQL Editor ausgeführt werden

### 2. Webhook mit Auto-Reply
- **Route**: `/api/webhooks/whatsapp/route.ts`
- ✅ Empfängt eingehende WhatsApp-Nachrichten
- ✅ Erstellt automatisch Leads bei neuen Konversationen
- ✅ Sendet Auto-Reply wenn aktiviert (nur bei neuen Leads)
- ✅ Speichert alle Nachrichten in DB
- ✅ Erstellt Lead-Activities

### 3. WhatsApp Client Library
- **Datei**: `src/lib/whatsapp/client.ts`
- ✅ `sendText()` - Textnachrichten senden
- ✅ `sendTemplate()` - Template-Nachrichten senden
- ✅ `markAsRead()` - Nachrichten als gelesen markieren
- ✅ `getMediaUrl()` - Media-URLs abrufen
- ✅ `downloadMedia()` - Media-Dateien herunterladen

### 4. Send Message API
- **Route**: `/api/whatsapp/send/route.ts`
- ✅ POST-Endpoint zum Senden von Nachrichten
- ✅ Validiert Lead und Verbindung
- ✅ Speichert gesendete Nachrichten
- ✅ Erstellt Lead-Activities

### 5. Settings UI
- **Route**: `/dashboard/settings/whatsapp`
- ✅ Setup-Wizard für WhatsApp Business Account
- ✅ Anzeige: Verbindungsstatus, Telefonnummer
- ✅ Webhook URL und Verify Token
- ✅ Auto-Reply aktivieren/deaktivieren
- ✅ Auto-Reply Nachricht bearbeiten

### 6. Conversations UI
- **Route**: `/dashboard/whatsapp`
- ✅ Split-View: Conversations-Liste (links) + Chat (rechts)
- ✅ Gruppierte Nachrichten pro Kunde
- ✅ Echtzeit-Updates via Supabase Realtime
- ✅ Nachrichten senden
- ✅ Lead-Verknüpfung anzeigen
- ✅ Nachrichtenstatus (gesendet, zugestellt, gelesen)

### 7. Navigation
- ✅ WhatsApp-Link im Dashboard-Menü
- ✅ WhatsApp-Einrichtung im Settings-Tab "Kanäle"

## 📋 Setup-Anleitung

### 1. Migration ausführen
```sql
-- Im Supabase SQL Editor ausführen
-- Datei: supabase/migrations/008_add_whatsapp_auto_reply.sql
```

### 2. Environment Variables
Stelle sicher, dass folgende ENV-Variablen gesetzt sind:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WHATSAPP_VERIFY_TOKEN=dealer-os-whatsapp-verify
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. WhatsApp Business App einrichten
1. Gehe zu [Meta Developer Console](https://developers.facebook.com/)
2. Erstelle eine WhatsApp Business App
3. Hole folgende Credentials:
   - Phone Number ID
   - WhatsApp Business Account ID (WABA ID)
   - Access Token
4. Konfiguriere den Webhook:
   - URL: `https://your-domain.com/api/webhooks/whatsapp`
   - Verify Token: (siehe Settings UI)
   - Subscribe to: `messages`

### 4. In DealerOS einrichten
1. Navigiere zu `/dashboard/settings/whatsapp`
2. Gib die WhatsApp-Credentials ein
3. Speichere die Verbindung
4. Teste mit einer Nachricht an deine WhatsApp Business Nummer

## 🎯 Features

### Auto-Reply
- Wird automatisch bei neuen Konversationen gesendet
- Nur wenn `auto_reply_enabled = true`
- Nur für neue Leads (nicht bei bestehenden)
- Nachricht kann in Settings angepasst werden

### Konversations-Verwaltung
- Alle Nachrichten werden gruppiert nach Kundennummer
- Echtzeit-Updates wenn neue Nachrichten eintreffen
- Lead-Verknüpfung wird automatisch erstellt
- Nachrichten können direkt aus dem Chat gesendet werden

### Lead-Integration
- Neue WhatsApp-Nachrichten erstellen automatisch Leads
- Source: `whatsapp`
- `whatsapp_number` und `whatsapp_last_message_at` werden gesetzt
- Lead-Activities werden für alle Nachrichten erstellt

## 🔧 Technische Details

### Datenbank-Struktur
```
whatsapp_connections
├── id (uuid)
├── dealer_id (uuid) → dealers.id
├── phone_number_id (varchar)
├── phone_number (varchar)
├── waba_id (varchar)
├── access_token (text) - sollte verschlüsselt werden
├── status (varchar) - active|disconnected|pending
├── display_name (varchar)
├── verify_token (varchar)
├── auto_reply_enabled (boolean) ← NEU
├── auto_reply_message (text) ← NEU
├── created_at (timestamp)
└── updated_at (timestamp)

whatsapp_messages
├── id (uuid)
├── dealer_id (uuid) → dealers.id
├── lead_id (uuid) → leads.id
├── wamid (varchar) - WhatsApp Message ID
├── direction (varchar) - inbound|outbound
├── from_number (varchar)
├── to_number (varchar)
├── contact_name (varchar)
├── message_type (varchar)
├── content (text)
├── media_id (varchar)
├── media_url (text)
├── media_mime_type (varchar)
├── media_filename (varchar)
├── template_name (varchar)
├── template_params (jsonb)
├── status (varchar) - pending|sent|delivered|read|failed
├── error_code (varchar)
├── error_message (text)
├── timestamp (timestamp)
└── created_at (timestamp)
```

### API-Endpunkte

#### GET/POST `/api/webhooks/whatsapp`
- **GET**: Webhook-Verification (Meta Challenge)
- **POST**: Eingehende Nachrichten verarbeiten

#### POST `/api/whatsapp/send`
```json
{
  "lead_id": "uuid",
  "message": "Deine Nachricht"
}
```

Response:
```json
{
  "success": true,
  "message_id": "wamid.xxx",
  "wamid": "wamid.xxx"
}
```

## 🚀 Nächste Schritte (Phase 2)

Mögliche Erweiterungen:
- [ ] Media-Upload (Bilder, Dokumente)
- [ ] Template-Nachrichten (für Marketing)
- [ ] Message Templates verwalten
- [ ] WhatsApp Business Profile bearbeiten
- [ ] Mehrere WhatsApp-Nummern pro Dealer
- [ ] Quick-Replies/Buttons
- [ ] Typing-Indikator
- [ ] Unread-Counter
- [ ] Nachrichtensuche
- [ ] Export von Konversationen

## 📝 Dependencies

Neu hinzugefügt:
- `date-fns` - Datum-Formatierung

Bestehende:
- `@supabase/supabase-js` - Datenbank
- `lucide-react` - Icons
- `sonner` - Toast-Notifications
- `react-hook-form` - Formular-Verwaltung
- `zod` - Validation

## 🐛 Bekannte Probleme

- [ ] Access Token sollte verschlüsselt gespeichert werden
- [ ] Fehlerbehandlung bei WhatsApp API Rate Limits
- [ ] Media-Downloads noch nicht implementiert in UI
- [ ] Keine Pagination für Conversations-Liste
- [ ] Keine Suche in Nachrichten

## 📄 Lizenz

Teil von DealerOS - Siehe Root-Lizenz
