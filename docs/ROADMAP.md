# DealerOS Roadmap

> **Stand:** 20. Februar 2026  
> **Version:** 0.11.0  
> **Live:** https://dealeros.ch

---

## 📊 Status-Übersicht

| Kategorie | Status |
|-----------|--------|
| Core Features | ✅ Komplett |
| Multi-User & Admin | ✅ Komplett |
| Integrationen (Basis) | ✅ Komplett |
| Infrastruktur | ✅ Komplett |
| Externe APIs | 📋 Zurückgestellt |

---

## ✅ FERTIG & LIVE (v0.11.0)

### Core Features

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| **Dashboard** | ✅ Live | KPIs, Widgets, Übersicht |
| **Fahrzeugverwaltung** | ✅ Live | CRUD, Bilder, Status, Import |
| **Lead-Management** | ✅ Live | Liste + Kanban-Board |
| **Kunden-CRM** | ✅ Live | Kontakte, Historie |
| **Offerten-Modul** | ✅ Live | Erstellung, PDF-Export |
| **Rechnungs-Modul** | ✅ Live | Zahlungs-Tracking, PDF |
| **Analytics & Charts** | ✅ Live | Conversion, Margen, Trends |
| **Standzeit-Tracking** | ✅ Live | Automatische Berechnung |

### Multi-User & Administration

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| **Multi-User / Teams** | ✅ Live | Mehrere Benutzer pro Händler |
| **Team-Verwaltung** | ✅ Live | Einladen, Entfernen |
| **Rollen-System** | ✅ Live | Owner, Admin, Member, Viewer |
| **Plan-basierte Limits** | ✅ Live | User-Anzahl nach Plan |
| **Admin Dashboard** | ✅ Live | Platform-Administration |
| **Dealer-Übersicht** | ✅ Live | Alle Kunden, Stats, Filter |
| **Impersonate** | ✅ Live | Als Kunde einloggen |
| **Dealer hinzufügen** | ✅ Live | Manuell über Admin |
| **CSV-Export** | ✅ Live | Dealer-Liste exportieren |

### Integrationen (Basis)

| Integration | Status | Beschreibung |
|-------------|--------|--------------|
| **WhatsApp Business** | ✅ Live | Setup-Wizard, Templates, Chat |
| **E-Mail-Benachrichtigungen** | ✅ Live | Lead-Alerts, Status-Updates |
| **E-Mail-Vorlagen** | ✅ Live | 6 Kategorien, Platzhalter |
| **Stripe Subscriptions** | ✅ Live | Starter gratis, Pro 129, Business 229 |

### Infrastruktur

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| **4 Sprachen** | ✅ Live | DE, EN, FR, IT komplett |
| **Onboarding-Wizard** | ✅ Live | 7 Schritte, persistent |
| **Help-Center** | ✅ Live | 8 Kategorien, 30+ Artikel |
| **Multi-Standort** | ✅ Live | Locations, Filter |
| **SEO** | ✅ Live | robots.txt, sitemap, Meta |
| **E2E Tests** | ✅ Live | 100% Coverage |
| **CI/CD** | ✅ Live | GitHub Actions, Vercel |

### Dokumentation

| Dokument | Status | Beschreibung |
|----------|--------|--------------|
| **README.md** | ✅ Aktuell | Setup, Features, Struktur |
| **CHANGELOG.md** | ✅ Aktuell | Alle Releases |
| **Help-Center** | ✅ Live | In-App Doku |
| **M&A Due Diligence** | ✅ Komplett | 4 Bereiche, 19 Docs |
| **API Docs** | ✅ Komplett | Technische Doku |

---

## 📋 ZURÜCKGESTELLT

Diese Features sind konzeptionell vorbereitet, aber nicht priorisiert:

| # | Feature | Aufwand | Beschreibung | Docs |
|---|---------|---------|--------------|------|
| 1 | **Datenprovider API** | XL | Eurotax, auto-i-dat für Fahrzeugdaten | - |
| 2 | **AutoScout24 API** | XL | Direkte Publikation (Partner-API nötig) | - |
| 3 | **Autolina.ch API** | L | Schweizer Fahrzeugmarkt | - |
| 4 | **mobile.de API** | L | DE-Markt Expansion | - |
| 5 | **Bexio-Integration** | S | Code fertig, wartet auf Setup | ✅ |
| 6 | **KI-Preisempfehlung** | XL | Marktbasierte Preisvorschläge | ✅ |

**Vorhandene Dokumentation:**
- Bexio: `docs/BEXIO_INTEGRATION.md`
- KI-Pricing: `docs/features/AI-PRICING.md`, `docs/features/AI-PRICING-CONCEPT.md`

---

## 💡 MÖGLICHE ERWEITERUNGEN

Ideen für zukünftige Versionen — noch nicht geplant:

| # | Feature | Aufwand | Beschreibung |
|---|---------|---------|--------------|
| 1 | **Mobile App** | XL | Native iOS/Android für unterwegs |
| 2 | **Probefahrt-Buchung** | S | Online-Terminbuchung für Kunden |
| 3 | **Fahrzeug-Bewertung öffentlich** | S | Inzahlungnahme-Rechner auf Händler-Website |
| 4 | **Website-Widget** | M | Fahrzeuge auf eigener Website einbinden |
| 5 | **Automatische Foto-Optimierung** | S | Hintergrund entfernen, Bilder verbessern |
| 6 | **Dokumenten-Management** | M | Fahrzeugpapiere, Kaufverträge digital |
| 7 | **SMS-Benachrichtigungen** | S | Zusätzlich zu WhatsApp/E-Mail |

**Aufwand-Legende:** S = Small (1-2 Tage), M = Medium (3-5 Tage), L = Large (1-2 Wochen), XL = Extra Large (3+ Wochen)

---

## 📅 Release-Historie

| Version | Datum | Highlights |
|---------|-------|------------|
| v0.11.0 | 20.02.2026 | Admin Dashboard, Impersonate, M&A Doku |
| v0.10.0 | 19.02.2026 | Multi-User/Teams, RLS Policies |
| v0.9.0 | 18.02.2026 | E2E Tests, Pricing Update, Onboarding |
| v0.8.0 | 17.02.2026 | WhatsApp Phase 2, Agent Team |
| v0.7.0 | 16.02.2026 | Analytics, Multi-Standort |
| v0.6.0 | 16.02.2026 | Rechnungen, Bexio-Integration |
| v0.5.0 | 15.02.2026 | Offerten-Modul |
| v0.4.0 | 15.02.2026 | Kunden-CRM |
| v0.3.0 | 15.02.2026 | Lead-Management |
| v0.2.0 | 15.02.2026 | Fahrzeugverwaltung |
| v0.1.0 | 15.02.2026 | Initial Release |

---

## 📞 Ressourcen

| Resource | Link |
|----------|------|
| Live App | https://dealeros.ch |
| Repo | github.com/gdangeli/dealer-os |
| Supabase | xcefcwcpqbhglwholvvd.supabase.co |
| Stripe | stripe.com Dashboard |

---

*Letzte Aktualisierung: 20. Februar 2026*
