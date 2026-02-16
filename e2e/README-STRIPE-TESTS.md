# Stripe Subscription E2E Tests

## Übersicht

Die Stripe Subscription Tests (`stripe-subscription.spec.ts`) testen den kompletten Subscription Flow:

- ✅ Billing-Seite anzeigen
- ✅ Plan-Upgrades mit Stripe Checkout
- ✅ Erfolgreiche Zahlung mit Testkarte (4242 4242 4242 4242)
- ✅ Fehlgeschlagene Zahlung (4000 0000 0000 0002)
- ✅ Abgebrochener Checkout
- ✅ Subscription Management (Customer Portal)
- ✅ Stripe API Verifikation

## Voraussetzungen

### 1. Test-User erstellen

Erstelle einen Test-User in deiner Supabase Instanz:

```bash
# Via Supabase Dashboard oder SQL:
INSERT INTO auth.users (email, encrypted_password, ...)
VALUES ('test@dealeros.com', ...);
```

### 2. Environment Variables setzen

Füge zu `.env.local` hinzu:

```bash
# Test User Credentials
TEST_USER_EMAIL=test@dealeros.com
TEST_USER_PASSWORD=SecureTestPassword123!

# Stripe Test Keys (sollten schon gesetzt sein)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Price IDs (Test-Mode)
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
```

### 3. Stripe Account vorbereiten

- Stelle sicher, dass dein Stripe Account im **Test-Modus** ist
- Price IDs müssen in Stripe existieren
- Account: `acct_1T1NybBLgkVs6IPA`

## Tests ausführen

### Alle Stripe Tests

```bash
npx playwright test e2e/stripe-subscription.spec.ts
```

### Einzelne Test-Suites

```bash
# Nur Checkout-Success Tests
npx playwright test e2e/stripe-subscription.spec.ts -g "Checkout Flow - Success"

# Nur Fehler-Tests
npx playwright test e2e/stripe-subscription.spec.ts -g "Failure Cases"

# Nur Stripe API Verifikation
npx playwright test e2e/stripe-subscription.spec.ts -g "Stripe API Verification"
```

### Mit UI Mode (empfohlen für Debugging)

```bash
npx playwright test e2e/stripe-subscription.spec.ts --ui
```

### Einzelnen Test debuggen

```bash
npx playwright test e2e/stripe-subscription.spec.ts -g "should successfully complete checkout" --debug
```

## Stripe Testkarten

### Erfolgreiche Zahlung
- **4242 4242 4242 4242** - Zahlung erfolgreich
- Expiry: Beliebiges zukünftiges Datum (z.B. 12/34)
- CVC: Beliebige 3 Ziffern (z.B. 123)

### Fehlgeschlagene Zahlung
- **4000 0000 0000 0002** - Karte abgelehnt (generic decline)
- **4000 0000 0000 9995** - Unzureichende Deckung
- **4000 0000 0000 0069** - Abgelaufene Karte

Mehr Testkarten: https://stripe.com/docs/testing

## Test-Struktur

### 1. Basis-Tests (immer)
- Billing-Seite anzeigen
- Plan-Informationen anzeigen
- Monatlich/Jährlich Toggle

### 2. Checkout-Tests (nur wenn Beta-User)
- Erfolgreiche Zahlung
- Subscription Erstellung
- Fehlgeschlagene Karten
- Abgebrochener Checkout

### 3. Management-Tests (nur mit aktiver Subscription)
- Customer Portal öffnen
- Status anzeigen
- Trial-Informationen

### 4. API-Verifikation (nur mit STRIPE_SECRET_KEY)
- Subscription in Stripe prüfen
- Customer in Stripe prüfen

## Skipped Tests

Tests werden übersprungen wenn:
- ❌ Keine `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` gesetzt
- ❌ User hat bereits aktives Abo (Checkout-Tests)
- ❌ User hat kein Abo (Management-Tests)
- ❌ Keine `STRIPE_SECRET_KEY` (API-Verifikation)

Das ist **normal** und kein Fehler!

## Troubleshooting

### "All tests skipped"
→ Setze `TEST_USER_EMAIL` und `TEST_USER_PASSWORD` in `.env.local`

### "Stripe Checkout lädt nicht"
→ Prüfe `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` und Price IDs

### "Card declined" bei 4242-Karte
→ Stripe Account muss im Test-Modus sein

### "Subscription not found in Stripe"
→ Webhook muss korrekt konfiguriert sein (siehe unten)

## Stripe Webhooks (für Production)

Für lokale Tests mit Webhooks:

```bash
# Stripe CLI installieren
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Webhooks forwarden
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# In separatem Terminal: Webhook Secret speichern
# Kopiere den webhook secret (whsec_...) in .env.local als STRIPE_WEBHOOK_SECRET
```

## CI/CD Integration

Für GitHub Actions:

```yaml
- name: Run Stripe E2E Tests
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_PUBLISHABLE_KEY_TEST }}
  run: npx playwright test e2e/stripe-subscription.spec.ts
```

## Nächste Schritte

1. ✅ Tests geschrieben
2. ⏳ Test-User erstellen
3. ⏳ Environment Variables setzen
4. ⏳ Tests lokal ausführen
5. ⏳ CI/CD konfigurieren

## Support

Bei Fragen: Siehe DEVLOG.md oder kontaktiere das Dev-Team.
