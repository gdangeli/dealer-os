# Konzept: Offerten- und Rechnungsmodul

## Übersicht

Dieses Dokument beschreibt das Konzept für ein integriertes Offerten- und Rechnungsmodul in DealerOS mit optionaler Bexio-Synchronisation.

---

## 1. Aktueller Workflow (ohne Modul)

```
Lead → Telefon/E-Mail → Excel/Word-Offerte → Manuell in Bexio → Rechnung
        ❌ Kein Tracking    ❌ Doppelerfassung    ❌ Fehleranfällig
```

## 2. Ziel-Workflow (mit Modul)

```
Lead → Offerte erstellen → Verhandlung → Abschluss → Rechnung
  ↓         ↓                  ↓            ↓           ↓
DealerOS  1-Klick aus      Versionen    Status →    Auto-Sync
          Fahrzeug         speichern     "Verkauft"   → Bexio
```

---

## 3. Datenmodell

### 3.1 Neue Tabellen

```sql
-- Kunden (zentral, nicht nur Leads)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id),
  
  -- Stammdaten
  customer_type TEXT NOT NULL DEFAULT 'private', -- 'private' | 'company'
  company_name TEXT,
  salutation TEXT, -- 'Herr' | 'Frau' | 'Firma'
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  -- Adresse
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'CH',
  
  -- Bexio-Sync
  bexio_contact_id INTEGER,
  bexio_synced_at TIMESTAMPTZ,
  
  -- Referenz
  lead_id UUID REFERENCES leads(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offerten
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id),
  
  -- Referenzen
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  lead_id UUID REFERENCES leads(id),
  
  -- Nummern
  quote_number TEXT NOT NULL, -- z.B. "OFF-2024-0042"
  version INTEGER DEFAULT 1,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  -- 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'invoiced'
  
  -- Gültigkeit
  valid_until DATE,
  
  -- Beträge (in Rappen für Präzision)
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  trade_in_value INTEGER DEFAULT 0, -- Eintauschwert
  vat_rate NUMERIC(5,2) DEFAULT 8.1,
  vat_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  
  -- Eintausch-Fahrzeug (optional)
  trade_in_vehicle_id UUID REFERENCES vehicles(id),
  trade_in_description TEXT,
  
  -- Notizen
  internal_notes TEXT,
  customer_notes TEXT, -- Auf Offerte sichtbar
  terms TEXT, -- AGB / Konditionen
  
  -- Bexio-Sync
  bexio_offer_id INTEGER,
  bexio_synced_at TIMESTAMPTZ,
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offerten-Positionen
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  position INTEGER NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'vehicle',
  -- 'vehicle' | 'accessory' | 'service' | 'warranty' | 'discount' | 'trade_in'
  
  -- Beschreibung
  title TEXT NOT NULL,
  description TEXT,
  
  -- Beträge
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price INTEGER NOT NULL, -- in Rappen
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total INTEGER NOT NULL,
  
  -- Optional: Referenz auf Fahrzeug
  vehicle_id UUID REFERENCES vehicles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rechnungen
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id),
  
  -- Referenzen
  customer_id UUID NOT NULL REFERENCES customers(id),
  quote_id UUID REFERENCES quotes(id),
  vehicle_id UUID REFERENCES vehicles(id),
  
  -- Nummern
  invoice_number TEXT NOT NULL, -- z.B. "RE-2024-0042"
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  -- 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
  
  -- Daten
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Beträge
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  trade_in_value INTEGER DEFAULT 0,
  vat_rate NUMERIC(5,2) DEFAULT 8.1,
  vat_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  paid_amount INTEGER DEFAULT 0,
  
  -- Zahlung
  payment_terms TEXT, -- z.B. "30 Tage netto"
  payment_reference TEXT, -- QR-Referenz
  
  -- Bexio-Sync
  bexio_invoice_id INTEGER,
  bexio_synced_at TIMESTAMPTZ,
  bexio_pdf_url TEXT,
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rechnungs-Positionen (ähnlich wie quote_items)
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  position INTEGER NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'vehicle',
  
  title TEXT NOT NULL,
  description TEXT,
  
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price INTEGER NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total INTEGER NOT NULL,
  
  vehicle_id UUID REFERENCES vehicles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bexio-Verbindung pro Händler
CREATE TABLE bexio_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL UNIQUE REFERENCES dealers(id),
  
  -- OAuth Tokens (verschlüsselt speichern!)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Bexio Account Info
  bexio_company_id INTEGER,
  bexio_company_name TEXT,
  
  -- Sync-Einstellungen
  auto_sync_customers BOOLEAN DEFAULT true,
  auto_sync_quotes BOOLEAN DEFAULT false,
  auto_sync_invoices BOOLEAN DEFAULT true,
  default_vat_rate NUMERIC(5,2) DEFAULT 8.1,
  
  -- Status
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Erweiterung bestehender Tabellen

```sql
-- Leads: Verbindung zu Kunde
ALTER TABLE leads ADD COLUMN customer_id UUID REFERENCES customers(id);

-- Vehicles: Verkaufsstatus
ALTER TABLE vehicles ADD COLUMN sold_at TIMESTAMPTZ;
ALTER TABLE vehicles ADD COLUMN sold_price INTEGER;
ALTER TABLE vehicles ADD COLUMN sold_to_customer_id UUID REFERENCES customers(id);
ALTER TABLE vehicles ADD COLUMN final_invoice_id UUID REFERENCES invoices(id);
```

---

## 4. User Interface

### 4.1 Navigation (Sidebar)

```
Dashboard
Fahrzeuge
Leads
──────────
📄 Offerten      ← NEU
🧾 Rechnungen    ← NEU
👥 Kunden        ← NEU
──────────
Analytics
Einstellungen
  └─ Bexio       ← NEU
```

### 4.2 Offerten-Liste (`/dashboard/quotes`)

| Nummer | Kunde | Fahrzeug | Betrag | Status | Gültig bis | Aktionen |
|--------|-------|----------|--------|--------|------------|----------|
| OFF-2024-0042 | Max Müller | BMW 320d | 35'900 | Gesendet | 15.03.2024 | 👁️ ✏️ 📧 |

**Filter:** Status, Datum, Verkäufer
**Aktionen:** Neue Offerte, Export

### 4.3 Offerte erstellen/bearbeiten

```
┌─────────────────────────────────────────────────────────────┐
│ Offerte OFF-2024-0043                          [Entwurf ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ KUNDE                              FAHRZEUG                 │
│ ┌──────────────────────┐          ┌──────────────────────┐ │
│ │ [Kunde suchen... 🔍] │          │ [Fahrzeug wählen 🔍] │ │
│ │ oder [+ Neuer Kunde] │          │ BMW 320d Touring     │ │
│ └──────────────────────┘          │ 2021 · 45'000 km     │ │
│                                   │ Listenpreis: 38'500  │ │
│ Max Müller                        └──────────────────────┘ │
│ Musterstrasse 123                                          │
│ 8000 Zürich                                                │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ POSITIONEN                                                 │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 1. BMW 320d Touring 2021                    38'500.- │   │
│ │ 2. Winterräder Alu 18"                       1'200.- │   │
│ │ 3. Garantie 24 Monate                          890.- │   │
│ │ 4. Eintausch: VW Golf 2018               - 12'000.- │   │
│ │                                                      │   │
│ │ [+ Position hinzufügen]                              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│                              Zwischensumme:      40'590.-  │
│                              Rabatt (5%):       - 2'030.-  │
│                              Eintausch:        - 12'000.-  │
│                              ────────────────────────────  │
│                              Netto:              26'560.-  │
│                              MwSt (8.1%):         2'151.-  │
│                              ════════════════════════════  │
│                              TOTAL:              28'711.-  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ NOTIZEN (intern)                                           │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Kunde verhandelt noch, max. 5% Rabatt möglich        │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ KONDITIONEN (auf Offerte)                                  │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Gültig bis: [15.03.2024]                             │   │
│ │ Lieferzeit ca. 2 Wochen nach Vertragsunterzeichnung  │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ [Speichern]  [PDF Vorschau]  [Per E-Mail senden]  [→Bexio] │
└────────────────────────────────────────────────────────────┘
```

### 4.4 Quick Actions

**Aus Fahrzeug-Detailseite:**
```
[Offerte erstellen] → Öffnet Offerten-Editor mit vorausgefülltem Fahrzeug
```

**Aus Lead-Detailseite:**
```
[Offerte erstellen] → Öffnet Offerten-Editor mit Kunde + evtl. Fahrzeug aus Lead
```

**Aus Offerte:**
```
[In Rechnung umwandeln] → Erstellt Rechnung aus akzeptierter Offerte
```

---

## 5. Bexio-Integration

### 5.1 OAuth Flow

```
1. Händler klickt "Mit Bexio verbinden"
2. Redirect zu Bexio OAuth (Scopes: contact_edit, kb_offer_edit, kb_invoice_edit)
3. Callback mit Code
4. Token-Exchange (Access + Refresh)
5. Speichern in bexio_connections (verschlüsselt)
```

### 5.2 Sync-Logik

| Aktion in DealerOS | Bexio-Sync |
|--------------------|------------|
| Kunde erstellen | POST /2.0/contact |
| Offerte senden | POST /2.0/kb_offer (wenn auto_sync_quotes) |
| Rechnung erstellen | POST /2.0/kb_invoice (wenn auto_sync_invoices) |
| Zahlung erfassen | PUT /2.0/kb_invoice/{id} → Status "paid" |

### 5.3 Bidirektionaler Sync (Phase 2)

- Webhook von Bexio bei Änderungen
- Oder: Polling alle 15 Min für Zahlungsstatus

### 5.4 Einstellungen-UI

```
┌─────────────────────────────────────────────────────────────┐
│ Bexio-Integration                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Status: ✅ Verbunden mit "Garage Müller AG"                │
│ Letzte Synchronisation: vor 5 Minuten                      │
│                                                             │
│ [Verbindung trennen]                                       │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Automatische Synchronisation:                              │
│                                                             │
│ ☑️ Kunden automatisch synchronisieren                      │
│ ☐ Offerten automatisch synchronisieren                     │
│ ☑️ Rechnungen automatisch synchronisieren                  │
│                                                             │
│ Standard-MwSt-Satz: [8.1] %                                │
│                                                             │
│ [Einstellungen speichern]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. PDF-Generierung

### 6.1 Optionen

1. **Bexio PDF** (empfohlen wenn verbunden)
   - GET /2.0/kb_offer/{id}/pdf
   - Nutzt Bexio-Templates des Kunden

2. **Eigene PDF** (react-pdf oder Puppeteer)
   - Volle Kontrolle über Design
   - Funktioniert offline
   - Höherer Wartungsaufwand

### 6.2 Empfehlung

- **Mit Bexio:** Bexio-PDF nutzen (Konsistenz mit Buchhaltung)
- **Ohne Bexio:** Einfaches PDF mit react-pdf, DealerOS-Branding

---

## 7. Implementierungs-Phasen

### Phase 1: Basis (1-2 Wochen)
- [ ] Datenbank-Schema (customers, quotes, quote_items)
- [ ] Kunden-CRUD
- [ ] Offerten-CRUD (ohne Bexio)
- [ ] Einfache PDF-Vorschau

### Phase 2: Bexio-Anbindung (1 Woche)
- [ ] OAuth Flow
- [ ] Kunden-Sync
- [ ] Offerten-Sync (optional)

### Phase 3: Rechnungen (1 Woche)
- [ ] Rechnungs-CRUD
- [ ] Offerte → Rechnung Konvertierung
- [ ] Bexio-Rechnungs-Sync
- [ ] Zahlungsstatus

### Phase 4: Polish (3-5 Tage)
- [ ] E-Mail-Versand (Offerte/Rechnung)
- [ ] Dashboard-Widgets (offene Offerten, überfällige Rechnungen)
- [ ] Reporting

---

## 8. Offene Fragen

1. **Nummernkreise:** Soll DealerOS eigene Nummern vergeben oder Bexio-Nummern übernehmen?
   - Empfehlung: Eigene Nummern, Bexio-ID als Referenz speichern

2. **Eintausch-Handling:** Eintausch als negative Position oder separates Feld?
   - Empfehlung: Separates Feld (klarer für Reporting)

3. **Mehrere Fahrzeuge pro Offerte:** Erlauben?
   - Empfehlung: Ja, für Händler mit Flottenkunden

4. **Teilzahlungen:** Unterstützen?
   - Empfehlung: Phase 2, erstmal nur "bezahlt/offen"

5. **Ohne Bexio nutzbar:** Muss das Modul auch standalone funktionieren?
   - Empfehlung: Ja! Bexio ist optional, nicht Pflicht

---

## 9. Technische Details

### API Routes

```
/api/customers          GET, POST
/api/customers/[id]     GET, PUT, DELETE
/api/customers/[id]/sync-bexio  POST

/api/quotes             GET, POST
/api/quotes/[id]        GET, PUT, DELETE
/api/quotes/[id]/pdf    GET
/api/quotes/[id]/send   POST (E-Mail)
/api/quotes/[id]/convert-to-invoice  POST
/api/quotes/[id]/sync-bexio  POST

/api/invoices           GET, POST
/api/invoices/[id]      GET, PUT, DELETE
/api/invoices/[id]/pdf  GET
/api/invoices/[id]/send POST
/api/invoices/[id]/mark-paid  POST
/api/invoices/[id]/sync-bexio  POST

/api/bexio/connect      GET (OAuth redirect)
/api/bexio/callback     GET (OAuth callback)
/api/bexio/disconnect   POST
/api/bexio/sync         POST (manual full sync)
```

### Komponenten

```
/components/quotes/
  QuoteForm.tsx
  QuoteItemRow.tsx
  QuotePDFPreview.tsx
  QuoteStatusBadge.tsx
  
/components/invoices/
  InvoiceForm.tsx
  InvoiceStatusBadge.tsx
  PaymentTracker.tsx
  
/components/customers/
  CustomerForm.tsx
  CustomerSearch.tsx
  CustomerCard.tsx
  
/components/bexio/
  BexioConnectButton.tsx
  BexioSyncStatus.tsx
  BexioSettings.tsx
```

---

## 10. Zusammenfassung

Dieses Modul schliesst die Lücke zwischen Lead-Management und Buchhaltung. Der Schlüssel zum Erfolg:

1. **Standalone first** - Funktioniert ohne Bexio
2. **Bexio als Upgrade** - Nahtlose Integration wenn gewünscht
3. **1-Klick Workflows** - Fahrzeug → Offerte → Rechnung
4. **Mobile-friendly** - Offerte unterwegs erstellen

Mit diesem Modul kann DealerOS das Hauptargument von Car2Deal kontern: "Alles in einem Tool".
