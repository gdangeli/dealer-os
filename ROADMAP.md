# 🗺️ DealerOS Product Roadmap

> **Stand:** Februar 2025  
> **Version:** 0.1.0 (Beta)  
> **Letzte Aktualisierung:** 16. Februar 2025

---

## 🎯 Vision & Ziele

### Was ist DealerOS?
DealerOS ist das **Betriebssystem für Schweizer Garagisten** – eine moderne SaaS-Plattform, die Fahrzeugverwaltung, Lead-Management und Business Analytics in einer einzigen, benutzerfreundlichen Lösung vereint.

### Unsere Mission
Kleine und mittlere Garagen in der Schweiz mit professionellen Tools auszustatten, die bisher nur grossen Autohäusern vorbehalten waren – **einfach, erschwinglich und auf Schweizer Bedürfnisse zugeschnitten**.

### Zielgruppe
- Einzelne Garagisten und kleine Autohändler (1-10 Mitarbeiter)
- Mittlere Garagen mit 10-50 Fahrzeugen im Bestand
- Schweizer Markt (DE/FR/IT/EN Support)

### Langfristige Vision (2027)
> **"Der zentrale Hub für den Schweizer Gebrauchtwagenhandel"**
- One-Click Publishing auf alle relevanten Plattformen
- KI-gestützte Preisempfehlungen
- Vollautomatisiertes Lead-Nurturing
- Integrierte Abwicklung bis zum Verkauf

---

## ✅ Aktueller Stand (v0.1.0 Beta)

### Implementierte Kernfunktionen

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| **Dashboard** | ✅ Live | Übersicht mit KPIs, offenen Anfragen, Langstehern |
| **Fahrzeugverwaltung** | ✅ Live | Erfassung, Bearbeitung, Bilder, Status-Tracking |
| **Lead-Management** | ✅ Live | Liste + Kanban-Board, Status-Workflow, Suche/Filter |
| **Analytics** | ✅ Live | Standzeit-Analyse, Margen-Tracking, Charts |
| **Einstellungen** | ✅ Live | Firmenprofil, Benutzer, Benachrichtigungen |
| **AutoScout24 Export** | ✅ Live | CSV-Export für manuellen Upload |
| **Onboarding** | ✅ Live | Geführter Setup-Wizard für neue Nutzer |
| **i18n** | ✅ Live | 5 Sprachen (DE, EN, FR, IT, SR) |
| **Landing Page** | ✅ Live | Marketing-Seite mit Pricing |
| **Auth** | ✅ Live | Login/Register via Supabase |
| **Legal** | ✅ Live | Impressum, AGB, Datenschutz |

### Tech Stack
- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **Hosting:** Vercel
- **Testing:** Vitest + Playwright
- **i18n:** next-intl

---

## 📅 Q1 2026 (Februar - März)
*Fokus: Platform Stability & Core Experience*

### 🔴 Hohe Priorität

#### 1. AutoScout24 API-Integration
- **Beschreibung:** Direkte Anbindung an AutoScout24 API für automatisches Publishing
- **Nutzen:** Keine manuellen CSV-Uploads mehr, Echtzeit-Sync
- **Aufwand:** XL
- **Status:** 🚧 Geplant

#### 2. Bildoptimierung & CDN
- **Beschreibung:** Automatische Bildkompression, WebP-Konvertierung, CDN-Delivery
- **Nutzen:** Schnellere Ladezeiten, weniger Storage-Kosten
- **Aufwand:** M
- **Status:** 🚧 Geplant

#### 3. E-Mail-Benachrichtigungen aktivieren
- **Beschreibung:** Implementierung der konfigurierten Benachrichtigungen (neue Leads, tägliche Zusammenfassung)
- **Nutzen:** Proaktive Information der Händler
- **Aufwand:** M
- **Status:** 🚧 Geplant

### 🟡 Mittlere Priorität

#### 4. Fahrzeug-Import aus CSV/Excel
- **Beschreibung:** Bulk-Import von Fahrzeugen aus bestehenden Listen
- **Nutzen:** Einfachere Migration von anderen Systemen
- **Aufwand:** M
- **Status:** 🚧 Geplant

#### 5. Lead-Notizen & Timeline
- **Beschreibung:** Aktivitäts-Timeline pro Lead mit Notizen, Anrufen, E-Mails
- **Nutzen:** Besserer Kundenkontext, Teamübergaben
- **Aufwand:** M
- **Status:** 🚧 Geplant

#### 6. Dashboard-Widgets konfigurierbar
- **Beschreibung:** Drag & Drop für Dashboard-Elemente, individuelle Ansichten
- **Nutzen:** Personalisierte Arbeitsumgebung
- **Aufwand:** L
- **Status:** 🚧 Geplant

### 🟢 Niedrige Priorität

#### 7. Dark Mode
- **Beschreibung:** Optionales dunkles Farbschema
- **Nutzen:** Bessere Lesbarkeit bei wenig Licht, modernes Erscheinungsbild
- **Aufwand:** S
- **Status:** 🚧 Geplant

#### 8. Keyboard Shortcuts
- **Beschreibung:** Tastaturkürzel für häufige Aktionen (n = neues Fahrzeug, etc.)
- **Nutzen:** Schnellere Navigation für Power-User
- **Aufwand:** S
- **Status:** 🚧 Geplant

---

## 📅 Q2 2026 (April - Juni)
*Fokus: Multi-Channel Publishing & Monetization*

### 🔴 Hohe Priorität

#### 9. mobile.de Integration
- **Beschreibung:** API-Anbindung an mobile.de für DACH-Markt
- **Nutzen:** Grössere Reichweite, besonders für Premium-Fahrzeuge
- **Aufwand:** L
- **Status:** 📋 Backlog

#### 10. Billing & Subscriptions (Stripe)
- **Beschreibung:** Zahlungsabwicklung, Abo-Verwaltung, Rechnungen
- **Nutzen:** Monetarisierung nach Beta-Phase
- **Aufwand:** XL
- **Status:** 📋 Backlog

#### 11. tutti.ch Integration
- **Beschreibung:** API-Anbindung für Schweizer Kleinanzeigen
- **Nutzen:** Zusätzlicher Kanal für Budget-Fahrzeuge
- **Aufwand:** M
- **Status:** 📋 Backlog

### 🔴 Hohe Priorität

#### 12. WhatsApp Business Integration
- **Beschreibung:** Lead-Kommunikation direkt über WhatsApp (Cloud API oder Business API)
- **Nutzen:** Bevorzugter Kommunikationskanal in der Schweiz, schnellere Lead-Konvertierung
- **Aufwand:** L
- **Status:** 📋 Backlog
- **Features:** 
  - Eingehende Nachrichten als Leads erfassen
  - Direkt aus Lead-Detail antworten
  - Message Templates für Follow-ups
  - Conversation History pro Lead

### 🟡 Mittlere Priorität

#### 13. Öffentliche Fahrzeug-Detailseite
- **Beschreibung:** Shareable Links für einzelne Fahrzeuge (Microsite)
- **Nutzen:** Direkte Kundenansprache ohne Plattform-Umweg
- **Aufwand:** M
- **Status:** 📋 Backlog

#### 14. Analytics-Export (PDF/Excel)
- **Beschreibung:** Generierung von Reports als PDF oder Excel
- **Nutzen:** Reporting für Steuerberater, Management
- **Aufwand:** M
- **Status:** 📋 Backlog

### 🟢 Niedrige Priorität

#### 15. Fahrzeug-Duplikate erkennen
- **Beschreibung:** Warnung bei potentiellen Duplikaten (VIN, Marke+Modell+Jahr)
- **Nutzen:** Datenqualität sicherstellen
- **Aufwand:** S
- **Status:** 📋 Backlog

#### 16. Bulk-Aktionen für Fahrzeuge
- **Beschreibung:** Mehrere Fahrzeuge gleichzeitig bearbeiten (Status ändern, löschen)
- **Nutzen:** Effizienz bei vielen Fahrzeugen
- **Aufwand:** M
- **Status:** 📋 Backlog

---

## 📅 Q3-Q4 2026
*Fokus: AI, Automation & Enterprise*

### 🔴 Hohe Priorität

#### 17. KI-Preisempfehlung
- **Beschreibung:** ML-basierte Preisvorschläge basierend auf Marktdaten
- **Nutzen:** Optimale Preisgestaltung, weniger Langsteher
- **Aufwand:** XL
- **Status:** 🔮 Vision

#### 18. Multi-User / Team-Funktionen
- **Beschreibung:** Mehrere Benutzer pro Händler-Konto, Rollen & Rechte
- **Nutzen:** Enterprise-Tauglichkeit, Team-Kollaboration
- **Aufwand:** XL
- **Status:** 🔮 Vision

#### 19. Facebook Marketplace Integration
- **Beschreibung:** Automatisches Posting auf Facebook Marketplace
- **Nutzen:** Zusätzliche Reichweite bei jüngerer Zielgruppe
- **Aufwand:** L
- **Status:** 🔮 Vision

### 🟡 Mittlere Priorität

#### 20. Lead-Scoring & Priorisierung
- **Beschreibung:** Automatische Bewertung von Lead-Qualität
- **Nutzen:** Fokus auf aussichtsreiche Anfragen
- **Aufwand:** L
- **Status:** 🔮 Vision

#### 21. Automatisierte Follow-up E-Mails
- **Beschreibung:** Zeitgesteuerte E-Mail-Sequenzen für Leads
- **Nutzen:** Kein Lead geht verloren
- **Aufwand:** L
- **Status:** 🔮 Vision

#### 22. Probefahrt-Terminbuchung
- **Beschreibung:** Online-Kalender für Probefahrten
- **Nutzen:** Weniger Telefonate, bessere Planung
- **Aufwand:** L
- **Status:** 🔮 Vision

### 🟢 Niedrige Priorität

#### 23. Mobile App (PWA)
- **Beschreibung:** Installierbare App für Smartphones
- **Nutzen:** Mobiler Zugriff, Push-Notifications
- **Aufwand:** L
- **Status:** 🔮 Vision

#### 24. Händler-zu-Händler Marktplatz
- **Beschreibung:** Interne B2B-Plattform für Fahrzeughandel zwischen Händlern
- **Nutzen:** Bestandsoptimierung, Netzwerk-Effekte
- **Aufwand:** XL
- **Status:** 🔮 Vision

---

## 📦 Backlog (Nice-to-Have)

*Ohne Zeitrahmen, nach Kundenfeedback priorisiert*

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| **Fahrzeug-Vergleich** | Mehrere Fahrzeuge nebeneinander vergleichen | S |
| **QR-Codes für Fahrzeuge** | Schneller Zugang zur Detailseite | S |
| **Dokumenten-Ablage** | Fahrzeugdokumente digital speichern | M |
| **Wartungs-Erinnerungen** | MFK-Termine, Service-Intervalle | M |
| **Käufer-Bewertungen** | Feedback nach Kauf sammeln | M |
| **Gewinn-/Verlust-Rechnung** | Detaillierte Kalkulation pro Fahrzeug | M |
| **Einkaufs-Pipeline** | Tracking von potenziellen Ankäufen | L |
| **Lieferanten-Verwaltung** | Kontakte zu Einkaufsquellen | M |
| **API für Drittsysteme** | Öffentliche REST-API | L |
| **Buchhaltungs-Export** | Integration mit Bexio, Abacus | L |
| **Fahrzeughistorie (Carfax-ähnlich)** | Automatischer Abruf von Vorgeschichte | XL |
| **Video-Rundgänge** | Fahrzeug-Videos hochladen & präsentieren | M |
| **360°-Fotos** | Interaktive Fahrzeugansichten | L |
| **Chatbot für Website** | KI-gestützter Erstkontakt | L |
| **Markt-Benchmark** | Vergleich mit lokaler Konkurrenz | XL |

---

## 📊 Aufwand-Legende

| Symbol | Bedeutung | Geschätzte Zeit |
|--------|-----------|-----------------|
| **S** | Small | 1-2 Tage |
| **M** | Medium | 3-5 Tage |
| **L** | Large | 1-2 Wochen |
| **XL** | Extra Large | 3+ Wochen |

---

## 🚦 Status-Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Live / Implementiert |
| 🚧 | In Arbeit / Geplant für aktuelles Quartal |
| 📋 | Im Backlog / Priorisiert |
| 🔮 | Vision / Langfristig |

---

## 📝 Changelog

### v0.1.0 (Februar 2025)
- Initial Beta Release
- Dashboard, Fahrzeuge, Leads, Analytics
- AutoScout24 CSV-Export
- 5-Sprachen-Support

---

## 💡 Feedback

Haben Sie Ideen oder Wünsche? Schreiben Sie uns:
- **E-Mail:** feedback@dealeros.ch
- **Im Dashboard:** Einstellungen → Feedback

---

*Diese Roadmap wird regelmässig aktualisiert und kann sich basierend auf Kundenfeedback und Marktentwicklungen ändern.*
