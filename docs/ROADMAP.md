# DealerOS Roadmap

> **Stand:** 20. Februar 2026  
> **Version:** 0.11.0  
> **Live:** https://dealeros.ch

---

## 📊 Status-Übersicht

| Kategorie | Status |
|-----------|--------|
| Core Features | ✅ Komplett |
| Integrationen | 🟡 Teilweise |
| Infrastruktur | ✅ Komplett |
| Marketplace-Integrationen | 📋 Geplant |
| KI-Features | 📋 Zurückgestellt |

---

## ✅ FERTIG & LIVE (v0.11.0)

### Core Features

| Feature | Status | Release |
|---------|--------|---------|
| **Dashboard** mit KPIs & Widgets | ✅ Live | v0.1 |
| **Fahrzeugverwaltung** (CRUD, Bilder, Status, Import) | ✅ Live | v0.2 |
| **Lead-Management** (Liste + Kanban-Board) | ✅ Live | v0.3 |
| **Kunden-CRM** (Kontakte, Historie) | ✅ Live | v0.4 |
| **Offerten-Modul** mit PDF-Export | ✅ Live | v0.5 |
| **Rechnungs-Modul** mit Zahlungs-Tracking | ✅ Live | v0.6 |
| **Analytics & Charts** (Conversion, Margen, Trends) | ✅ Live | v0.7 |
| **Standzeit-Tracking** | ✅ Live | v0.7 |

### Multi-User & Administration

| Feature | Status | Release |
|---------|--------|---------|
| **Multi-User / Teams** | ✅ Live | v0.10 |
| Team-Verwaltung (Einladen, Rollen) | ✅ Live | v0.10 |
| 4 Rollen (Owner, Admin, Member, Viewer) | ✅ Live | v0.10 |
| Plan-basierte User-Limits | ✅ Live | v0.10 |
| **Admin Dashboard** (Platform Admin) | ✅ Live | v0.11 |
| Dealer-Übersicht & Stats | ✅ Live | v0.11 |
| Impersonate-Funktion | ✅ Live | v0.11 |
| Dealer hinzufügen (manuell) | ✅ Live | v0.11 |
| CSV-Export Dealers | ✅ Live | v0.11 |

### Integrationen

| Integration | Status | Details |
|-------------|--------|---------|
| **WhatsApp Business** | ✅ Live | Setup-Wizard, Templates, Conversations |
| **E-Mail-Benachrichtigungen** | ✅ Live | Lead-Alerts, Status-Updates |
| **E-Mail-Vorlagen** | ✅ Live | 6 Kategorien, Platzhalter-System |
| **Bexio** | 🟡 Code fertig | OAuth, Kunden- & Rechnungs-Sync (wartet auf Setup) |
| **Stripe Subscriptions** | ✅ Live | Starter gratis, Pro 129, Business 229 CHF |

### Infrastruktur

| Feature | Status | Details |
|---------|--------|---------|
| **4 Sprachen** (DE/EN/FR/IT) | ✅ Live | Komplett übersetzt |
| **Onboarding-Wizard** | ✅ Live | 7 Schritte, Fortschritt persistent |
| **Help-Center** | ✅ Live | 8 Kategorien, 30+ Artikel |
| **Multi-Standort** | ✅ Live | Locations-Verwaltung, Filter |
| **SEO** | ✅ Live | robots.txt, sitemap.xml, Meta-Tags |
| **E2E Tests** | ✅ Live | 100% Coverage (8/8 Module) |
| **CI/CD** | ✅ Live | GitHub Actions, Auto-Deploy Vercel |

### Dokumentation

| Dokument | Status | Details |
|----------|--------|---------|
| **README.md** | ✅ Aktuell | Features, Setup, Struktur |
| **CHANGELOG.md** | ✅ Aktuell | Alle Releases dokumentiert |
| **Help-Center** | ✅ Live | In-App Dokumentation |
| **M&A Due Diligence** | ✅ Komplett | 4 Bereiche, 19 Dokumente |

---

## 🟡 IN ARBEIT / AUSSTEHEND

| Feature | Status | Blocker | Aufwand |
|---------|--------|---------|---------|
| **Bexio-Integration testen** | Ausstehend | Giuseppe muss Bexio Developer Account einrichten | S |
| **Stripe End-to-End testen** | Ausstehend | Testdurchlauf mit echtem Checkout | S |

---

## 📋 ROADMAP Q1-Q2 2026

### Priorität 1: Marketplace-Integrationen

| Feature | Status | Aufwand | Beschreibung |
|---------|--------|---------|--------------|
| **AutoScout24 API** | 📋 Geplant | XL | Fahrzeuge direkt publizieren (statt CSV) |
| **mobile.de Integration** | 📋 Backlog | L | DE-Markt Expansion |
| **tutti.ch Integration** | 📋 Backlog | M | CH Kleinanzeigen |

**Hinweis AutoScout24:**
- Keine öffentliche API verfügbar
- Nur für Partner-Händler
- Giuseppe hat Kontakte bei TX Group → Evaluieren

### Priorität 2: Erweiterte Features

| Feature | Status | Aufwand | Beschreibung |
|---------|--------|---------|--------------|
| **Erweiterte Analytics** | 📋 Geplant | M | Mehr KPIs, Vergleiche, Export |
| **Reporting-Modul** | 📋 Geplant | M | Automatische Reports, PDF-Export |
| **API für Drittanbieter** | 📋 Backlog | L | REST API für externe Integrationen |

---

## 🔮 VISION (Zurückgestellt)

| Feature | Status | Aufwand | Beschreibung |
|---------|--------|---------|--------------|
| **KI-Preisempfehlung** | 📋 Zurückgestellt | XL | Marktbasierte Preisvorschläge |

**Dokumentation vorhanden:**
- `docs/features/AI-PRICING.md` – Research & Analyse
- `docs/features/AI-PRICING-CONCEPT.md` – Konzept & Implementierungsplan

**Empfohlener Ansatz (wenn priorisiert):**
- Eurotax API als Basis (~CHF 15k + 600/Mt)
- Eigene Adjustments (Zustand, Region, Saison)
- Timeline: 4-6 Wochen für MVP

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
| v0.1.0 | 15.02.2026 | Initial Release, Auth, Dashboard |

---

## 🎯 Nächste Schritte

1. **Bexio testen** – Giuseppe richtet Developer Account ein
2. **Stripe E2E testen** – Kompletter Checkout-Flow
3. **AutoScout24 evaluieren** – TX Group Kontakt nutzen
4. **Beta-Händler onboarden** – Erste echte Kunden

---

## 📞 Kontakte & Ressourcen

| Resource | Link/Info |
|----------|-----------|
| Live App | https://dealeros.ch |
| Repo | github.com/gdangeli/dealer-os |
| Supabase | xcefcwcpqbhglwholvvd.supabase.co |
| Vercel | Auto-Deploy von main Branch |
| Stripe | Dashboard unter stripe.com |

---

*Letzte Aktualisierung: 20. Februar 2026, 08:30 UTC*
