# 🧪 DealerOS - Manuelle Testprozeduren

> Schritt-für-Schritt Anleitungen zum Durchtesten aller Bereiche.  
> Hake ab (☑️), was du getestet hast.

---

## 📋 Übersicht

| Bereich | Geschätzte Zeit | Priorität |
|---------|-----------------|-----------|
| 1. Registrierung & Onboarding | 10 min | ⭐⭐⭐ |
| 2. Fahrzeugverwaltung | 15 min | ⭐⭐⭐ |
| 3. Lead-Management | 10 min | ⭐⭐⭐ |
| 4. Kundenverwaltung | 10 min | ⭐⭐ |
| 5. Offerten | 15 min | ⭐⭐⭐ |
| 6. Rechnungen | 15 min | ⭐⭐⭐ |
| 7. E-Mail-Vorlagen | 5 min | ⭐ |
| 8. WhatsApp | 10 min | ⭐⭐ |
| 9. Multi-Standort | 10 min | ⭐⭐ |
| 10. Analytics | 5 min | ⭐ |
| 11. Einstellungen | 10 min | ⭐⭐ |
| 12. Hilfe/Dokumentation | 5 min | ⭐ |
| 13. Landing Page | 5 min | ⭐ |

**Gesamtzeit:** ca. 2 Stunden

---

## 1. 🚀 Registrierung & Onboarding

### 1.1 Registrierung
- [ ] Öffne https://dealer-os-opal.vercel.app/register
- [ ] Fülle Formular aus mit Test-E-Mail
- [ ] Klicke "Registrieren"
- [ ] **Prüfe:** Bestätigungs-E-Mail erhalten?
- [ ] Klicke Link in E-Mail
- [ ] **Prüfe:** Weiterleitung zum Onboarding?

### 1.2 Onboarding-Wizard (7 Schritte)
- [ ] **Schritt 1 - Welcome:** "Los geht's" klicken
- [ ] **Schritt 2 - Company:** Firmenname + Logo hochladen
  - [ ] Logo-Upload funktioniert?
  - [ ] Vorschau korrekt?
- [ ] **Schritt 3 - Location:** Ersten Standort eingeben
  - [ ] Adresse speichern
- [ ] **Schritt 4 - Vehicle:** Erstes Fahrzeug (optional)
  - [ ] "Überspringen" und "Fahrzeug hinzufügen" testen
- [ ] **Schritt 5 - Notifications:** E-Mail-Benachrichtigungen
  - [ ] Toggle an/aus funktioniert?
- [ ] **Schritt 6 - Tour:** Mini-Einführung lesen
- [ ] **Schritt 7 - Complete:** Konfetti-Animation? 🎉
- [ ] **Prüfe:** Weiterleitung zum Dashboard?

### 1.3 Onboarding-Fortsetzung
- [ ] Melde dich ab
- [ ] Melde dich wieder an
- [ ] **Prüfe:** Landest du direkt im Dashboard (nicht erneut Onboarding)?

---

## 2. 🚙 Fahrzeugverwaltung

### 2.1 Fahrzeug erstellen
- [ ] Gehe zu "Bestand" → "Neues Fahrzeug"
- [ ] Fülle aus:
  - [ ] Marke: BMW
  - [ ] Modell: 320d Touring
  - [ ] Erstzulassung: 01.03.2020
  - [ ] Kilometerstand: 85'000
  - [ ] Verkaufspreis: 28'500
  - [ ] Einkaufspreis: 23'000 (für Marge)
- [ ] **Prüfe:** Formular-Validierung bei Pflichtfeldern
- [ ] Speichern
- [ ] **Prüfe:** Fahrzeug erscheint in Liste?

### 2.2 Fotos hochladen
- [ ] Öffne das erstellte Fahrzeug
- [ ] Gehe zu Tab "Fotos"
- [ ] Lade 3+ Bilder hoch (Drag & Drop)
- [ ] **Prüfe:** Bilder werden angezeigt?
- [ ] **Prüfe:** Erstes Bild = Hauptbild?
- [ ] Reihenfolge per Drag & Drop ändern
- [ ] **Prüfe:** Reihenfolge gespeichert?

### 2.3 Fahrzeug bearbeiten
- [ ] Ändere Preis auf 27'900
- [ ] Speichern
- [ ] **Prüfe:** Preis aktualisiert in Liste?

### 2.4 Status ändern
- [ ] Setze Status auf "Reserviert"
- [ ] **Prüfe:** Badge in Liste zeigt "Reserviert"?
- [ ] Setze Status auf "Verkauft"
- [ ] **Prüfe:** Fahrzeug aus "Verfügbar"-Filter verschwunden?

### 2.5 Standzeit-Warnung
- [ ] Erstelle Fahrzeug mit Erfassungsdatum > 30 Tage zurück
- [ ] **Prüfe:** Gelbe Standzeit-Warnung sichtbar?

---

## 3. 💬 Lead-Management

### 3.1 Lead erstellen
- [ ] Gehe zu "Anfragen" → "Neuer Lead"
- [ ] Fülle aus:
  - [ ] Name: Max Muster
  - [ ] E-Mail: test@example.com
  - [ ] Telefon: 079 123 45 67
  - [ ] Interesse: BMW 320d (verknüpfen)
  - [ ] Quelle: Website
- [ ] Speichern
- [ ] **Prüfe:** Lead erscheint mit Status "Neu"?

### 3.2 Status-Workflow
- [ ] Ändere Status zu "Kontaktiert"
- [ ] Ändere Status zu "Interessiert"
- [ ] Ändere Status zu "Besichtigung"
- [ ] Ändere Status zu "Verhandlung"
- [ ] **Prüfe:** Status-Badges korrekt angezeigt?

### 3.3 Notizen hinzufügen
- [ ] Öffne Lead-Detail
- [ ] Füge Notiz hinzu: "Kunde will Probefahrt am Samstag"
- [ ] **Prüfe:** Notiz gespeichert und sichtbar?

### 3.4 Lead abschliessen
- [ ] Setze Status auf "Gewonnen"
- [ ] **Prüfe:** Lead-Conversion-Statistik aktualisiert?

---

## 4. 👥 Kundenverwaltung

### 4.1 Privatkunde erstellen
- [ ] Gehe zu "Kunden" → "Neuer Kunde"
- [ ] Wähle "Privatperson"
- [ ] Fülle aus:
  - [ ] Anrede: Herr
  - [ ] Vorname: Max
  - [ ] Nachname: Muster
  - [ ] E-Mail: max.muster@example.com
  - [ ] Strasse: Bahnhofstrasse 1
  - [ ] PLZ: 8001
  - [ ] Ort: Zürich
- [ ] Speichern
- [ ] **Prüfe:** Kunde in Liste sichtbar?

### 4.2 Firmenkunde erstellen
- [ ] Neuer Kunde → "Firma"
- [ ] Fülle aus:
  - [ ] Firmenname: Muster AG
  - [ ] UID: CHE-123.456.789
  - [ ] Ansprechpartner: Hans Keller
- [ ] **Prüfe:** UID-Feld nur bei Firma sichtbar?

### 4.3 Kunde suchen
- [ ] Nutze Suchfeld
- [ ] Suche nach "Muster"
- [ ] **Prüfe:** Beide Kunden gefunden?

### 4.4 Kundenhistorie
- [ ] Öffne Kunden-Detail
- [ ] **Prüfe:** Tabs für Offerten/Rechnungen sichtbar?
- [ ] **Prüfe:** Historie zeigt Erstelldatum?

---

## 5. 📄 Offerten

### 5.1 Offerte erstellen
- [ ] Gehe zu "Offerten" → "Neue Offerte"
- [ ] Wähle Kunde (Max Muster)
- [ ] **Prüfe:** Kundendaten übernommen?
- [ ] Verknüpfe Fahrzeug (BMW 320d)
- [ ] **Prüfe:** Fahrzeugdaten übernommen?
- [ ] Setze Gültigkeitsdatum (+14 Tage)
- [ ] Speichern

### 5.2 Positionen hinzufügen
- [ ] Klicke "Position hinzufügen"
- [ ] Füge hinzu:
  - [ ] Typ: Zubehör
  - [ ] Bezeichnung: Winterräder
  - [ ] Preis: 1'200
- [ ] **Prüfe:** Total aktualisiert?

### 5.3 Rabatt anwenden
- [ ] Füge Rabatt hinzu: 500 CHF
- [ ] **Prüfe:** Total korrekt berechnet?

### 5.4 PDF-Vorschau
- [ ] Klicke "PDF anzeigen"
- [ ] **Prüfe:** PDF öffnet sich?
- [ ] **Prüfe:** Logo, Adresse, Positionen korrekt?
- [ ] **Prüfe:** MwSt. korrekt berechnet (8.1%)?

### 5.5 Offerte versenden
- [ ] Klicke "Per E-Mail senden"
- [ ] **Prüfe:** E-Mail-Vorschau korrekt?
- [ ] Senden (an deine Test-E-Mail)
- [ ] **Prüfe:** E-Mail erhalten?
- [ ] **Prüfe:** Status wechselt zu "Gesendet"?

### 5.6 In Rechnung umwandeln
- [ ] Setze Status auf "Angenommen"
- [ ] Klicke "In Rechnung umwandeln"
- [ ] **Prüfe:** Neue Rechnung erstellt mit allen Daten?

---

## 6. 🧾 Rechnungen

### 6.1 Rechnung erstellen (manuell)
- [ ] Gehe zu "Rechnungen" → "Neue Rechnung"
- [ ] Wähle Kunde
- [ ] Füge Positionen hinzu
- [ ] Setze Zahlungsziel (+30 Tage)
- [ ] Speichern
- [ ] **Prüfe:** Rechnungsnummer automatisch vergeben?

### 6.2 PDF-Rechnung
- [ ] Klicke "PDF anzeigen"
- [ ] **Prüfe:** QR-Code für Zahlung vorhanden?
- [ ] **Prüfe:** IBAN korrekt?
- [ ] **Prüfe:** Alle Positionen aufgelistet?

### 6.3 Zahlung erfassen
- [ ] Klicke "Zahlung erfassen"
- [ ] Gib Betrag ein (z.B. 10'000 als Anzahlung)
- [ ] Wähle Zahlungsart: Überweisung
- [ ] Speichern
- [ ] **Prüfe:** Status wechselt zu "Teilbezahlt"?
- [ ] **Prüfe:** Offener Betrag korrekt?

### 6.4 Vollständige Zahlung
- [ ] Erfasse Restzahlung
- [ ] **Prüfe:** Status wechselt zu "Bezahlt"?

### 6.5 Mahnung
- [ ] Erstelle Rechnung mit Fälligkeit in Vergangenheit
- [ ] **Prüfe:** Status zeigt "Überfällig"?
- [ ] Klicke "Mahnung senden"
- [ ] **Prüfe:** Mahnungs-E-Mail Vorschau?

---

## 7. 📧 E-Mail-Vorlagen

### 7.1 Vorlagen anzeigen
- [ ] Gehe zu "E-Mail-Vorlagen"
- [ ] **Prüfe:** Alle Kategorien sichtbar?
  - [ ] Erstkontakt
  - [ ] Probefahrt
  - [ ] Preisanfrage
  - [ ] Nachfassen
  - [ ] Absage

### 7.2 Vorlage bearbeiten
- [ ] Öffne eine Vorlage
- [ ] Ändere Betreff
- [ ] Ändere Text
- [ ] Füge Platzhalter ein: {kundenname}
- [ ] Speichern
- [ ] **Prüfe:** Änderungen gespeichert?

### 7.3 Neue Vorlage erstellen
- [ ] Klicke "Neue Vorlage"
- [ ] Wähle Kategorie: Benutzerdefiniert
- [ ] Fülle aus
- [ ] Speichern
- [ ] **Prüfe:** Vorlage in Liste?

---

## 8. 💬 WhatsApp

### 8.1 Einstellungen
- [ ] Gehe zu "Einstellungen" → "WhatsApp"
- [ ] **Prüfe:** Setup-Wizard sichtbar wenn nicht verbunden?

### 8.2 Verbindung (falls Meta-Account vorhanden)
- [ ] Starte Setup-Wizard
- [ ] Folge den Schritten
- [ ] **Prüfe:** QR-Code angezeigt?
- [ ] **Prüfe:** Status nach Scan?

### 8.3 Nachrichten-Ansicht
- [ ] Gehe zu "WhatsApp" im Dashboard
- [ ] **Prüfe:** Conversations-Liste sichtbar?
- [ ] **Prüfe:** Leerer State wenn keine Nachrichten?

---

## 9. 🏢 Multi-Standort

### 9.1 Standort hinzufügen
- [ ] Gehe zu "Einstellungen" → "Standorte"
- [ ] Klicke "Neuer Standort"
- [ ] Fülle aus:
  - [ ] Name: Filiale Winterthur
  - [ ] Adresse: Technikumstrasse 1, 8400 Winterthur
- [ ] Speichern
- [ ] **Prüfe:** Standort in Liste?

### 9.2 Standort-Filter
- [ ] Gehe zur Sidebar
- [ ] **Prüfe:** Standort-Dropdown sichtbar?
- [ ] Wähle "Filiale Winterthur"
- [ ] **Prüfe:** Nur Fahrzeuge dieses Standorts angezeigt?
- [ ] Wähle "Alle Standorte"
- [ ] **Prüfe:** Alle Fahrzeuge angezeigt?

### 9.3 Fahrzeug zu Standort zuweisen
- [ ] Bearbeite ein Fahrzeug
- [ ] Ändere Standort
- [ ] Speichern
- [ ] **Prüfe:** Standort in Fahrzeugliste korrekt?

---

## 10. 📈 Analytics

### 10.1 Dashboard-KPIs
- [ ] Gehe zu "Übersicht"
- [ ] **Prüfe:** KPI-Karten angezeigt?
  - [ ] Anzahl Fahrzeuge
  - [ ] Ø Standzeit
  - [ ] Offene Leads
  - [ ] Ø Marge (wenn Daten vorhanden)

### 10.2 Auswertungen
- [ ] Gehe zu "Auswertungen"
- [ ] **Prüfe:** Charts laden?
- [ ] Ändere Zeitraum (letzte 7/30/90 Tage)
- [ ] **Prüfe:** Charts aktualisieren sich?

### 10.3 Export
- [ ] Klicke "CSV Export"
- [ ] **Prüfe:** Download startet?
- [ ] **Prüfe:** CSV enthält Daten?

---

## 11. ⚙️ Einstellungen

### 11.1 Firmenprofil
- [ ] Gehe zu "Einstellungen" → "Firmenprofil"
- [ ] Ändere Firmenname
- [ ] Lade neues Logo hoch
- [ ] Speichern
- [ ] **Prüfe:** Änderungen in Sidebar/Dokumenten?

### 11.2 Benachrichtigungen
- [ ] Gehe zu "Benachrichtigungen"
- [ ] Toggle E-Mail-Alerts an/aus
- [ ] **Prüfe:** Einstellungen gespeichert?

### 11.3 Sprache wechseln
- [ ] Klicke Sprachwechsler (unten in Sidebar)
- [ ] Wechsle zu Französisch
- [ ] **Prüfe:** Alle Texte übersetzt?
- [ ] Wechsle zu Italienisch
- [ ] **Prüfe:** Alle Texte übersetzt?
- [ ] Zurück zu Deutsch

---

## 12. ❓ Hilfe/Dokumentation

### 12.1 Hilfe-Center öffnen
- [ ] Klicke "Hilfe" in Sidebar
- [ ] **Prüfe:** Hilfe-Übersicht lädt?
- [ ] **Prüfe:** Alle 8 Kategorien sichtbar?

### 12.2 Artikel lesen
- [ ] Klicke auf "Erste Schritte"
- [ ] **Prüfe:** Artikelliste erscheint?
- [ ] Öffne "Erste Schritte mit Dealer OS"
- [ ] **Prüfe:** Artikel-Inhalt korrekt?
- [ ] **Prüfe:** Schritte und Tipps sichtbar?

### 12.3 Suche
- [ ] Nutze Suchfeld
- [ ] Suche nach "Fahrzeug"
- [ ] **Prüfe:** Relevante Artikel gefunden?

### 12.4 Navigation
- [ ] Klicke Breadcrumb "Zurück zur Übersicht"
- [ ] **Prüfe:** Navigation funktioniert?

---

## 13. 🌐 Landing Page

### 13.1 Desktop-Ansicht
- [ ] Öffne https://dealer-os-opal.vercel.app
- [ ] **Prüfe:** Hero-Bereich korrekt?
- [ ] **Prüfe:** Alle 11 Features angezeigt?
- [ ] **Prüfe:** Preise korrekt (Gratis/129/229)?
- [ ] **Prüfe:** Testimonials laden?
- [ ] **Prüfe:** Footer-Links funktionieren?

### 13.2 Mobile-Ansicht
- [ ] Öffne in Mobile-Simulator (F12 → Responsive)
- [ ] **Prüfe:** Hamburger-Menü funktioniert?
- [ ] **Prüfe:** Alle Sektionen lesbar?
- [ ] **Prüfe:** Buttons erreichbar?

### 13.3 Sprachversionen
- [ ] Wechsle zu /en, /fr, /it
- [ ] **Prüfe:** Texte vollständig übersetzt?

### 13.4 CTAs
- [ ] Klicke "Kostenlos starten"
- [ ] **Prüfe:** Weiterleitung zu /register?
- [ ] Klicke "Demo ansehen"
- [ ] **Prüfe:** Video-Modal öffnet sich?

---

## 📝 Bug-Tracking Template

Wenn du einen Bug findest, dokumentiere ihn so:

```
### Bug #X: [Kurzbeschreibung]
- **Bereich:** [z.B. Offerten]
- **Schritte:** 
  1. ...
  2. ...
- **Erwartet:** ...
- **Tatsächlich:** ...
- **Screenshot:** [falls möglich]
- **Priorität:** Hoch/Mittel/Niedrig
```

---

## ✅ Test-Abschluss

- [ ] Alle kritischen Bereiche (⭐⭐⭐) getestet
- [ ] Bugs dokumentiert
- [ ] Screenshots von Problemen gemacht
- [ ] Feedback notiert

**Getestet von:** ________________  
**Datum:** ________________  
**Gesamtdauer:** ________________
