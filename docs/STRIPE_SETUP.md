# 💳 Stripe Setup Guide für DealerOS

## Übersicht

Diese Anleitung führt dich durch die Einrichtung von Stripe für DealerOS.
Geschätzte Zeit: **15-20 Minuten**

---

## Schritt 1: Stripe Account

Falls noch nicht vorhanden:
1. Gehe zu [dashboard.stripe.com](https://dashboard.stripe.com)
2. Erstelle einen Account oder logge dich ein
3. Aktiviere zunächst den **Test Mode** (Schalter oben rechts)

---

## Schritt 2: Products & Preise erstellen

Gehe zu **Products** → **+ Add product**

### Plan 1: Starter
- **Name:** DealerOS Starter
- **Beschreibung:** Für kleine Garagen bis 20 Fahrzeuge
- **Preise hinzufügen:**
  - CHF 149.00 / Monat (recurring)
  - CHF 1'490.00 / Jahr (recurring) — *spart 2 Monate!*

### Plan 2: Professional
- **Name:** DealerOS Professional  
- **Beschreibung:** Für wachsende Betriebe bis 100 Fahrzeuge
- **Preise hinzufügen:**
  - CHF 349.00 / Monat (recurring)
  - CHF 3'490.00 / Jahr (recurring)

### Plan 3: Business
- **Name:** DealerOS Business
- **Beschreibung:** Für grosse Händler, unbegrenzte Fahrzeuge
- **Preise hinzufügen:**
  - CHF 599.00 / Monat (recurring)
  - CHF 5'990.00 / Jahr (recurring)

**Wichtig:** Nach dem Erstellen jedes Preises → **Price ID kopieren** (beginnt mit `price_`)

---

## Schritt 3: API Keys holen

1. Gehe zu **Developers** → **API keys**
2. Kopiere:
   - **Publishable key** (beginnt mit `pk_test_`)
   - **Secret key** (beginnt mit `sk_test_`) — *Reveal key* klicken

---

## Schritt 4: Webhook einrichten

1. Gehe zu **Developers** → **Webhooks**
2. Klicke **+ Add endpoint**
3. **Endpoint URL:** `https://app.dealeros.ch/api/stripe/webhooks`
4. **Events auswählen:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. **Add endpoint** klicken
6. **Signing secret** kopieren (beginnt mit `whsec_`)

---

## Schritt 5: Customer Portal aktivieren

1. Gehe zu **Settings** → **Billing** → **Customer portal**
2. Aktiviere:
   - ✅ Invoices herunterladen
   - ✅ Zahlungsmethode ändern
   - ✅ Abo kündigen
   - ✅ Abo pausieren (optional)
3. **Save changes**

---

## Schritt 6: Environment Variables in Vercel

1. Gehe zu [vercel.com](https://vercel.com) → **dealer-os** → **Settings** → **Environment Variables**
2. Füge hinzu:

| Variable | Wert |
|----------|------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_STARTER_MONTHLY_PRICE_ID` | `price_...` |
| `STRIPE_STARTER_YEARLY_PRICE_ID` | `price_...` |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | `price_...` |
| `STRIPE_PRO_YEARLY_PRICE_ID` | `price_...` |
| `STRIPE_BUSINESS_MONTHLY_PRICE_ID` | `price_...` |
| `STRIPE_BUSINESS_YEARLY_PRICE_ID` | `price_...` |

3. **Save** und **Redeploy** triggern

---

## Schritt 7: Supabase Migration

Führe im **Supabase SQL Editor** aus:

```sql
-- Stripe-Felder zur dealers Tabelle hinzufügen
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- Index für schnelle Lookups
CREATE INDEX IF NOT EXISTS idx_dealers_stripe_customer_id ON dealers(stripe_customer_id);
```

---

## Schritt 8: Testen

1. Öffne DealerOS → **Einstellungen** → **Abrechnung**
2. Klicke auf **Upgrade** bei einem Plan
3. Verwende Testkarte: `4242 4242 4242 4242`
   - Ablauf: beliebiges Datum in der Zukunft
   - CVC: beliebige 3 Ziffern
4. Nach erfolgreicher Zahlung sollte der Plan aktiv sein

---

## Go Live Checklist

Wenn alles im Test Mode funktioniert:

- [ ] Stripe Account verifizieren (Bankkonto, Identität)
- [ ] Live API Keys holen und in Vercel ersetzen
- [ ] Neuen Live Webhook erstellen mit Live Signing Secret
- [ ] Test-Subscriptions löschen (optional)
- [ ] Ersten echten Kunden onboarden 🎉

---

## Support

Bei Fragen: [Stripe Docs](https://stripe.com/docs) oder frag Laura! 🌙
