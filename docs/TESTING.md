# Testing Guide - Dealer OS

## Übersicht

Dealer OS verwendet **Playwright** für End-to-End (E2E) Tests. Die Tests decken kritische Benutzerflows ab, von der Landing Page bis hin zu authentifizierten Dashboard-Funktionen.

### Tech Stack

| Tool | Version | Zweck |
|------|---------|-------|
| Playwright | latest | E2E Testing Framework |
| Vitest | latest | Unit Tests |
| Node.js | 22 | Runtime |

---

## Tests lokal ausführen

### Voraussetzungen

```bash
# Dependencies installieren
npm install

# Playwright Browser installieren
npx playwright install
```

### Test-Befehle

```bash
# Alle Tests (Unit + E2E)
npm run test

# Nur E2E Tests
npm run test:e2e

# E2E Tests mit UI
npm run test:e2e:ui

# E2E Tests im Browser sichtbar
npm run test:e2e:headed

# Nur Unit Tests
npm run test:unit
```

### Umgebungsvariablen

Erstelle eine `.env.local` Datei (oder setze in CI):

```bash
# Authentifizierte Tests benötigen:
TEST_USER_EMAIL=dein-test-user@example.com
TEST_USER_PASSWORD=dein-test-passwort

# Supabase (erforderlich)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Stripe Tests (optional für Subscription-Tests)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

> ⚠️ **Wichtig:** Ohne `TEST_USER_EMAIL` und `TEST_USER_PASSWORD` werden authentifizierte Tests übersprungen.

---

## Test-Suites

### 1. Landing Page (`landing.spec.ts`)
**Keine Authentifizierung nötig**

Testet die öffentliche Landing Page:
- ✅ Hero Section mit Headline
- ✅ Navigation Header
- ✅ CTA Button → Register
- ✅ Login Link
- ✅ Features Section
- ✅ Pricing Section
- ✅ FAQ Section
- ✅ Testimonials
- ✅ Footer mit Impressum/Datenschutz/AGB
- ✅ Demo Video Button
- ✅ Mobile Responsiveness

### 2. Authentication (`auth.spec.ts`)
**Keine Authentifizierung nötig**

Testet Login/Register Flows:
- ✅ Login-Formular Elemente
- ✅ Pflichtfelder-Validierung
- ✅ Fehler bei ungültigen Credentials
- ✅ Register-Formular
- ✅ Navigation zwischen Login/Register
- ✅ Protected Routes Redirect (Dashboard, Vehicles, Leads, Settings, Onboarding)

### 3. Dashboard (`dashboard.spec.ts`)
**Authentifizierung erforderlich**

Testet Dashboard-Zugang:
- ✅ Redirect bei nicht-authentifizierten Usern
- ✅ Dashboard nach Login sichtbar
- ✅ Navigation zu Fahrzeuge, Leads, Analytics, Settings

### 4. Dashboard Widgets (`dashboard-widgets.spec.ts`)
**Authentifizierung erforderlich**

Testet Widget-Konfiguration:
- ✅ "Dashboard anpassen" Button
- ✅ Edit-Modus mit Toggle-Panel
- ✅ Widgets ein-/ausschalten
- ✅ Speichern/Abbrechen
- ✅ Zurücksetzen auf Standard
- ✅ Drag-Handles im Edit-Modus

### 5. Vehicles (`vehicles.spec.ts`)
**Authentifizierung erforderlich**

Testet Fahrzeug-Management:
- ✅ Redirect bei nicht-authentifizierten Usern
- ✅ Fahrzeugliste anzeigen
- ✅ "Fahrzeug hinzufügen" Button
- ✅ Neues Fahrzeug Formular

### 6. Vehicle Import (`vehicle-import.spec.ts`)
**Authentifizierung erforderlich + Supabase Service Role Key**

Testet CSV/Excel Import:
- ✅ Import-Seite Navigation
- ✅ CSV Upload & Preview
- ✅ Auto-Mapping von Spalten
- ✅ Validierung Pflichtfelder
- ✅ Erfolgreicher Import
- ✅ Fortschrittsanzeige
- ✅ Dateiformat-Validierung
- ✅ Import zurücksetzen

### 7. Leads (`leads.spec.ts`)
**Authentifizierung erforderlich**

Testet Lead-Management:
- ✅ Redirect bei nicht-authentifizierten Usern
- ✅ Leads-Liste anzeigen
- ✅ "Lead hinzufügen" Button
- ✅ Neuer Lead Formular (ohne Crashes)
- ✅ Lead erstellen (Name, Email)

### 8. Lead Timeline (`lead-timeline.spec.ts`)
**Authentifizierung erforderlich**

Testet Lead-Aktivitäten:
- ✅ Timeline-Komponente sichtbar
- ✅ Aktivitätstypen (Notiz, Anruf, E-Mail, Status)
- ✅ Neue Aktivität hinzufügen
- ✅ Input nach Submit leeren
- ✅ Leere Aktivität verhindern
- ✅ Chronologische Sortierung
- ✅ Timestamps & Icons
- ✅ Follow-up Reminders (optional)
- ✅ Fehlerbehandlung bei Netzwerkfehlern
- ✅ Performance (< 5s Ladezeit)

### 9. CSV Export (`csv-export.spec.ts`)
**Authentifizierung erforderlich**

Testet Export-Funktionalität:
- ✅ Export API erfordert Auth
- ✅ Export-Option auf Fahrzeugseite
- ✅ Download auslösen

### 10. Image Upload (`image-upload.spec.ts`)
**Authentifizierung erforderlich**

Testet Bild-Upload:
- ✅ Formular erfordert Auth
- ✅ File Input vorhanden
- ✅ Upload-Area/Dropzone

### 11. Settings (`settings.spec.ts`)
**Authentifizierung erforderlich**

Testet Einstellungen:
- ✅ Redirect bei nicht-authentifizierten Usern
- ✅ Settings-Seite anzeigen
- ✅ Formularfelder vorhanden
- ✅ Speichern-Button

### 12. Onboarding (`onboarding.spec.ts`)
**Authentifizierung erforderlich**

Testet Onboarding-Wizard:
- ✅ Redirect bei nicht-authentifizierten Usern
- ✅ Weiter-Button sichtbar
- ✅ Redirect zu Dashboard wenn abgeschlossen

### 13. Stripe Subscription (`stripe-subscription.spec.ts`)
**Authentifizierung + Stripe Keys erforderlich**

Testet Subscription-Flow:
- ✅ Billing-Seite anzeigen
- ✅ Plan-Limits & Features
- ✅ Monatlich/Jährlich Toggle
- ✅ Checkout mit gültiger Karte (4242...)
- ✅ Abgelehnte Karte (4000 0000 0000 0002)
- ✅ Abgebrochener Checkout
- ✅ Duplikat-Subscriptions verhindern
- ✅ Stripe Customer Portal
- ✅ Trial-Information
- ✅ Stripe API Verifikation (Subscription & Customer)

---

## Kritische Flows & Test-Abdeckung

### 🔴 Business-kritisch

| Flow | Abgedeckt | Test-Datei |
|------|-----------|------------|
| User Registration | ✅ | auth.spec.ts |
| User Login | ✅ | auth.spec.ts |
| Protected Routes | ✅ | auth.spec.ts |
| Dashboard Access | ✅ | dashboard.spec.ts |
| Fahrzeug anlegen | ✅ | vehicles.spec.ts |
| Fahrzeug Import | ✅ | vehicle-import.spec.ts |
| Lead anlegen | ✅ | leads.spec.ts |
| Stripe Checkout | ✅ | stripe-subscription.spec.ts |
| Subscription Management | ✅ | stripe-subscription.spec.ts |

### 🟡 Wichtig

| Flow | Abgedeckt | Test-Datei |
|------|-----------|------------|
| Landing Page SEO | ✅ | landing.spec.ts |
| Lead Timeline | ✅ | lead-timeline.spec.ts |
| Dashboard Widgets | ✅ | dashboard-widgets.spec.ts |
| CSV Export | ✅ | csv-export.spec.ts |
| Einstellungen | ✅ | settings.spec.ts |
| Onboarding | ✅ | onboarding.spec.ts |

---

## CI/CD Integration

### GitHub Actions

Die Tests laufen automatisch bei:
- Push auf `main`
- Pull Requests gegen `main`
- Manueller Trigger (workflow_dispatch)

**Workflow:** `.github/workflows/test.yml`

```yaml
jobs:
  test:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - Checkout
      - Setup Node.js 22
      - npm ci
      - Install Playwright (Chromium)
      - Build App
      - Run E2E Tests (no-auth project)
      - Upload Artifacts bei Fehler
```

### Benötigte GitHub Secrets

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_STARTER_MONTHLY_PRICE_ID
STRIPE_STARTER_YEARLY_PRICE_ID
STRIPE_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_YEARLY_PRICE_ID
STRIPE_BUSINESS_MONTHLY_PRICE_ID
STRIPE_BUSINESS_YEARLY_PRICE_ID

# Test User
TEST_USER_EMAIL
TEST_USER_PASSWORD
```

---

## Playwright Konfiguration

**Datei:** `playwright.config.ts`

### Projects

| Project | Tests | Auth State |
|---------|-------|------------|
| `setup` | auth.setup.ts | Erstellt Session |
| `no-auth` | landing, auth specs | Keine |
| `authenticated` | Alle anderen | Von Setup |

### Einstellungen

```typescript
{
  testDir: './e2e',
  fullyParallel: false,      // Sequentiell für Stabilität
  timeout: 30000,            // 30s pro Test
  retries: 2,                // In CI
  workers: 1,                // Single Worker
  reporter: ['line', 'html'],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',  // Startet automatisch
    url: 'http://localhost:3000',
    timeout: 120000,
  },
}
```

---

## Fehlerbehebung

### Test schlägt fehl mit "Requires TEST_USER_EMAIL"
→ Setze die Umgebungsvariablen `TEST_USER_EMAIL` und `TEST_USER_PASSWORD`

### Browser startet nicht
```bash
npx playwright install --with-deps
```

### Tests hängen
→ Prüfe ob `npm run dev` läuft oder setze `webServer.reuseExistingServer: false`

### Auth-State veraltet
```bash
rm -rf .playwright/.auth
npx playwright test --project=setup
```

### Screenshot/Trace analysieren
```bash
npx playwright show-report
```
