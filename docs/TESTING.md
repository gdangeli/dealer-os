# Testing Documentation - Dealer OS

## Übersicht

Dealer OS verwendet zwei Testing-Frameworks:
- **Playwright** für End-to-End (E2E) Tests
- **Vitest** für Unit Tests

## Quick Start

```bash
# Alle Tests ausführen
npm test

# Nur Unit Tests
npm run test:unit

# Nur E2E Tests
npm run test:e2e

# E2E Tests mit Browser UI (debugging)
npm run test:e2e:headed

# E2E Tests mit Playwright UI (interaktiv)
npm run test:e2e:ui

# Pre-Deploy QA (alle Checks)
npm run pre-deploy
```

## Test-Struktur

```
dealer-os/
├── e2e/                          # Playwright E2E Tests
│   ├── landing-page.spec.ts      # Landing Page Tests
│   ├── auth.spec.ts              # Authentication Tests
│   ├── dashboard.spec.ts         # Dashboard Tests
│   ├── vehicles.spec.ts          # Fahrzeuge CRUD Tests
│   ├── leads.spec.ts             # Leads CRUD Tests
│   ├── settings.spec.ts          # Settings Tests
│   ├── onboarding.spec.ts        # Onboarding Wizard Tests
│   ├── image-upload.spec.ts      # Image Upload Tests
│   └── csv-export.spec.ts        # CSV/Export Tests
├── tests/                        # Vitest Unit Tests
│   ├── setup.ts                  # Test Setup & Mocks
│   └── utils.test.ts             # Utility Functions Tests
├── scripts/
│   └── pre-deploy.sh             # Pre-Deploy QA Script
├── playwright.config.ts          # Playwright Konfiguration
└── vitest.config.ts              # Vitest Konfiguration
```

## E2E Tests (Playwright)

### Konfiguration

Die Tests laufen standardmässig gegen `https://www.dealeros.ch`. 
Für lokale Tests:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

### Authentifizierte Tests

Viele Tests benötigen einen eingeloggten User. Setze diese Umgebungsvariablen:

```bash
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="testpassword"
npm run test:e2e
```

Ohne diese Variablen werden die authentifizierten Tests übersprungen.

### Test-Kategorien

| Test File | Was wird getestet |
|-----------|-------------------|
| `landing-page.spec.ts` | Hero, Navigation, Footer, Legal Links |
| `auth.spec.ts` | Login, Register, Protected Routes |
| `dashboard.spec.ts` | Dashboard UI, Sidebar, Analytics |
| `vehicles.spec.ts` | Fahrzeuge Liste, CRUD, Form Validation |
| `leads.spec.ts` | Leads Liste, CRUD, Status Management |
| `settings.spec.ts` | Einstellungen speichern |
| `onboarding.spec.ts` | Wizard Flow, Steps |
| `image-upload.spec.ts` | Dropzone, File Input |
| `csv-export.spec.ts` | Export Buttons, AutoScout24 API |

### Reports

Nach jedem Test-Run:
```bash
npx playwright show-report
```

## Unit Tests (Vitest)

### Ausführen

```bash
# Watch Mode (Entwicklung)
npm run test:unit

# Single Run
npm run test:unit -- --run

# Mit Coverage
npm run test:unit -- --coverage
```

### Was wird getestet

- Utility Functions (Formatierung, Validierung)
- Business Logic (Berechnungen, Filter)
- Data Transformations

## Pre-Deploy Script

Das Script `scripts/pre-deploy.sh` führt alle Checks durch:

1. **TypeScript Type Check** - Keine Type Errors
2. **ESLint** - Code Quality
3. **Unit Tests** - Vitest
4. **E2E Tests** - Playwright
5. **Build Check** - Next.js Build

### Nutzung

```bash
# Direkt ausführen
npm run pre-deploy

# Oder als Git Hook
# In .git/hooks/pre-push:
#!/bin/bash
npm run pre-deploy
```

### CI/CD Integration

```yaml
# GitHub Actions Beispiel
- name: Run Pre-Deploy Tests
  run: npm run pre-deploy
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

## Troubleshooting

### Playwright Browser nicht installiert
```bash
npx playwright install chromium
```

### Tests schlagen bei Authentication fehl
- Prüfe ob `TEST_USER_EMAIL` und `TEST_USER_PASSWORD` gesetzt sind
- Prüfe ob der Test-User existiert und das Passwort korrekt ist

### Timeouts
Erhöhe Timeouts in `playwright.config.ts`:
```typescript
use: {
  timeout: 30000,
  actionTimeout: 10000,
}
```

## Neue Tests hinzufügen

### E2E Test
```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Unit Test
```typescript
// tests/my-function.test.ts
import { describe, it, expect } from 'vitest';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction()).toBe('expected');
  });
});
```
