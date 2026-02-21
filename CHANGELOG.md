# Changelog

Alle wichtigen Änderungen an DealerOS werden hier dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [Unreleased]

_Nächste geplante Features_

---

## [0.13.0] - 2026-02-21

### Added
- **🤖 Photo AI / Image Optimizer** — KI-gestützte Bildbearbeitung für Fahrzeugfotos
  - Hintergrund entfernen mit Replicate API (rembg) (da2eab0)
  - Virtueller Showroom: Professionelle Hintergründe einfügen (Modern, Classic, Outdoor, Minimal)
  - Bildverbesserung/Upscaling mit Real-ESRGAN (17c92d4)
  - Kennzeichen-Blur vorbereitet (geplant)
  - AI Optimizer Button in Fahrzeug-Bearbeitung (f288bee)
- E2E Tests für Photo AI / Image Optimizer (b5469f7)

### Fixed
- Error Handling für `getCurrentDealer` in Vehicle Edit Page (589f73a)
- Impersonation Support für Vehicle Edit Page (2a0b95d)
- Empty/invalid image src crash prevention (4254be8)
- Missing radio-group component hinzugefügt (443458c)
- Admin Dashboard Link während Impersonation ausgeblendet (9c9372f)
- Admin client für Embed Page (RLS bypass) (059d905)
- Absolute URL für Widget Preview + Debug Mode (f110bef)

---

## [0.12.0] - 2026-02-21

### Added
- **Website Widget** — Fahrzeuge auf externen Websites einbetten (6c21324)
  - Anpassbares Widget-Design (Farben, Layout, Filter)
  - Live-Vorschau vor dem Speichern (9b59357)
  - Embed-Code Generator für einfache Integration
  - /embed Routes von i18n Middleware ausgeschlossen (66e1f8b)
- **UX Polish & Performance** — Verbesserte Benutzererfahrung (29af4fc)
  - Optimierte Ladezeiten
  - Besseres Error Handling
  - Verbesserte Mobile Experience
- Umfassende Dokumentation hinzugefügt:
  - ROADMAP.md mit allen geplanten Features (87118bb, 2ae668d)
  - AI Pricing Research & Konzept (64a8ea2)
  - M&A Due Diligence Dokumentation (2be7210, 60bf539)

### Changed
- **Language Switcher** verschoben von Sidebar zu Settings > User (14fbbae)
- Beta Badge entfernt (ea97857)

### Fixed
- **Mobile Responsive Fixes** — Komplette Überarbeitung für alle Bildschirmgrössen
  - Fahrzeug- und Lead-Listen mobile-optimiert (c71bc94)
  - Responsive Headers auf allen Dashboard-Seiten (65e2fad)
  - Dashboard Header mobile-optimiert (0e5ade6)
  - Umfassende Mobile-Verbesserungen (ce02235)

---

## [0.11.0] - 2026-02-20

### Added
- **Admin Dashboard** — Platform-Admin Übersicht für alle Dealers
  - Dealer-Tabelle mit Plan, Status, Team-Grösse, Fahrzeuge (04ab450)
  - **Impersonate-Funktion** — Als Dealer einloggen für Support (0ccd4cb)
  - **Dealer hinzufügen** — Manuelle Erstellung neuer Dealers (71a1aa0)
  - **CSV-Export** — Dealer-Daten exportieren (71a1aa0)
  - Plan-Statistiken und Verteilung
- **Multi-User/Teams** — Mehrere Benutzer pro Dealer-Account
  - Team-Verwaltung UI in Settings (3994bbd)
  - Rollen-System (Owner, Admin, Mitarbeiter) (aa0b2f1)
  - Team-Member Einladungen
  - Dealer-Resolution über team_members (906e42b)
  - API Routes für Multi-User aktualisiert (7e5e0f4)
- Neuer Blog-Artikel: Kundenbindung für Garagisten (69bbb4b)
- Docs-Link im Admin Dashboard

### Fixed
- Impersonate überspringt Onboarding-Redirect, öffnet in neuem Tab (7e6c8c4, 9c8d7e6)
- Admin Client für Team-Member User Details (3b75e0c)
- Supabase Joins Type Errors — separate Queries (76c8ee9)
- Enterprise Plan null prices in Billing UI (329c9b7)
- robots.txt 500 Error behoben (3d7df58)
- www Subdomain in Sitemap URLs für Search Console (3bc08f4)
- i18n Terminologie-Konsistenz (c649d01)

---

## [0.10.0] - 2026-02-19

### Added
- **Hilfe-Center** — Umfassende In-App-Dokumentation mit FAQ und Guides (aad773c)
- **E-Mail-Vorlagen Modul** — Anpassbare Templates für Bestätigungen, Erinnerungen, Benachrichtigungen (b35a358, 0172952)
- **Onboarding Fortschritts-Speicherung** — Wizard-Stand wird gespeichert und kann fortgesetzt werden (3e13556)
- **Multi-Standort Support** — Verwaltung mehrerer Filialen mit separaten Statistiken (6ebc623)
- **Zentrales Benachrichtigungssystem** — Vereinheitlichte E-Mail-Kommunikation
- 1 neuer Blog-Artikel: Google Bewertungen für Autohändler (3584cf5)
- E2E Tests für email-templates und help Module (f114649)
- Umfassende manuelle Test-Dokumentation (29b5d3f)

### Changed
- Landing Page mit neuen Features aktualisiert
- Branchenspezifische Terminologie in i18n verbessert (b4a4538)

### Fixed
- Template Literal Syntax in Blog-Artikel (947ff4f)
- Übersetzungsfehler FR/IT korrigiert (6ebc62f)
- E2E Auth Test Timeout erhöht (1f835ba)
- Time-range Utils in shared lib verschoben (9f12682)
- Recharts Tooltip Typisierung (17a80fe, 8cf33f3)

---

## [0.9.0] - 2026-02-18

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

## [0.8.0] - 2026-02-17

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

## [0.7.0] - 2026-02-16

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

## [0.6.0] - 2026-02-15

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

## [0.5.0] - 2026-02-14

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

## [0.4.0] - 2026-02-13

### Added
- **Vehicle Import** — CSV/Excel Import für Fahrzeuge
- Dashboard Widgets mit KPI-Karten
- Standzeit-Tracking Basis

---

## [0.3.0] - 2026-02-12

### Added
- **Lead Management** — Anfragen-Inbox
- E-Mail Notifications für neue Leads
- Daily Summary E-Mails
- Longstanding Vehicle Alerts

---

## [0.2.0] - 2026-02-10

### Added
- **Fahrzeugverwaltung** — CRUD, Fotos, Zustand
- **Supabase Storage** für Bilder
- Multi-Channel Export vorbereitet

---

## [0.1.0] - 2026-02-08

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
