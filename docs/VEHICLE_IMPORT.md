# CSV/Excel Import für Fahrzeuge

## Übersicht

Das Import-Feature ermöglicht es Händlern, mehrere Fahrzeuge gleichzeitig aus CSV oder Excel-Dateien zu importieren.

## Features

✅ **Datei-Upload**: CSV und Excel (.xlsx, .xls)
✅ **Datenvorschau**: Erste 10 Zeilen vor Import ansehen
✅ **Automatisches Spalten-Mapping**: Erkennt deutsche und englische Feldnamen
✅ **Manuelles Mapping**: Spalten können manuell zugeordnet werden
✅ **Validierung**: Prüft Pflichtfelder, Datentypen und Formate
✅ **Batch-Import**: Importiert in Stapeln von 10 Fahrzeugen
✅ **Fortschrittsanzeige**: Zeigt Import-Fortschritt in Echtzeit
✅ **Fehlerreport**: Detaillierte Fehlermeldungen nach Import

## Verwendung

### 1. Navigation

Gehe zu **Dashboard → Fahrzeuge** und klicke auf **"📄 CSV/Excel Import"**

### 2. Datei vorbereiten

#### Pflichtfelder
- **Marke** (z.B. VW, BMW, Audi)
- **Modell** (z.B. Golf, 3er, A4)
- **Erstzulassung** im Format `YYYY-MM-DD` (z.B. 2020-05-15)
- **Kilometerstand** als Zahl (z.B. 45000)
- **Verkaufspreis** als Zahl in CHF (z.B. 24900)

#### Optionale Felder
- Variante / Ausführung
- Treibstoff: `petrol`, `diesel`, `electric`, `hybrid`, `other`
- Getriebe: `manual`, `automatic`
- Leistung in kW
- Farbe
- VIN / Fahrgestellnummer
- Einkaufspreis in CHF
- Beschreibung (Inseratetext)
- Interne Notizen

#### Beispiel CSV:

```csv
Marke,Modell,Variante,Erstzulassung,Kilometerstand,Treibstoff,Getriebe,Leistung,Farbe,VIN,Einkaufspreis,Verkaufspreis,Beschreibung
VW,Golf,GTI,2020-05-15,45000,petrol,manual,180,Schwarz Metallic,WVWZZZ1KZBW123456,18000,24900,Gepflegter Golf GTI
BMW,320d,Touring,2019-03-20,68000,diesel,automatic,140,Blau,WBA8E1108KK123456,22000,29500,BMW 3er Touring
```

Eine Vorlage finden Sie unter: `docs/vehicle-import-template.csv`

### 3. Datei hochladen

- Klicken Sie auf **"Datei auswählen"**
- Wählen Sie Ihre CSV oder Excel-Datei aus
- Klicken Sie auf **"Weiter zur Vorschau"**

### 4. Vorschau prüfen

- Überprüfen Sie die ersten 10 Zeilen
- Stellen Sie sicher, dass die Daten korrekt gelesen wurden
- Klicken Sie auf **"Weiter zum Spalten-Mapping"**

### 5. Spalten zuordnen

Das System versucht automatisch, Ihre Spalten den richtigen Feldern zuzuordnen:

**Erkannte Spaltennamen:**
- `Marke`, `Make`, `Brand`, `Hersteller` → Marke
- `Modell`, `Model` → Modell
- `Erstzulassung`, `EZ`, `First Registration` → Erstzulassung
- `Kilometerstand`, `KM`, `Mileage` → Kilometerstand
- `Verkaufspreis`, `VK`, `Price`, `Asking Price` → Verkaufspreis
- etc.

Falls nötig, können Sie das Mapping manuell anpassen.

### 6. Import starten

- Prüfen Sie, dass alle Pflichtfelder zugeordnet sind
- Klicken Sie auf **"Validieren & Import vorbereiten"**
- Bei Validierungsfehlern werden diese angezeigt
- Klicken Sie auf **"Import starten"**

### 7. Ergebnis prüfen

Nach dem Import sehen Sie:
- ✅ Anzahl erfolgreich importierter Fahrzeuge
- ❌ Anzahl fehlgeschlagener Importe
- 📋 Detailliertes Fehlerprotokoll (falls Fehler aufgetreten sind)

## Validierungsregeln

### Datentypen
- Kilometerstand, Leistung, Preise: **Zahlen**
- Erstzulassung: **Datum im Format YYYY-MM-DD**
- Treibstoff: **petrol, diesel, electric, hybrid, other**
- Getriebe: **manual, automatic**

### Pflichtfelder
Folgende Felder müssen ausgefüllt sein:
- Marke
- Modell
- Erstzulassung
- Kilometerstand
- Verkaufspreis

## Technische Details

### Verwendete Libraries
- **xlsx**: Excel-Dateien parsen
- **papaparse**: CSV-Dateien parsen

### Import-Prozess
1. **Datei-Parsing**: CSV/Excel wird in JSON konvertiert
2. **Auto-Mapping**: Spalten werden automatisch erkannt
3. **Validierung**: Daten werden auf Korrektheit geprüft
4. **Batch-Insert**: Fahrzeuge werden in Stapeln von 10 importiert
5. **Fehlerbehandlung**: Fehler werden erfasst und angezeigt

### Performance
- Import von 100 Fahrzeugen: ~10-15 Sekunden
- Maximale Dateigröße: Empfohlen < 5 MB
- Batch-Größe: 10 Fahrzeuge pro Batch

## Fehlerbehebung

### "Validierungsfehler gefunden"
- Prüfen Sie das Datumsformat (YYYY-MM-DD)
- Stellen Sie sicher, dass Zahlenfelder keine Texte enthalten
- Prüfen Sie, dass alle Pflichtfelder ausgefüllt sind

### "Treibstoff muss einer sein von: petrol, diesel, electric, hybrid, other"
- Verwenden Sie nur die erlaubten Werte
- Achten Sie auf korrekte Schreibweise (Kleinbuchstaben)

### "Datum muss Format YYYY-MM-DD haben"
- Korrektes Format: `2020-05-15`
- Falsches Format: `15.05.2020` oder `05/15/2020`

### Import schlägt fehl
- Prüfen Sie Ihre Datenbankverbindung
- Stellen Sie sicher, dass Sie die nötigen Berechtigungen haben
- Kontaktieren Sie den Support bei wiederholten Fehlern

## E2E-Tests

Tests befinden sich in: `e2e/vehicle-import.spec.ts`

Ausführen:
```bash
npx playwright test e2e/vehicle-import.spec.ts
```

Test-Coverage:
- ✅ Navigation zur Import-Seite
- ✅ CSV-Upload und Vorschau
- ✅ Auto-Mapping von Spalten
- ✅ Validierung von Pflichtfeldern
- ✅ Erfolgreicher Import
- ✅ Fortschrittsanzeige
- ✅ Fehlerbehandlung
- ✅ Dateitypvalidierung
- ✅ Zurück-Navigation

## Roadmap

Zukünftige Verbesserungen:
- [ ] Duplikatserkennung (VIN-Prüfung)
- [ ] Import-Historie mit Rollback-Funktion
- [ ] Template-Download im richtigen Format
- [ ] Bilder-Import via ZIP-Datei
- [ ] Excel-Export der aktuellen Fahrzeuge
- [ ] Validierung gegen externe Datenbanken (z.B. VIN-Decoder)
