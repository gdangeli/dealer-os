# Bexio Integration

Diese Dokumentation beschreibt die Bexio-Integration für DealerOS.

## Übersicht

Die Bexio-Integration ermöglicht:
- **OAuth 2.0 Verbindung**: Händler können ihren Bexio-Account sicher verbinden
- **Kunden-Synchronisation**: Kunden werden zu Bexio-Kontakten synchronisiert
- **Rechnungs-Synchronisation**: Rechnungen werden in Bexio erstellt

## Voraussetzungen

### 1. Bexio OAuth App erstellen

1. Gehe zu [Bexio Developer Portal](https://developer.bexio.com/)
2. Erstelle eine neue OAuth App
3. Konfiguriere die Redirect URI: `https://www.dealeros.ch/api/bexio/callback`
4. Notiere Client ID und Client Secret

### 2. Umgebungsvariablen konfigurieren

Füge folgende Variablen zu `.env.local` hinzu:

```env
# Bexio OAuth Configuration
BEXIO_CLIENT_ID=your_client_id
BEXIO_CLIENT_SECRET=your_client_secret
BEXIO_REDIRECT_URI=https://www.dealeros.ch/api/bexio/callback

# Optional: Eigener Encryption Key für Token-Speicherung
# Falls nicht gesetzt, wird SUPABASE_SERVICE_ROLE_KEY verwendet
BEXIO_ENCRYPTION_KEY=your_32_char_encryption_key
```

### 3. Datenbank-Migration ausführen

```sql
-- Führe die Migration aus:
-- supabase/migrations/20250218_bexio_integration.sql
```

## Architektur

### Dateien

```
src/lib/bexio/
├── client.ts    # Bexio API Client mit automatischem Token-Refresh
├── crypto.ts    # AES-256-GCM Verschlüsselung für Tokens
├── oauth.ts     # OAuth 2.0 Helpers
├── sync.ts      # Synchronisations-Logik
└── index.ts     # Re-exports

src/app/api/bexio/
├── connect/route.ts     # OAuth initiieren
├── callback/route.ts    # OAuth Callback
├── disconnect/route.ts  # Verbindung trennen
└── sync/route.ts        # Manuelle Synchronisation

src/app/[locale]/dashboard/settings/bexio/
├── page.tsx                    # Server Component
└── bexio-settings-client.tsx   # Client Component
```

### Sicherheit

- **Token-Verschlüsselung**: Access und Refresh Tokens werden mit AES-256-GCM verschlüsselt in der Datenbank gespeichert
- **CSRF-Schutz**: OAuth State-Parameter enthält Dealer-ID und Timestamp
- **Token-Refresh**: Automatischer Token-Refresh vor Ablauf

### Datenbank-Schema

```sql
-- dealers Tabelle (neue Felder)
bexio_access_token TEXT        -- Verschlüsselter Access Token
bexio_refresh_token TEXT       -- Verschlüsselter Refresh Token
bexio_token_expires_at TIMESTAMPTZ
bexio_company_id INTEGER       -- Bexio Firmen-ID
bexio_company_name TEXT        -- Firmenname (für Anzeige)
bexio_connected_at TIMESTAMPTZ
bexio_is_connected BOOLEAN
bexio_last_sync_at TIMESTAMPTZ
bexio_last_error TEXT

-- customers Tabelle
bexio_contact_id INTEGER       -- Bexio Kontakt-ID
bexio_synced_at TIMESTAMPTZ

-- invoices Tabelle
bexio_invoice_id INTEGER       -- Bexio Rechnungs-ID
bexio_synced_at TIMESTAMPTZ
bexio_pdf_url TEXT
```

## API Endpoints

### GET /api/bexio/connect

Startet den OAuth-Flow. Leitet zu Bexio weiter.

**Query Parameters:**
- `returnUrl`: URL für Redirect nach erfolgreicher Verbindung

### GET /api/bexio/callback

OAuth Callback. Wird von Bexio aufgerufen.

**Query Parameters:**
- `code`: Authorization Code
- `state`: CSRF State

### POST /api/bexio/disconnect

Trennt die Bexio-Verbindung.

**Response:**
```json
{
  "success": true,
  "message": "Bexio-Verbindung erfolgreich getrennt"
}
```

### POST /api/bexio/sync

Startet manuelle Synchronisation.

**Request Body:**
```json
{
  "type": "full" | "customers" | "invoices"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Synchronisation erfolgreich",
  "stats": {
    "customersCreated": 5,
    "customersUpdated": 10,
    "invoicesCreated": 3,
    "invoicesUpdated": 0
  },
  "errors": []
}
```

### GET /api/bexio/sync

Gibt Sync-Status zurück.

**Response:**
```json
{
  "isConnected": true,
  "companyName": "Muster Garage AG",
  "connectedAt": "2025-02-18T10:00:00Z",
  "lastSyncAt": "2025-02-18T15:30:00Z",
  "lastError": null,
  "stats": {
    "customers": { "total": 50, "synced": 45 },
    "invoices": { "total": 20, "synced": 18 }
  }
}
```

## Bexio API Referenz

- **Base URL**: `https://api.bexio.com/2.0`
- **Auth URL**: `https://idp.bexio.com`
- **Dokumentation**: https://docs.bexio.com

### Verwendete Scopes

```
openid profile contact_edit contact_show kb_invoice_edit kb_invoice_show kb_offer_edit kb_offer_show article_show
```

### Rate Limiting

Bexio erlaubt ca. 100 Requests pro Minute. Der Client implementiert automatisches Rate Limiting mit 100ms Delay zwischen Requests.

## Troubleshooting

### "Bexio-Integration ist nicht konfiguriert"

→ Umgebungsvariablen BEXIO_CLIENT_ID, BEXIO_CLIENT_SECRET, BEXIO_REDIRECT_URI setzen

### "Token refresh failed"

→ Verbindung trennen und neu verbinden

### "Rate limited"

→ Warten und erneut versuchen. Bei häufigem Auftreten: Weniger Daten auf einmal synchronisieren

### Tokens können nicht entschlüsselt werden

→ BEXIO_ENCRYPTION_KEY oder SUPABASE_SERVICE_ROLE_KEY hat sich geändert. Verbindung muss neu hergestellt werden.

## Zukünftige Erweiterungen

- [ ] Automatische Synchronisation (Webhooks oder Cron)
- [ ] Bidirektionale Sync (Bexio → DealerOS)
- [ ] Offerten-Synchronisation
- [ ] Artikel/Produkte-Sync
- [ ] Zahlungs-Status Sync
