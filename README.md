# 🚗 DealerOS

**Das Betriebssystem für Autohändler.** Bestand, Inserate, Kunden, Offerten, Rechnungen — alles in einem.

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://dealeros.ch)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)

## 🌟 Features

### Fahrzeugverwaltung
- **Fahrzeug-Erfassung** — Fotos, Daten, Zustandsdokumentation
- **Standzeit-Tracking** — Automatische Überwachung der Standzeit
- **CSV/Excel Import** — Bulk-Import aus bestehenden Systemen
- **Fahrzeug-Export** — Inserate für verschiedene Plattformen generieren
- **Website Widget** — Fahrzeuge auf externen Websites einbetten mit anpassbarem Design

### 🤖 Photo AI (NEU)
- **Hintergrund entfernen** — KI-basierte Freistellung mit Replicate API
- **Virtueller Showroom** — Professionelle Hintergründe automatisch einfügen
- **Bildverbesserung** — Auto-Optimierung von Helligkeit, Kontrast und Schärfe
- **Kennzeichen verpixeln** — Automatische Erkennung und Blur (geplant)
- **Upscaling** — Bildqualität mit Real-ESRGAN verbessern

### CRM & Kommunikation
- **Kunden-Verwaltung** — Vollständiges CRM mit Kontakthistorie
- **Lead-Management** — Anfragen zentral verwalten
- **WhatsApp-Integration** — Direkte Kommunikation mit Kunden
- **E-Mail Benachrichtigungen** — Automatische Alerts (neue Leads, Standzeit, etc.)
- **E-Mail-Vorlagen** — Anpassbare Templates für Bestätigungen, Erinnerungen & mehr

### Offerten & Rechnungen
- **Offerten-Modul** — Professionelle Offerten erstellen und verwalten
- **Rechnungs-Modul** — Rechnungen mit Zahlungs-Tracking
- **PDF-Export** — Druckfertige PDFs für Offerten und Rechnungen
- **Bexio-Integration** — Synchronisation mit Schweizer Buchhaltungs-Software

### 👥 Multi-User & Teams
- **Team-Verwaltung** — Mehrere Benutzer pro Dealer-Account
- **Rollen-System** — Owner, Admin, Mitarbeiter mit unterschiedlichen Berechtigungen
- **Team-Einladungen** — Neue Mitarbeiter per E-Mail einladen
- **Aktivitäts-Tracking** — Letzte Aktivität pro Team-Mitglied

### 👑 Admin Dashboard (Platform-Admin)
- **Dealer-Übersicht** — Alle Dealers mit Plan, Status, Team-Grösse
- **Impersonate-Funktion** — Als Dealer einloggen für Support-Zwecke
- **Dealer hinzufügen** — Manuelle Dealer-Erstellung durch Admin
- **CSV-Export** — Dealer-Daten exportieren
- **Plan-Statistiken** — Verteilung nach Subscription-Plan

### Analytics & Reporting
- **Dashboard** — KPIs auf einen Blick (Bestand, Umsatz, Standzeit)
- **Verkaufs-Statistiken** — Trends und Performance-Analyse
- **Standzeit-Analyse** — Identifiziere Ladenhüter
- **Multi-Standort** — Verwaltung mehrerer Filialen mit separaten Statistiken

### Onboarding & Hilfe
- **Interaktiver Onboarding-Wizard** — Schritt-für-Schritt Einrichtung mit Fortschritts-Speicherung
- **Hilfe-Center** — Umfassende Dokumentation und FAQ direkt in der App

### 📱 Mobile Experience
- **Vollständig responsive** — Optimiert für alle Bildschirmgrössen
- **Mobile Dashboard** — Touch-optimierte Navigation und Bedienung
- **Adaptive Headers** — Automatische Anpassung an Bildschirmbreite

### 🚗 Probefahrt-Widget (Embed)
- **Embeddable Widget** — Probefahrt-Buchung auf externen Websites
- **Mehrsprachig** — DE/EN/FR/IT Support
- **Anpassbar** — Farben, Dark Mode, Fahrzeug-Vorauswahl via Query-Parameter
- **E-Mail Benachrichtigungen** — Automatische Bestätigung an Kunden und Händler

### 📝 Blog & Content Marketing
- **SEO-optimierter Blog** — Artikel zu Branchenthemen für organischen Traffic
- **Content-Kategorien** — Verkaufstipps, Marktplatz-Guides, Branchentrends
- **Mehrsprachig** — Artikel in DE (weitere Sprachen geplant)

### 🎯 Beta-Tester Programm
- **Landing Page mit Countdown** — Ansprechendes Design für Early Adopters
- **Feature-Highlights** — Übersicht aller Kernfunktionen
- **Call-to-Action** — Direkte Registrierung für Beta-Tester

### 🔧 Operations & Maintenance
- **Sentry Error Monitoring** — Automatische Fehlererfassung in Production
- **Coming Soon Mode** — Passwortgeschützte Wartungsseite für Launches

### Mehrsprachigkeit
- 🇩🇪 Deutsch (Standard)
- 🇬🇧 English
- Sprachauswahl in Benutzer-Einstellungen

## 💰 Pricing

| Plan | Preis | Fahrzeuge | Benutzer | Features |
|------|-------|-----------|----------|----------|
| **Starter** | **GRATIS** | 10 | 1 | Basis-CRM, Standzeit-Tracking |
| **Pro** | 129 CHF/Mt | Unbegrenzt | 1 | + WhatsApp, AI-Pricing, alle Kanäle |
| **Business** | 229 CHF/Mt | Unbegrenzt | 3 | + Bexio, Multi-Standort, Teams, API |

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) + TypeScript 5
- **UI:** [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Backend:** [Supabase](https://supabase.com) (Auth, Database, Storage)
- **Payments:** [Stripe](https://stripe.com) (Subscriptions)
- **Email:** [Resend](https://resend.com)
- **Charts:** [Recharts](https://recharts.org)
- **i18n:** [next-intl](https://next-intl-docs.vercel.app)
- **Testing:** [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev)
- **Video:** [Remotion](https://remotion.dev)
- **AI/ML:** [Replicate](https://replicate.com) (Image Processing)
- **Monitoring:** [Sentry](https://sentry.io) (Error Tracking)
- **Hosting:** [Vercel](https://vercel.com)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm/pnpm
- Supabase Account
- Stripe Account (für Billing)

### Installation

```bash
# Repository klonen
git clone https://github.com/your-org/dealer-os.git
cd dealer-os

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local
# → Fülle die Werte in .env.local aus

# Supabase Migrationen ausführen
# → Siehe supabase/migrations/

# Development Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

### Environment Variables

Siehe `.env.example` für alle benötigten Variablen:

```env
# Essentiell
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# E-Mail
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Stripe (für Billing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Optional: Bexio Integration
BEXIO_CLIENT_ID=
BEXIO_CLIENT_SECRET=
BEXIO_REDIRECT_URI=

# Optional: Photo AI (Replicate)
REPLICATE_API_TOKEN=

# Optional: Coming Soon Mode
COMING_SOON_ENABLED=false
COMING_SOON_PASSWORD=
```

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/           # i18n Routing
│   │   ├── admin/          # Platform Admin Dashboard
│   │   ├── dashboard/      # Main App
│   │   │   ├── analytics/  # Analytics Dashboard
│   │   │   ├── customers/  # CRM
│   │   │   ├── invoices/   # Rechnungen
│   │   │   ├── leads/      # Lead Management
│   │   │   ├── quotes/     # Offerten
│   │   │   ├── settings/   # Einstellungen (Billing, Bexio, Team)
│   │   │   ├── vehicles/   # Fahrzeugverwaltung
│   │   │   └── whatsapp/   # WhatsApp Integration
│   │   └── (public)/       # Landing, Blog, etc.
│   ├── api/                # API Routes
│   │   ├── admin/          # Admin APIs (impersonate, dealers)
│   │   ├── bexio/          # Bexio OAuth & Sync
│   │   ├── notifications/  # Email Notifications
│   │   ├── stripe/         # Billing Webhooks
│   │   └── webhooks/       # External Webhooks
│   └── auth/               # Auth Callback
├── components/
│   ├── layout/             # Header, Footer, Sidebar
│   └── ui/                 # shadcn/ui Components
├── hooks/                  # React Hooks
├── lib/                    # Utilities
│   ├── bexio/              # Bexio Client
│   ├── stripe/             # Stripe Config
│   └── supabase/           # Supabase Client
├── messages/               # i18n Translations
└── types/                  # TypeScript Types
```

## 🧪 Testing

```bash
# Unit Tests
npm run test:unit

# E2E Tests
npm run test:e2e

# E2E mit UI
npm run test:e2e:ui
```

## 📚 Documentation

Weitere Dokumentation in `docs/`:

- [Bexio Integration](docs/BEXIO_INTEGRATION.md)
- [Stripe Setup](docs/STRIPE_SETUP.md)
- [Storage Setup](docs/STORAGE_SETUP.md)
- [Testing Guide](docs/TESTING.md)
- [Test Procedures](docs/TEST-PROCEDURES.md)
- [Vehicle Import](docs/VEHICLE_IMPORT.md)
- [Dashboard Widgets](docs/dashboard-widgets.md)
- [Photo AI](docs/features/PHOTO-AI.md)
- [Test Drive Widget](docs/TEST-DRIVE-WIDGET.md)

## 🚢 Deployment

DealerOS wird automatisch auf Vercel deployed:

```bash
# Production Build lokal testen
npm run build
npm start

# Manuelles Deployment
vercel --prod
```

## 📝 Scripts

```bash
npm run dev          # Development Server
npm run build        # Production Build
npm run start        # Production Server
npm run lint         # ESLint
npm run test         # Alle Tests
npm run pre-deploy   # Pre-Deployment Checks
npm run video:studio # Remotion Studio (Explainer Videos)
```

## 🤝 Contributing

1. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
2. Changes committen (`git commit -m 'feat: Add amazing feature'`)
3. Branch pushen (`git push origin feature/amazing-feature`)
4. Pull Request erstellen

## 📄 License

Proprietary — © 2025 DealerOS

---

Built with ❤️ in Switzerland 🇨🇭
