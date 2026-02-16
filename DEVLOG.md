# DealerOS Development Log

## 2025-02-16: Stripe Integration für Billing & Subscriptions

### Überblick
Vollständige Stripe-Integration für die Monetarisierung nach der Beta-Phase implementiert. Umfasst Checkout, Customer Portal, Webhooks und Feature-Gating.

### Neue Features

#### 1. Stripe Checkout Integration
- Hosted Checkout für sichere Zahlungsabwicklung
- 14-tägige kostenlose Testphase für alle Pläne
- Monatliche und jährliche Abrechnungsoptionen (17% Rabatt bei jährlich)
- Automatische Steuernummern-Erfassung (MwSt.)

#### 2. Subscription-Pläne
| Plan | Preis/Monat | Fahrzeuge | Benutzer | Kanäle |
|------|-------------|-----------|----------|--------|
| Beta (aktuell) | Gratis | 50 | 2 | 2 |
| Starter | CHF 149 | 20 | 2 | 2 |
| Professional | CHF 349 | 50 | 5 | 5 |
| Business | CHF 599 | 100 | 10 | Unbegrenzt |
| Enterprise | Auf Anfrage | 100+ | Unbegrenzt | Unbegrenzt |

#### 3. Customer Portal
- Self-Service für Abo-Verwaltung
- Zahlungsmethoden aktualisieren
- Rechnungen einsehen und herunterladen
- Plan wechseln oder kündigen

#### 4. Webhook-Handler
- `customer.subscription.created/updated` - Plan-Updates
- `customer.subscription.deleted` - Downgrade auf Beta
- `invoice.paid` - Erfolgreiche Zahlung
- `invoice.payment_failed` - Zahlungswarnung

#### 5. Billing-Dashboard
- Aktueller Plan mit Limits anzeigen
- Upgrade-Optionen mit Preisvergleich
- Testphasen-Status und Ablaufdatum
- Zahlungsstatus-Warnungen

#### 6. Feature-Gating Hook
- `useSubscription()` Hook für Client-Komponenten
- `canAddVehicle()`, `canAddUser()`, `canAddChannel()` Limit-Checks
- `UpgradePrompt` und `LimitReached` UI-Komponenten

### Technische Details

**Neue Dateien:**
- `src/lib/stripe/config.ts` - Stripe-Instanz, Plan-Konfiguration, Limits
- `src/lib/stripe/client.ts` - Client-side Stripe.js (optional)
- `src/app/api/stripe/create-checkout-session/route.ts` - Checkout erstellen
- `src/app/api/stripe/create-portal-session/route.ts` - Portal-Session
- `src/app/api/stripe/webhooks/route.ts` - Webhook-Handler
- `src/app/[locale]/dashboard/settings/billing/page.tsx` - Billing-Seite
- `src/app/[locale]/dashboard/settings/billing/billing-client.tsx` - Billing UI
- `src/hooks/use-subscription.ts` - Subscription-Hook für Feature-Gating
- `src/components/subscription/upgrade-prompt.tsx` - Upgrade-UI-Komponenten
- `src/components/ui/alert.tsx` - Alert-Komponente
- `supabase/migrations/004_add_stripe_fields.sql` - DB-Migration

**Geänderte Dateien:**
- `src/types/database.ts` - Stripe-Felder zu Dealer hinzugefügt
- `src/app/[locale]/dashboard/settings/settings-client.tsx` - Billing-Tab Update
- `.env.example` - Stripe Environment Variables

**Neue Dependencies:**
- `stripe` - Server-side Stripe SDK
- `@stripe/stripe-js` - Client-side Stripe.js

### Database Migration

```sql
ALTER TABLE dealers
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;
```

### Environment Variables

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_STARTER_YEARLY_PRICE_ID=price_xxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_xxxxx
```

### Stripe Dashboard Setup (TODO)

Folgende Schritte müssen im Stripe Dashboard erledigt werden:

1. **Products erstellen:**
   - Starter (CHF 149/Mt., CHF 1490/Jahr)
   - Professional (CHF 349/Mt., CHF 3490/Jahr)
   - Business (CHF 599/Mt., CHF 5990/Jahr)

2. **Price IDs kopieren** und in `.env.local` eintragen

3. **Webhook einrichten:**
   - URL: `https://dealer-os.ch/api/stripe/webhooks`
   - Events: `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`
   - Signing Secret in `.env.local` eintragen

4. **Customer Portal konfigurieren:**
   - Settings > Customer Portal
   - Funktionen aktivieren: Invoices, Payment methods, Cancel subscription

5. **Test Mode** für Entwicklung nutzen, später zu Live wechseln

### Offene Punkte
- [ ] Stripe Products im Dashboard erstellen
- [ ] Webhook-Endpoint in Stripe registrieren
- [ ] Customer Portal konfigurieren
- [ ] Email-Benachrichtigungen bei Zahlungsproblemen
- [ ] Metered Billing für Enterprise-Kunden (optional)
- [ ] Prorations für Mid-Cycle Upgrades

---

## 2025-02-16: Bildoptimierung & Performance-Verbesserungen

### Überblick
Implementierung automatischer Bildkompression und Next.js Image Optimization für schnellere Ladezeiten und reduzierte Storage-Kosten.

### Neue Features

#### 1. Automatische Bildkompression beim Upload
- Client-side Kompression mit `browser-image-compression`
- Automatische WebP-Konvertierung für kleinere Dateigrössen
- Max. Bildgrösse: 2400x1800px, Ziel: 2MB pro Bild
- Kompression-Feedback im UI zeigt Einsparungen

#### 2. Next.js Image Optimization
- Alle `<img>` Tags durch `next/image` ersetzt
- Automatisches Lazy Loading für Bilder ausserhalb des Viewports
- Blur-Placeholder für bessere UX während des Ladens
- Responsive `sizes` für optimale Bildgrössen je Viewport

#### 3. Erweiterte Next.js Konfiguration
- AVIF und WebP Format-Unterstützung
- Optimierte Device-Sizes: 640, 750, 828, 1080, 1200, 1920, 2048px
- 1 Jahr Cache-TTL für Bilder

### Technische Details

**Neue Dateien:**
- `src/lib/image-utils.ts` - Kompression, Dimensionen, Blur-Placeholder
- `src/components/ui/optimized-image.tsx` - Wiederverwendbare Bild-Komponenten

**Geänderte Dateien:**
- `src/components/vehicles/image-upload.tsx` - Kompression + OptimizedImage
- `src/components/vehicles/vehicle-list-client.tsx` - next/image für Thumbnails
- `next.config.ts` - Erweiterte Bild-Konfiguration
- `src/lib/email/index.ts` - Lazy Resend-Initialisierung (Build-Fix)
- `src/app/api/notifications/*/route.ts` - Lazy Supabase-Init (Build-Fix)

**Neue Dependencies:**
- `browser-image-compression` - Client-side Bildkompression

### Performance-Erwartungen
- **Upload-Grösse:** ~50-70% kleiner durch WebP-Kompression
- **Ladezeit:** Schneller durch Lazy Loading + optimierte Formate
- **Storage-Kosten:** Reduziert durch kleinere Dateien
- **LCP:** Verbessert durch Priority-Bilder und Blur-Placeholder

### Komponenten-Übersicht

```tsx
// Thumbnail für Listen (48x36px)
<VehicleThumbnail src={url} alt={name} />

// Card-Bild für Grids (responsive)
<VehicleCardImage src={url} alt={name} priority={isFirstRow} />

// Gallery-Bild für Detail-Ansicht
<VehicleGalleryImage src={url} alt={name} onClick={openLightbox} />

// Generisch mit allen Optionen
<OptimizedImage src={url} alt={name} fill sizes="..." />
```

---

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
