# E2E Tests - Quick Start

## 🚀 Schnellstart

```bash
# 1. Dependencies installieren
npm install

# 2. Playwright Browser installieren
npx playwright install

# 3. Tests ausführen
npm run test:e2e

# Oder mit UI:
npm run test:e2e:ui
```

---

## 📁 Verzeichnisstruktur

```
e2e/
├── auth.setup.ts           # Auth-Session Setup (läuft zuerst)
├── auth.spec.ts            # Login/Register Tests
├── landing.spec.ts         # Landing Page Tests
├── dashboard.spec.ts       # Dashboard Access Tests
├── dashboard-widgets.spec.ts # Widget-Konfiguration
├── vehicles.spec.ts        # Fahrzeug CRUD
├── vehicle-import.spec.ts  # CSV/Excel Import
├── leads.spec.ts           # Lead CRUD
├── lead-timeline.spec.ts   # Lead-Aktivitäten
├── csv-export.spec.ts      # Export-Funktionen
├── image-upload.spec.ts    # Bild-Upload
├── settings.spec.ts        # Einstellungen
├── onboarding.spec.ts      # Onboarding Wizard
├── stripe-subscription.spec.ts # Stripe Checkout
└── README.md               # Diese Datei
```

---

## 🔑 Umgebungsvariablen

```bash
# .env.local
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=sicheres-passwort
```

> Ohne diese Variablen werden authentifizierte Tests übersprungen.

---

## ✍️ Neue Tests schreiben

### 1. Datei erstellen

```typescript
// e2e/mein-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mein Feature', () => {
  test('sollte etwas tun', async ({ page }) => {
    await page.goto('/de/mein-feature');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### 2. Mit Authentifizierung

```typescript
// e2e/mein-auth-feature.spec.ts
import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// Login-Helper (für manuelle Auth)
async function login(page: Page): Promise<boolean> {
  if (!TEST_EMAIL || !TEST_PASSWORD) return false;
  
  await page.goto('/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  return true;
}

test.describe('Auth Feature', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
  });

  test('sollte nur für eingeloggte User', async ({ page }) => {
    await page.goto('/dashboard/mein-feature');
    await expect(page.locator('main')).toBeVisible();
  });
});
```

### 3. Mit Pre-Auth State (bevorzugt)

Tests im `authenticated` Project nutzen automatisch den gespeicherten Auth-State:

```typescript
// e2e/mein-auth-feature.spec.ts
import { test, expect } from '@playwright/test';

// Dieser Test läuft im "authenticated" Project
// und hat bereits den Auth-State aus auth.setup.ts
test.describe('Auth Feature (mit State)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/de/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('User ist bereits eingeloggt', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});
```

---

## 📋 Test-Konventionen

### Dateinamen
- `*.spec.ts` für Test-Dateien
- Feature-basiert: `vehicles.spec.ts`, `leads.spec.ts`
- Zusammengehörige Tests gruppieren

### Locators (Priorität)

```typescript
// 1. Role + Name (bevorzugt - barrierefrei)
page.getByRole('button', { name: /speichern/i })
page.getByRole('link', { name: /fahrzeuge/i })
page.getByRole('heading', { name: 'Dashboard' })

// 2. Label/Placeholder
page.getByLabel('E-Mail')
page.getByPlaceholder('Suchen...')

// 3. Text
page.getByText('Erfolgreich gespeichert')

// 4. Test-ID (für komplexe Komponenten)
page.locator('[data-testid="lead-timeline"]')

// 5. ID (wenn nötig)
page.locator('#email')

// ❌ Vermeiden: CSS-Klassen
page.locator('.btn-primary')  // Fragil!
```

### Assertions

```typescript
// Sichtbarkeit
await expect(element).toBeVisible();
await expect(element).not.toBeVisible();

// URL
await expect(page).toHaveURL(/\/dashboard/);

// Text
await expect(element).toContainText('Willkommen');
await expect(element).toHaveText('Exakter Text');

// Attribute
await expect(input).toHaveAttribute('required', '');
await expect(input).toHaveValue('test@example.com');

// Count
await expect(list.locator('li')).toHaveCount(5);
```

### Warten

```typescript
// ✅ Gut: Explizit auf Element warten
await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

// ✅ Gut: Auf Netzwerk warten
await page.waitForLoadState('networkidle');

// ⚠️ Nur wenn nötig: Feste Zeit
await page.waitForTimeout(1000);
```

---

## 💡 Best Practices

### 1. Tests unabhängig halten

```typescript
// ✅ Gut: Jeder Test kann alleine laufen
test.beforeEach(async ({ page }) => {
  await page.goto('/de/dashboard');
});

// ❌ Schlecht: Tests hängen voneinander ab
let createdId: string;
test('create', () => { createdId = ... });
test('update', () => { /* uses createdId */ });
```

### 2. Locale-Prefix beachten

```typescript
// ✅ Gut: Explizites Locale
await page.goto('/de/login');

// ❌ Schlecht: Kann zu Redirects führen
await page.goto('/login');
```

### 3. Flexible Selektoren

```typescript
// ✅ Gut: Regex für mehrere Sprachen/Varianten
page.getByRole('button', { name: /speichern|save/i })
page.getByText(/dashboard|übersicht/i)

// ❌ Schlecht: Exakter Text
page.getByText('Speichern')  // Bricht bei Änderungen
```

### 4. Onboarding beachten

```typescript
// User kann nach Login zum Onboarding redirected werden
await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });

if (page.url().includes('onboarding')) {
  await page.goto('/dashboard/vehicles');  // Überspringen
}
```

### 5. Graceful Degradation

```typescript
// Feature optional testen
const button = page.getByRole('button', { name: /export/i });
const isVisible = await button.isVisible().catch(() => false);

if (isVisible) {
  await button.click();
  // Test Export...
} else {
  // Feature nicht vorhanden, überspringen
  await expect(page.locator('main')).toBeVisible();
}
```

### 6. Cleanup nach Tests

```typescript
test.afterAll(async () => {
  // Test-Daten löschen
  if (testDealerId) {
    await supabase
      .from('vehicles')
      .delete()
      .eq('dealer_id', testDealerId)
      .like('vin', 'TEST%');
  }
});
```

---

## 🐛 Debugging

### Mit UI debuggen

```bash
npx playwright test --ui
```

### Einzelnen Test ausführen

```bash
npx playwright test leads.spec.ts
npx playwright test -g "sollte Lead erstellen"
```

### Headed Mode (Browser sichtbar)

```bash
npx playwright test --headed
```

### Slow Motion

```bash
npx playwright test --headed --slow-mo=500
```

### Trace aufnehmen

```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Screenshot bei Fehler

Screenshots werden automatisch bei Fehlern gespeichert:
```
test-results/
└── mein-test-chromium/
    └── test-failed-1.png
```

---

## 📊 Reports

```bash
# HTML Report generieren
npx playwright test

# Report öffnen
npx playwright show-report
```

---

## 🔗 Weiterführende Links

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Locator Guide](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Ausführliche Test-Doku](../docs/TESTING.md)
