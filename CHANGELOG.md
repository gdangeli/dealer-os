# Changelog

Alle wichtigen Änderungen an DealerOS werden hier dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [Unreleased]

### Added
- **Bexio-Integration** — OAuth-Verbindung, Kunden- und Rechnungs-Synchronisation
- **Erweitertes Analytics Dashboard** — KPIs, Charts, Verkaufs-Statistiken
- **E-Mail Benachrichtigungen** — Offerten-Ablauf, überfällige Rechnungen

### Changed
- Analytics-Seite mit Recharts-Diagrammen erweitert

---

## [0.9.0] - 2025-02-18

### Added
- **Bexio-Integration** komplett implementiert
  - OAuth 2.0 Verbindung mit sicherer Token-Speicherung (AES-256-GCM)
  - Kunden-Synchronisation zu Bexio-Kontakten
  - Rechnungs-Synchronisation
  - Settings-Seite für Verbindungsmanagement
- **E-Mail Benachrichtigungen** für Offerten-Ablauf und überfällige Rechnungen
- **Erweitertes Analytics Dashboard** mit KPIs und Charts
- 4 neue SEO-optimierte Blog-Artikel

### Changed
- Pricing-Modell aktualisiert: **Starter GRATIS**, Pro 129 CHF, Business 229 CHF

---

## [0.8.0] - 2025-02-17

### Added
- **Offerten-Modul** — Vollständiges CRUD mit Status-Tracking
- **Rechnungs-Modul** — Zahlungs-Tracking, Fälligkeiten
- **PDF-Export** für Offerten und Rechnungen
- **Kunden-Modul** — CRM mit Kontakthistorie
- i18n Übersetzungen für alle neuen Module
- E2E Tests für Customers, Quotes, Invoices, WhatsApp, Analytics

### Fixed
- PDF API Routes für JSX Support umbenannt
- Buffer zu Uint8Array Konvertierung für NextResponse

---

## [0.7.0] - 2025-02-16

### Added
- **WhatsApp Business Integration** — Phase 1 & 2
  - Interaktiver Setup-Wizard
  - Nachrichten-Templates
  - WhatsApp Dashboard-Seite
- **CSV Export** für tutti.ch und vollständigen Daten-Export
- Language Switcher im Dashboard Sidebar
- Hilfe- und Kontakt-Seiten

### Changed
- Locale Detection deaktiviert — Deutsch als Standard

### Fixed
- Footer-Links für Hilfe und Kontakt
- Select.Item empty value Bug (Radix UI)

---

## [0.6.0] - 2025-02-15

### Added
- **Landing Page Redesign** — Modern Minimalist (Sky Blue/Indigo)
- Unique Unsplash-Bilder für alle Blog-Posts
- Lead Timeline UI-Komponente
- Erweiterte E2E-Tests für kritische User Flows
- Enhanced Vehicle Image Gallery mit Lightbox

### Changed
- Blog-Emojis durch professionelle Gradient-Backgrounds ersetzt
- Feature-Cards mit besserer Bildanzeige

### Fixed
- Google Ads Artikel-Bild korrigiert

---

## [0.5.0] - 2025-02-14

### Added
- **Stripe Billing Integration**
  - Checkout Sessions
  - Customer Portal
  - Webhook Handling
  - Subscription Management
- **Subscription Plans**: Starter, Professional, Business, Beta

### Changed
- Billing-Seite in Dashboard Settings

---

## [0.4.0] - 2025-02-13

### Added
- **Vehicle Import** — CSV/Excel Import für Fahrzeuge
- Dashboard Widgets mit KPI-Karten
- Standzeit-Tracking Basis

---

## [0.3.0] - 2025-02-12

### Added
- **Lead Management** — Anfragen-Inbox
- E-Mail Notifications für neue Leads
- Daily Summary E-Mails
- Longstanding Vehicle Alerts

---

## [0.2.0] - 2025-02-10

### Added
- **Fahrzeugverwaltung** — CRUD, Fotos, Zustand
- **Supabase Storage** für Bilder
- Multi-Channel Export vorbereitet

---

## [0.1.0] - 2025-02-08

### Added
- Initiales Projekt-Setup
- Next.js 16 + TypeScript
- Supabase Auth Integration
- shadcn/ui Komponenten
- Basis Dashboard Layout
- i18n mit next-intl (DE/EN)

---

## Legende

- **Added** — Neue Features
- **Changed** — Änderungen an bestehenden Features
- **Deprecated** — Features die bald entfernt werden
- **Removed** — Entfernte Features
- **Fixed** — Bugfixes
- **Security** — Sicherheits-relevante Änderungen
