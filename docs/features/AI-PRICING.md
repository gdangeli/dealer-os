# KI-Preisempfehlung für DealerOS – Research & Analyse

> **Stand:** Februar 2026  
> **Autor:** AI/ML Research Team  
> **Status:** 📋 Research Complete – Feature ZURÜCKGESTELLT
> 
> ⚠️ **Hinweis:** Diese Dokumentation beschreibt einen MÖGLICHEN Implementierungsweg. 
> Das Feature wurde in der Roadmap nach hinten priorisiert. Diese Docs dienen als 
> Referenz für die zukünftige Implementierung.

---

## Executive Summary

Dieses Dokument analysiert die Möglichkeiten zur Implementierung einer KI-gestützten Preisempfehlung für DealerOS, fokussiert auf den Schweizer Gebrauchtwagenmarkt. Es evaluiert Datenquellen, technische Optionen und gibt eine MVP-Empfehlung für Schweizer KMU-Autohändler.

**Kernerkenntnisse:**
- Eurotax (JD Power) ist der de-facto Standard in der Schweiz mit API-Verfügbarkeit
- Eigene ML-Modelle erfordern 12-24 Monate Datensammlung für sinnvolle Ergebnisse
- **Empfehlung:** Hybrid-Ansatz mit Eurotax-API + eigener Anpassungslogik

---

## 1. Datenquellen für den Schweizer Markt

### 1.1 Eurotax (JD Power) ⭐ Primärquelle

**Was ist Eurotax?**
- Marktführer für Fahrzeugbewertungen in der Schweiz
- Teil der JD Power / Autovista Group
- Schweiz-spezifische Daten (nicht einfach DE-Werte übernommen)

**Produkte & APIs:**
| Produkt | Beschreibung | API verfügbar |
|---------|--------------|---------------|
| **Das neue Eurotax** | Web-App für Händler, LiveRetail Tagespreise | Ja (WebApp) |
| **AutovistaVALUATION** | Echtzeit-Gebrauchtwagenwerte | ✅ REST API |
| **AutovistaFORECAST** | Restwertprognosen (16 Alters-/km-Kombinationen) | ✅ REST API |
| **AutovistaSPEC** | Fahrzeugspezifikationen & Identifikation | ✅ REST API |
| **Datenlösungen** | Bulk-Datenfeeds für Integration | ✅ Datenfeeds |

**Preismodell:**
- Pay-per-Use API oder monatliche Flatrate
- Typisch CHF 200-500/Monat für KMU-Händler (Web-App)
- API-Lizenz: Individuell, ab ca. CHF 500/Monat

**Vorteile:**
- ✅ Marktführer, hohe Datenqualität
- ✅ Schweiz-spezifisch (Währung, Markt, Ausstattungen)
- ✅ 97%+ Fahrzeugabdeckung
- ✅ VIN-basierte Identifikation
- ✅ Bereits bei vielen CH-Händlern etabliert

**Nachteile:**
- ❌ Nicht kostenlos – laufende Lizenzkosten
- ❌ Abhängigkeit von Drittanbieter
- ❌ Preise sind "Durchschnitt", keine lokale Micro-Optimierung

**API-Kontakt:** https://eurotax.ch/kontakt/

---

### 1.2 AutoScout24 Schweiz – Marktdaten

**Was bietet AutoScout24?**
- Grösste Fahrzeugplattform der Schweiz (~150'000 Inserate)
- **Keine öffentliche API** für Preisdaten
- Händler-Portal mit Statistiken für eigene Inserate

**Datenzugang-Optionen:**
| Methode | Machbarkeit | Legalität |
|---------|-------------|-----------|
| Web Scraping | Technisch möglich | ⚠️ Gegen AGB, rechtlich riskant |
| Offizielle Partnerschaft | Unwahrscheinlich | ✅ Wenn verfügbar |
| Manuelle Marktbeobachtung | Zeitaufwändig | ✅ Legal |

**Realistische Nutzung:**
- AutoScout24-Daten sind in Eurotax LiveRetail indirekt enthalten
- Eigene Inserate-Performance via AS24-Händlerportal
- Wettbewerbsanalyse manuell oder via Eurotax

---

### 1.3 mobile.de (DE-Markt als Referenz)

**Relevanz für CH-Markt:**
- DE-Preise sind ~10-20% niedriger als CH (Steuern, Markt)
- Nützlich für: Import-Fahrzeuge, seltene Modelle, Trends
- **Keine API** für externe Partner

**Nutzung:**
- Eurotax bietet europäische Vergleichsdaten
- Manueller Vergleich für Nischenfahrzeuge

---

### 1.4 DAT (Deutsche Automobil Treuhand)

**Was ist DAT?**
- Deutscher Marktführer für Fahrzeugbewertung
- Schwerpunkt: Deutschland, weniger CH-relevant
- Produkte: SilverDAT, DAT Report

**Für DealerOS:**
- ❌ Nicht primär für Schweiz geeignet
- ✅ Interessant für deutsche Fahrzeug-Importe
- API vorhanden, aber CH-Fokus fehlt

---

### 1.5 Schwacke (Deutschland)

**Relation zu Eurotax:**
- Schwacke = Eurotax für Deutschland (gleicher Konzern: Autovista Group)
- Identische Technologie, andere Marktdaten
- Für CH nicht relevant, ausser bei DE-Imports

---

### 1.6 Eigene historische Verkaufsdaten ⭐ Langfristig wichtig

**Was können wir sammeln?**
```
Für jedes verkaufte Fahrzeug:
├── Fahrzeugdaten (Marke, Modell, Variante, Baujahr, km)
├── Einkaufspreis
├── Inserierter Verkaufspreis
├── Finaler Verkaufspreis (nach Verhandlung)
├── Standzeit in Tagen
├── Anzahl Anfragen
├── Verkaufskanal
└── Standort/Region
```

**Mindestdatenmenge für ML:**
- **Sinnvoller Start:** 500-1'000 verkaufte Fahrzeuge
- **Gute Basis:** 5'000+ Fahrzeuge
- **Robust:** 20'000+ Fahrzeuge

**Realität für DealerOS:**
- Kleine Händler verkaufen 50-200 Fahrzeuge/Jahr
- Mit 10 Händlern: 500-2'000 Fahrzeuge/Jahr möglich
- **Timeline:** 12-24 Monate für nutzbare Datenbasis

---

### 1.7 Minimale Datenquellen für MVP

| Phase | Datenquelle | Kosten | Aufwand |
|-------|-------------|--------|---------|
| **MVP** | Eurotax API | ~CHF 500/Mt | Gering |
| **Phase 2** | + Eigene Verkaufsdaten | - | Mittel |
| **Phase 3** | + Marktanalyse (AS24 Stats) | - | Mittel |
| **Langfristig** | Eigenes ML-Modell | Entwicklung | Hoch |

---

## 2. Pricing-Faktoren

### 2.1 Primäre Faktoren (höchster Einfluss)

| Faktor | Gewichtung | Datenquelle |
|--------|------------|-------------|
| **Marke/Modell/Variante** | ~40% | VIN → Eurotax |
| **Kilometerstand** | ~25% | Händler-Eingabe |
| **Erstzulassung/Alter** | ~20% | VIN → Eurotax |
| **Motorisierung & Antrieb** | ~10% | VIN → Eurotax |

### 2.2 Sekundäre Faktoren (moderater Einfluss)

| Faktor | Gewichtung | Datenquelle |
|--------|------------|-------------|
| **Ausstattung** | 5-15% | VIN-Decode + manuell |
| **Zustand** | 5-10% | Händler-Eingabe (Skala) |
| **Servicehistorie** | 3-5% | Händler-Eingabe |
| **Anzahl Vorbesitzer** | 2-3% | Fahrzeugausweis |

### 2.3 Externe Faktoren (Feinabstimmung)

| Faktor | Einfluss | Erfassbar? |
|--------|----------|------------|
| **Standort (CH-Region)** | ±5% | PLZ → Region |
| **Saisonalität** | ±3-8% | Datum |
| **Markttrends** | ±5-10% | Eurotax Updates |
| **Farbe** | ±2-3% | Händler-Eingabe |
| **MFK-Status** | ±2% | Händler-Eingabe |

### 2.4 Standort-Faktoren Schweiz

```
Preisunterschiede nach Region (ca.):
├── Zürich/Genf:      +5-10% (Premiummarkt)
├── Basel/Bern:       Durchschnitt
├── Ostschweiz:       -3-5%
├── Tessin:           -5-10% (kleinerer Markt)
└── Wallis/Graubünden: -5% (saisonal)
```

### 2.5 Saisonalitäts-Matrix

| Fahrzeugtyp | Hochsaison | Tiefsaison | Schwankung |
|-------------|------------|------------|------------|
| Cabrio | März-Juni | Okt-Jan | ±15-20% |
| SUV/4x4 | Sept-Nov | April-Mai | ±5-10% |
| Familien-Van | Frühjahr | - | ±3-5% |
| Elektro | Ganzjährig | - | ±3% |
| Standard-PKW | Frühjahr/Herbst | Sommer | ±3-5% |

---

## 3. Technische Optionen

### 3.1 Option A: Externe API (Eurotax)

**Architektur:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DealerOS   │────▶│  API Layer  │────▶│  Eurotax    │
│  Frontend   │     │  (Cache)    │     │  API        │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   Supabase  │
                    │   (Cache)   │
                    └─────────────┘
```

**Implementierung:**
```typescript
// Vereinfachter API-Call
async function getEurotaxValuation(vin: string, km: number) {
  // 1. Cache prüfen (24h gültig)
  const cached = await getCachedValuation(vin, km);
  if (cached) return cached;
  
  // 2. Eurotax API aufrufen
  const response = await eurotaxApi.valuate({
    vin,
    mileage: km,
    country: 'CH',
    currency: 'CHF'
  });
  
  // 3. Cache speichern
  await cacheValuation(vin, km, response);
  
  return response;
}
```

**Pro:**
- ✅ Schnellste Time-to-Market (2-4 Wochen)
- ✅ Bewährte Datenqualität
- ✅ Keine ML-Expertise nötig
- ✅ Geringes technisches Risiko
- ✅ Sofort nutzbar, keine Datensammlung

**Contra:**
- ❌ Laufende Lizenzkosten (~CHF 500-1000/Mt)
- ❌ Abhängigkeit von Drittanbieter
- ❌ Begrenzte Anpassungsmöglichkeiten
- ❌ "Black Box" – keine Erklärbarkeit
- ❌ Kein Wettbewerbsvorteil (alle nutzen gleiche Daten)

**Geschätzte Kosten:**
| Posten | Einmalig | Monatlich |
|--------|----------|-----------|
| Eurotax API Setup | CHF 1'000 | - |
| API-Lizenz | - | CHF 500-1'000 |
| Entwicklung | CHF 5'000-10'000 | - |
| **Total Jahr 1** | | **~CHF 16'000-22'000** |

---

### 3.2 Option B: Eigenes ML-Modell

**Architektur:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DealerOS   │────▶│  Pricing    │────▶│  ML Model   │
│  Frontend   │     │  Service    │     │  (Python)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                    ┌──────▼──────┐     ┌──────▼──────┐
                    │   Supabase  │     │  Training   │
                    │   (Data)    │◀────│  Pipeline   │
                    └─────────────┘     └─────────────┘
```

**ML-Stack:**
```python
# Beispiel-Modell
import xgboost as xgb

features = [
    'brand_encoded',      # One-hot encoded
    'model_encoded',      # One-hot encoded
    'year',               # Numeric
    'mileage',            # Numeric
    'fuel_type_encoded',  # One-hot encoded
    'transmission',       # Binary
    'power_kw',           # Numeric
    'region_encoded',     # One-hot encoded
    'month',              # Seasonal
    'equipment_score',    # Aggregated
]

model = xgb.XGBRegressor(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.05,
    objective='reg:squarederror'
)
```

**Pro:**
- ✅ Keine laufenden Lizenzkosten
- ✅ Volle Kontrolle & Anpassbarkeit
- ✅ Potentieller Wettbewerbsvorteil
- ✅ Explainability möglich (SHAP values)
- ✅ Lernt aus eigenen Verkaufsdaten

**Contra:**
- ❌ 12-24 Monate Datensammlung nötig
- ❌ ML-Expertise erforderlich
- ❌ Höheres technisches Risiko
- ❌ Cold-Start-Problem (wenig Daten = schlechte Vorhersagen)
- ❌ Ongoing Maintenance (Retraining, Drift-Detection)

**Mindestdaten für brauchbares Modell:**
| Metriken | Minimum | Optimal |
|----------|---------|---------|
| Verkaufte Fahrzeuge | 1'000 | 10'000+ |
| Zeitraum | 6 Monate | 24+ Monate |
| Marken-Abdeckung | 5+ | 20+ |
| Regionen | 3+ | Alle CH |

**Geschätzte Kosten:**
| Posten | Einmalig | Monatlich |
|--------|----------|-----------|
| ML-Entwicklung | CHF 30'000-50'000 | - |
| Infrastruktur | - | CHF 200-500 |
| Data Engineering | CHF 10'000-20'000 | - |
| Maintenance | - | CHF 1'000-2'000 |
| **Total Jahr 1** | | **~CHF 55'000-85'000** |

---

### 3.3 Option C: Hybrid (Eurotax + Eigene Anpassungen) ⭐ EMPFEHLUNG

**Architektur:**
```
┌─────────────┐     ┌─────────────────────┐     ┌─────────────┐
│  DealerOS   │────▶│  Pricing Service    │────▶│  Eurotax    │
│  Frontend   │     │                     │     │  API        │
└─────────────┘     │  ┌───────────────┐  │     └─────────────┘
                    │  │ Adjustment    │  │
                    │  │ Logic         │  │
                    │  └───────────────┘  │
                    │         │           │
                    │  ┌──────▼──────┐    │
                    │  │ Own Data    │    │
                    │  │ Analytics   │    │
                    │  └─────────────┘    │
                    └─────────────────────┘
```

**Adjustment-Logik:**
```typescript
interface PricingResult {
  eurotaxBase: number;          // Eurotax Bewertung
  adjustments: {
    condition: number;          // ±5% basierend auf Zustand
    region: number;             // ±5% basierend auf PLZ
    seasonality: number;        // ±8% basierend auf Datum/Typ
    standtime: number;          // Empfehlung zur Preissenkung
    ownData: number;            // Basierend auf eigenen Verkäufen
  };
  recommendedPrice: number;     // Finale Empfehlung
  priceRange: {
    min: number;                // Schnellverkauf
    optimal: number;            // Balance
    max: number;                // Maximale Marge
  };
  confidence: 'high' | 'medium' | 'low';
}
```

**Phasen-Plan:**
```
Phase 1 (MVP):
├── Eurotax API Integration
├── Basis-Adjustments (Zustand, Region)
└── Caching & Display

Phase 2 (6 Monate):
├── Sammlung eigener Verkaufsdaten
├── Saisonalitäts-Logik
└── Standzeit-basierte Empfehlungen

Phase 3 (12 Monate):
├── Analyse eigener Daten
├── Modell für Adjustments trainieren
└── Confidence-Scores

Phase 4 (24+ Monate):
├── Optional: Eigenes ML-Modell als Fallback
├── A/B-Testing Eurotax vs. eigenes Modell
└── Entscheidung: Eigenes Modell oder weiter Hybrid
```

**Pro:**
- ✅ Schneller MVP (Eurotax-Basis)
- ✅ Flexibilität für Anpassungen
- ✅ Eigene Daten können fliessen
- ✅ Mittleres Risiko
- ✅ Skalierbarer Ansatz
- ✅ Erklärbarer Output

**Contra:**
- ❌ Noch Lizenzkosten
- ❌ Komplexere Architektur
- ❌ Zwei Systeme zu pflegen

**Geschätzte Kosten:**
| Posten | Einmalig | Monatlich |
|--------|----------|-----------|
| Eurotax API Setup | CHF 1'000 | - |
| API-Lizenz | - | CHF 500-1'000 |
| Entwicklung Phase 1 | CHF 8'000-15'000 | - |
| Entwicklung Phase 2-3 | CHF 15'000-25'000 | - |
| Laufende Entwicklung | - | CHF 500-1'000 |
| **Total Jahr 1** | | **~CHF 25'000-45'000** |

---

### 3.4 Vergleichsmatrix

| Kriterium | Option A (API) | Option B (ML) | Option C (Hybrid) |
|-----------|----------------|---------------|-------------------|
| Time-to-Market | ⭐⭐⭐ 2-4 Wo | ⭐ 12-24 Mt | ⭐⭐⭐ 4-8 Wo |
| Kosten Jahr 1 | ⭐⭐ ~20k CHF | ⭐ ~70k CHF | ⭐⭐ ~35k CHF |
| Datenqualität | ⭐⭐⭐ | ⭐ (anfangs) | ⭐⭐⭐ |
| Flexibilität | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| Wettbewerbsvorteil | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| Technisches Risiko | ⭐⭐⭐ Gering | ⭐ Hoch | ⭐⭐ Mittel |
| Skalierbarkeit | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

**Empfehlung:** Option C (Hybrid) für DealerOS

---

## 4. Wettbewerber-Analyse

### 4.1 vAuto Provision (USA)

**Markt:** USA, 20+ Jahre Marktpräsenz

**Kernfunktionen:**
- Live Market Data für alle Fahrzeuge
- VIN-Scan → sofortige Bewertung
- Wettbewerbsanalyse (gleiche Fahrzeuge im Umkreis)
- Standzeit-Tracking mit Preisempfehlungen
- Velocity-Methode: Schneller Umschlag > Maximale Marge

**Was wir lernen können:**
- ✅ VIN-zentrierter Workflow (scannen → bewerten → listen)
- ✅ Live-Marktdaten als Kernfeature
- ✅ Standzeit als Trigger für Preisänderungen
- ✅ Wettbewerbs-Overlay ("5 gleiche Fahrzeuge im Umkreis")
- ✅ "Days Supply" Metrik (Wie lange würde aktueller Bestand reichen?)

**Nicht übertragbar:**
- Basiert auf riesigem US-Markt mit Millionen Datenpunkten
- Tight Integration mit Cox Automotive Ökosystem
- Pricing ab $500/Monat – für Schweizer KMU zu teuer

---

### 4.2 Selly Automotive (DACH)

**Status:** Konnte keine aktive Plattform "Selly Automotive" für den DACH-Markt finden. Möglicherweise gemeint:

**Alternativen im DACH-Raum:**
- **Seelly.de** – Nicht existent / offline
- **Selly.io** – E-Commerce für digitale Produkte (nicht Automotive)
- **TCS Auto-Bewertung** – Für Endkunden, nicht Händler

---

### 4.3 Schweizer Markt – Was existiert?

| Anbieter | Fokus | Zielgruppe | Preisempfehlung? |
|----------|-------|------------|------------------|
| **Eurotax** | Bewertung & Prognosen | Händler, Leasing | ✅ Ja |
| **AutoScout24** | Marktplatz | Alle | ❌ Nur Statistiken |
| **Comparis** | Preisvergleich | Endkunden | ⚠️ Rudimentär |
| **TCS Autokauf** | Beratung | Endkunden | ⚠️ Basic |
| **car4you (AXA)** | Marktplatz | Alle | ❌ Nein |

**Erkenntnis:** Es gibt keine DealerOS-ähnliche Lösung mit integrierter KI-Preisempfehlung für Schweizer Händler. Das ist eine Marktlücke.

---

### 4.4 Was der CH-Markt braucht (Gap-Analyse)

| Feature | vAuto | Eurotax | DealerOS (heute) | DealerOS (Ziel) |
|---------|-------|---------|------------------|-----------------|
| Fahrzeugverwaltung | ⚠️ | ❌ | ✅ | ✅ |
| Preisempfehlung | ✅ | ✅ | ❌ | ✅ |
| Standzeit-Alerts | ✅ | ⚠️ | ✅ | ✅ |
| Wettbewerbsanalyse | ✅ | ✅ | ❌ | ⚠️ |
| Inserate-Publishing | ⚠️ | ❌ | ✅ | ✅ |
| CRM/Leads | ⚠️ | ❌ | ✅ | ✅ |
| CH-optimiert | ❌ | ✅ | ✅ | ✅ |
| KMU-Preis | ❌ | ⚠️ | ✅ | ✅ |

**Unique Selling Point:**
> DealerOS = Einzige Schweizer Lösung, die Fahrzeugverwaltung, CRM, Publishing UND KI-Preisempfehlung in einer bezahlbaren Plattform vereint.

---

## 5. MVP-Empfehlung

### 5.1 Schnellster Weg zum MVP

**Timeline:** 4-6 Wochen

**Scope:**
```
MVP Features:
├── Eurotax API Integration
│   ├── VIN-basierte Fahrzeugidentifikation
│   ├── Kilometerstand-Eingabe
│   └── Bewertungs-Abruf (Einkauf + Verkauf)
│
├── Basis-Adjustments
│   ├── Zustands-Faktor (Skala 1-5)
│   └── Regions-Faktor (PLZ → Preiszone)
│
├── Display
│   ├── Preisempfehlung in Fahrzeug-Detail
│   ├── Preisspanne (Min/Optimal/Max)
│   └── "Empfohlen von Eurotax" Badge
│
└── Caching
    └── Bewertungen 24h cachen (Kosten sparen)
```

### 5.2 Minimale Daten für MVP

**Vom Händler:**
- VIN (17-stellig)
- Aktueller Kilometerstand
- Zustandsbewertung (1-5 Sterne oder Dropdown)
- PLZ des Standorts

**Von Eurotax:**
- Fahrzeugidentifikation (Marke, Modell, Baujahr, Motorisierung)
- Einkaufswert ("Händler-Ankauf")
- Verkaufswert ("Händler-Verkauf")
- Optional: Ausstattungsliste

### 5.3 Build vs. Buy Entscheidung

| Frage | Antwort |
|-------|---------|
| Haben wir genug Daten für eigenes ML? | ❌ Nein (0 Verkaufsdaten) |
| Haben wir ML-Expertise im Team? | ❌ Nein |
| Ist Time-to-Market kritisch? | ✅ Ja (Roadmap Q3-Q4 2026) |
| Ist Budget für Eigenentwicklung da? | ⚠️ Begrenzt |
| Gibt es einen etablierten Anbieter? | ✅ Ja (Eurotax) |

**Entscheidung:** 🛒 **BUY** (Eurotax API) für MVP

**Begründung:**
1. Kein Cold-Start-Problem
2. Sofort nutzbar
3. Vertrauenswürdige Quelle ("powered by Eurotax")
4. Risikominimierung
5. Daten sammeln für spätere Eigenentwicklung

### 5.4 Langfristiger Plan

```
2026 Q3: MVP mit Eurotax API
         └── Datensammlung beginnt

2026 Q4: Adjustments & Analytics
         └── Eigene Verkaufsdaten analysieren

2027 Q1: Erweiterte Adjustments
         └── Saisonalität, Standzeit-Logik

2027 Q2: ML-Experimente
         └── Erstes eigenes Modell trainieren

2027 H2: Hybrid-Entscheidung
         └── Eurotax als Fallback, eigenes Modell testen

2028+: Potentiell eigenes Modell
         └── Falls genug Daten und bessere Performance
```

---

## 6. Kosten-Zusammenfassung

### MVP-Budget (Phase 1)

| Posten | Einmalig | Monatlich |
|--------|----------|-----------|
| Eurotax API Setup & Lizenz | CHF 1'000 | CHF 500-800 |
| Entwicklung (4-6 Wochen) | CHF 8'000-12'000 | - |
| Testing & QA | CHF 2'000 | - |
| **Total MVP** | **CHF 11'000-15'000** | **CHF 500-800** |

### Jahr 1 (inkl. Phase 2)

| Posten | Total |
|--------|-------|
| MVP Entwicklung | CHF 15'000 |
| Phase 2 Entwicklung | CHF 10'000-15'000 |
| Eurotax Lizenz (12 Mt) | CHF 6'000-10'000 |
| Infrastruktur | CHF 1'000 |
| **Gesamt Jahr 1** | **CHF 32'000-41'000** |

---

## 7. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Eurotax erhöht Preise | Mittel | Hoch | Vertrag mit Preis-Cap, eigene Daten sammeln |
| API nicht verfügbar/langsam | Gering | Hoch | 24h Cache, Fallback-Werte |
| Händler misstrauen KI | Mittel | Mittel | "Powered by Eurotax" Branding, Erklärungen |
| Falsche Preise schaden Ruf | Gering | Hoch | Conservative Defaults, Clear Disclaimer |
| Eurotax beendet API | Sehr gering | Sehr hoch | Alternatives API evaluieren (DAT), eigene Daten |

---

## 8. Nächste Schritte

1. **Eurotax kontaktieren** – Demo & API-Preise anfragen
2. **API-Dokumentation** – Technische Machbarkeit prüfen
3. **UI/UX Design** – Wireframes für Preisempfehlung
4. **Entwicklung starten** – Nach Vertragsabschluss
5. **Beta-Test** – Mit 2-3 Pilot-Händlern

---

## Anhang

### A. Eurotax Kontakt

- Website: https://eurotax.ch
- Sales: https://eurotax.ch/kontakt/
- Produkte: https://eurotax.ch/produkt/

### B. Relevante Links

- [Eurotax "Das neue Eurotax"](https://eurotax.ch/produkt/das-neue-eurotax/)
- [Eurotax API-Lösungen](https://eurotax.ch/produkt/datenloesungen/)
- [vAuto Provision](https://www.vauto.com/products/provision/)
- [DAT Deutschland](https://www.dat.de/)
- [Schwacke (DE)](https://schwacke.de/)

### C. Glossar

| Begriff | Erklärung |
|---------|-----------|
| **VIN** | Vehicle Identification Number (17-stellig) |
| **NatCode** | Nationale Fahrzeug-Kodierung (Eurotax) |
| **LiveRetail** | Eurotax Echtzeit-Marktpreise |
| **Standzeit** | Tage seit Fahrzeug im Bestand |
| **Velocity** | Umschlagsgeschwindigkeit des Inventars |
| **Cold Start** | ML-Problem bei fehlenden Trainingsdaten |
