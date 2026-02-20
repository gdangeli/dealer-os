# KI-Preisempfehlung – Konzept & Implementierungsplan

> **Stand:** Februar 2026  
> **Version:** 1.0  
> **Basis:** [AI-PRICING.md](./AI-PRICING.md) Research

---

## 1. User Story & Use Cases

### 1.1 Haupt-User-Story

> **Als Autohändler** möchte ich **sofort eine marktgerechte Preisempfehlung** für jedes Fahrzeug in meinem Bestand erhalten, **damit ich schneller verkaufe und meine Margen optimiere**.

### 1.2 Detaillierte User Stories

#### US-1: Sofortige Preisempfehlung bei Fahrzeugerfassung
```
Als Händler
möchte ich beim Erfassen eines neuen Fahrzeugs
sofort eine Preisempfehlung sehen,
damit ich den Verkaufspreis nicht manuell recherchieren muss.

Akzeptanzkriterien:
- [ ] Nach VIN-Eingabe erscheint Preisempfehlung innerhalb 3 Sekunden
- [ ] Empfehlung zeigt Preisspanne (Min/Optimal/Max)
- [ ] Quelle der Empfehlung ist sichtbar ("Powered by Eurotax")
- [ ] Ich kann den empfohlenen Preis mit einem Klick übernehmen
```

#### US-2: Preisanpassung für bestehende Fahrzeuge
```
Als Händler
möchte ich für Fahrzeuge mit langer Standzeit
eine aktualisierte Preisempfehlung erhalten,
damit ich weiss, ob ich den Preis senken sollte.

Akzeptanzkriterien:
- [ ] Fahrzeuge > 30 Tage Standzeit zeigen "Preis prüfen" Badge
- [ ] Ein Klick zeigt aktuelle Marktempfehlung
- [ ] System schlägt Preissenkung vor (% und Betrag)
- [ ] Ich kann die Änderung direkt ausführen
```

#### US-3: Einkaufsbewertung bei Ankauf
```
Als Händler
möchte ich vor dem Ankauf eines Fahrzeugs
wissen, was der Markt dafür zahlt,
damit ich einen profitablen Einkaufspreis verhandle.

Akzeptanzkriterien:
- [ ] "Fahrzeug bewerten" Button im Dashboard
- [ ] VIN + Kilometer = Einkaufswert-Empfehlung
- [ ] Zeigt erwartbare Marge bei verschiedenen Verkaufspreisen
- [ ] Berücksichtigt Zustand (optionale Eingabe)
```

#### US-4: Margenanalyse pro Fahrzeug
```
Als Händler
möchte ich sehen, wie mein Verkaufspreis
im Vergleich zur Empfehlung steht,
damit ich meine Preisstrategie optimiere.

Akzeptanzkriterien:
- [ ] Dashboard zeigt "Preis vs. Empfehlung" für alle Fahrzeuge
- [ ] Visuelle Warnung bei starken Abweichungen
- [ ] Filter: Überteuert / Unterteuert / Im Rahmen
```

### 1.3 Use Case Diagramm

```
┌────────────────────────────────────────────────────────────┐
│                         HÄNDLER                            │
└────────────────────────────────────────────────────────────┘
           │            │            │            │
           ▼            ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Fahrzeug │ │ Fahrzeug │ │ Bestand  │ │ Margen   │
    │ erfassen │ │ bewerten │ │ prüfen   │ │ analyse  │
    │ + Preis  │ │ (Ankauf) │ │ (Alerts) │ │          │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘
           │            │            │            │
           └────────────┴─────┬──────┴────────────┘
                              ▼
                    ┌──────────────────┐
                    │  PRICING SERVICE │
                    │   (Eurotax API)  │
                    └──────────────────┘
```

---

## 2. UI/UX Konzept

### 2.1 Touchpoints – Wo zeigen wir die Empfehlung?

```
DealerOS Oberfläche
│
├── 📊 Dashboard
│   └── Widget: "Preis-Check" (Fahrzeuge mit Abweichung)
│
├── 🚗 Fahrzeug-Liste
│   └── Spalte: "💡 Empfohlen" mit Vergleich
│
├── 🚙 Fahrzeug-Detail
│   ├── Sektion: Preisempfehlung (prominent)
│   └── Historie: Preisentwicklung
│
├── ➕ Fahrzeug erfassen (Modal)
│   └── Nach VIN-Eingabe: Empfehlung anzeigen
│
└── 📈 Analytics
    └── Report: "Pricing Performance"
```

### 2.2 Fahrzeug-Detail – Preisempfehlung-Sektion

```
┌─────────────────────────────────────────────────────────────┐
│  💡 Preisempfehlung                      powered by Eurotax │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     CHF 18'500          CHF 21'000         CHF 23'500│   │
│  │     Schnellverkauf       Optimal           Maximum   │   │
│  │         ●─────────────────●─────────────────●        │   │
│  │                          ▲                           │   │
│  │                    Ihr Preis: CHF 22'500             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📊 Marktvergleich:                                         │
│  • 12 ähnliche Fahrzeuge auf AutoScout24                   │
│  • Durchschnittspreis: CHF 21'200                          │
│  • Ihr Preis ist 6% über Durchschnitt                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Anpassungen anzeigen ▼                              │   │
│  │  • Zustand (4/5): +2%                                │   │
│  │  • Region Zürich: +3%                                │   │
│  │  • Sommer (Cabrio): +5%                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Preis übernehmen: CHF 21'000]   [Aktualisieren 🔄]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Fahrzeug-Erfassung – Inline-Empfehlung

```
┌────────────────────────────────────────────────────────────┐
│  Neues Fahrzeug erfassen                                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  VIN *                                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ WBA3C5C50EF1234567                           [📷]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ✅ Fahrzeug erkannt:                                       │
│  BMW 320i Touring, 2014, 135 kW, Benzin                    │
│                                                             │
│  Kilometerstand *                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 87'500 km                                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 💡 Empfohlener Verkaufspreis                        │    │
│  │                                                      │    │
│  │    CHF 18'500 - 21'000                              │    │
│  │                                                      │    │
│  │    Einkaufswert: ca. CHF 15'000 - 17'000            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Ihr Verkaufspreis *                                        │
│  ┌──────────────────────────────────┐                      │
│  │ CHF 19'900                       │  [💡 Übernehmen]     │
│  └──────────────────────────────────┘                      │
│                                                             │
│                              [Abbrechen]  [Speichern]       │
└────────────────────────────────────────────────────────────┘
```

### 2.4 Dashboard Widget – Preis-Check

```
┌──────────────────────────────────────────┐
│  💡 Preis-Check                     [→]  │
├──────────────────────────────────────────┤
│                                          │
│  ⚠️ 3 Fahrzeuge prüfen                   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ BMW 320i • 45 Tage Standzeit       │  │
│  │ Ihr Preis: CHF 22'500              │  │
│  │ Empfehlung: CHF 19'900 (-12%)      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ VW Golf • 60+ Tage                 │  │
│  │ Ihr Preis: CHF 15'900              │  │
│  │ Empfehlung: CHF 14'500 (-9%)       │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ✅ 12 Fahrzeuge im grünen Bereich      │
│                                          │
└──────────────────────────────────────────┘
```

### 2.5 Fahrzeug-Liste – Preis-Spalte

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Fahrzeuge                                            [+ Neu] [Filter] [⚙️]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Fahrzeug           │ Status    │ Ihr Preis   │ 💡 Empfohlen  │ Standzeit  │
├─────────────────────┼───────────┼─────────────┼───────────────┼────────────┤
│ BMW 320i Touring    │ 🟢 Aktiv  │ CHF 19'900  │ ✅ CHF 19'500 │ 12 Tage    │
│ VW Golf 7 GTI       │ 🟢 Aktiv  │ CHF 25'900  │ ⚠️ CHF 23'000 │ 45 Tage    │
│ Audi A4 Avant       │ 🟡 Reserv.│ CHF 32'500  │ ✅ CHF 31'000 │ 8 Tage     │
│ Mercedes C220d      │ 🟢 Aktiv  │ CHF 28'900  │ 🔴 CHF 24'500 │ 67 Tage    │
├─────────────────────┴───────────┴─────────────┴───────────────┴────────────┤
│ Legende: ✅ ±5% │ ⚠️ 5-15% │ 🔴 >15% Abweichung                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Datenfluss-Diagramm

### 3.1 Preisempfehlung abrufen (Hauptflow)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           PREISEMPFEHLUNG FLOW                           │
└──────────────────────────────────────────────────────────────────────────┘

     ┌─────────────┐
     │   Browser   │
     │  (Next.js)  │
     └──────┬──────┘
            │ 1. Request: VIN + km + PLZ
            ▼
     ┌─────────────┐
     │   Next.js   │
     │  API Route  │
     │ /api/pricing│
     └──────┬──────┘
            │ 2. Check Cache
            ▼
     ┌─────────────┐  Cache Hit?
     │  Supabase   │─────────────┐
     │   Cache     │             │
     └──────┬──────┘             │
            │ Cache Miss         │
            ▼                    │
     ┌─────────────┐             │
     │  Eurotax    │             │
     │    API      │             │
     └──────┬──────┘             │
            │ 3. Raw Valuation   │
            ▼                    │
     ┌─────────────┐             │
     │ Adjustment  │             │
     │   Logic     │◀────────────┘
     └──────┬──────┘
            │ 4. Apply:
            │    - Zustand
            │    - Region
            │    - Saisonalität
            ▼
     ┌─────────────┐
     │   Format    │
     │  Response   │
     └──────┬──────┘
            │ 5. PricingResult
            ▼
     ┌─────────────┐
     │   Browser   │
     │  (Display)  │
     └─────────────┘
```

### 3.2 Datenmodell

```sql
-- Neue Tabellen für Pricing

-- Cache für Eurotax-Bewertungen
CREATE TABLE pricing_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) NOT NULL,
    mileage INTEGER NOT NULL,
    
    -- Eurotax Rohdaten
    eurotax_purchase_min INTEGER,
    eurotax_purchase_max INTEGER,
    eurotax_retail_min INTEGER,
    eurotax_retail_max INTEGER,
    
    -- Fahrzeugdaten (von Eurotax)
    brand VARCHAR(50),
    model VARCHAR(100),
    variant VARCHAR(200),
    first_registration DATE,
    fuel_type VARCHAR(20),
    power_kw INTEGER,
    
    -- Metadata
    fetched_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
    
    UNIQUE(vin, mileage)
);

-- Eigene Verkaufsdaten für ML (Zukunft)
CREATE TABLE pricing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID REFERENCES dealers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    
    -- Zum Zeitpunkt des Verkaufs
    vin VARCHAR(17),
    mileage INTEGER,
    condition_rating INTEGER, -- 1-5
    postal_code VARCHAR(10),
    
    -- Preise
    purchase_price INTEGER,
    listed_price INTEGER,
    final_sale_price INTEGER,
    eurotax_recommendation INTEGER, -- Was hatte Eurotax empfohlen?
    
    -- Timing
    listed_at TIMESTAMP,
    sold_at TIMESTAMP,
    days_on_lot INTEGER,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index für Analytics
CREATE INDEX idx_pricing_history_sold 
    ON pricing_history(sold_at) 
    WHERE sold_at IS NOT NULL;
```

### 3.3 Sequence Diagram – Fahrzeugerfassung

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Händler│     │Frontend│     │API Route│    │ Cache  │     │Eurotax │
└───┬────┘     └───┬────┘     └────┬────┘    └───┬────┘     └───┬────┘
    │              │               │             │              │
    │ VIN eingeben │               │             │              │
    │─────────────▶│               │             │              │
    │              │               │             │              │
    │              │ GET /api/pricing/vin        │              │
    │              │───────────────▶             │              │
    │              │               │             │              │
    │              │               │ Check cache │              │
    │              │               │────────────▶│              │
    │              │               │             │              │
    │              │               │ Cache Miss  │              │
    │              │               │◀────────────│              │
    │              │               │             │              │
    │              │               │ GET /valuate│              │
    │              │               │─────────────────────────▶ │
    │              │               │             │              │
    │              │               │ Valuation   │              │
    │              │               │◀─────────────────────────  │
    │              │               │             │              │
    │              │               │ Save cache  │              │
    │              │               │────────────▶│              │
    │              │               │             │              │
    │              │ PricingResult │             │              │
    │              │◀──────────────│             │              │
    │              │               │             │              │
    │ Empfehlung   │               │             │              │
    │◀─────────────│               │             │              │
    │              │               │             │              │
    │ Preis über-  │               │             │              │
    │ nehmen       │               │             │              │
    │─────────────▶│               │             │              │
    │              │               │             │              │
```

---

## 4. API-Design

### 4.1 Endpoints

```yaml
# Pricing API Endpoints

# 1. Preisempfehlung abrufen
GET /api/pricing/valuation
  Query:
    - vin: string (required)
    - mileage: number (required)
    - condition: 1-5 (optional, default: 3)
    - postal_code: string (optional)
  Response:
    - 200: PricingResult
    - 400: Validation Error
    - 503: Eurotax unavailable

# 2. VIN-Lookup (nur Fahrzeugdaten)
GET /api/pricing/vehicle
  Query:
    - vin: string (required)
  Response:
    - 200: VehicleInfo
    - 404: VIN not found

# 3. Preishistorie speichern (nach Verkauf)
POST /api/pricing/history
  Body:
    - vehicle_id: uuid
    - final_sale_price: number
    - sold_at: timestamp
  Response:
    - 201: Created

# 4. Bulk-Preisempfehlung (für Liste)
POST /api/pricing/bulk
  Body:
    - vehicles: Array<{vin, mileage, condition}>
  Response:
    - 200: Array<PricingResult>
```

### 4.2 Response Types

```typescript
// TypeScript Definitions

interface PricingResult {
  // Basis-Empfehlung
  vehicleInfo: VehicleInfo;
  
  // Eurotax Rohdaten
  eurotax: {
    purchaseMin: number;  // Händler-Einkauf min
    purchaseMax: number;  // Händler-Einkauf max
    retailMin: number;    // Händler-Verkauf min
    retailMax: number;    // Händler-Verkauf max
    fetchedAt: string;    // ISO timestamp
  };
  
  // Adjustierte Empfehlung
  recommendation: {
    quickSale: number;    // Schnellverkauf (-10%)
    optimal: number;      // Optimaler Preis
    maximum: number;      // Maximale Marge (+10%)
    
    purchaseValue: number; // Empf. Einkaufspreis
  };
  
  // Anpassungen (transparent)
  adjustments: Adjustment[];
  
  // Meta
  confidence: 'high' | 'medium' | 'low';
  source: 'eurotax' | 'cached' | 'fallback';
  validUntil: string;    // ISO timestamp
}

interface VehicleInfo {
  vin: string;
  brand: string;
  model: string;
  variant: string;
  firstRegistration: string;  // YYYY-MM
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
  powerKw: number;
  transmission: 'manual' | 'automatic';
}

interface Adjustment {
  factor: string;        // z.B. "condition", "region", "season"
  label: string;         // z.B. "Zustand (4/5)"
  percentage: number;    // z.B. +2 oder -5
  reason: string;        // z.B. "Überdurchschnittlicher Zustand"
}
```

### 4.3 Fehlerbehandlung

```typescript
// Error Responses

interface PricingError {
  code: string;
  message: string;
  details?: object;
}

// Mögliche Fehler
const ERRORS = {
  INVALID_VIN: {
    code: 'INVALID_VIN',
    message: 'Die VIN ist ungültig oder nicht erkannt.',
  },
  EUROTAX_UNAVAILABLE: {
    code: 'EUROTAX_UNAVAILABLE', 
    message: 'Preisempfehlung momentan nicht verfügbar. Bitte später versuchen.',
  },
  VEHICLE_NOT_FOUND: {
    code: 'VEHICLE_NOT_FOUND',
    message: 'Fahrzeug konnte nicht identifiziert werden.',
  },
  RATE_LIMIT: {
    code: 'RATE_LIMIT',
    message: 'Zu viele Anfragen. Bitte warten.',
  },
};
```

---

## 5. Implementierungs-Phasen

### Phase 1: MVP (4-6 Wochen)

**Ziel:** Grundlegende Preisempfehlung mit Eurotax

```
Woche 1-2: Setup & Integration
├── Eurotax API Vertrag abschliessen
├── API-Wrapper entwickeln
├── Caching-Layer implementieren
└── VIN-Lookup testen

Woche 3-4: UI Integration
├── Fahrzeug-Detail Sektion
├── Fahrzeug-Erfassung Integration
├── Preis-Übernahme Button
└── Error States

Woche 5-6: Testing & Launch
├── Unit Tests für Pricing-Logic
├── E2E Tests für UI
├── Beta mit 2-3 Händlern
└── Dokumentation
```

**Deliverables:**
- [ ] `/api/pricing/valuation` Endpoint
- [ ] `/api/pricing/vehicle` Endpoint
- [ ] Preisempfehlung in Fahrzeug-Detail
- [ ] Inline-Empfehlung bei Erfassung
- [ ] 24h Cache für Bewertungen

---

### Phase 2: Adjustments & Analytics (6-8 Wochen)

**Ziel:** Intelligente Anpassungen, Dashboard-Widget

```
Woche 1-2: Adjustment-Logic
├── Zustands-Faktor implementieren
├── Regions-Faktor (PLZ → Zone)
├── Saisonalitäts-Faktor
└── Adjustment-Display im UI

Woche 3-4: Dashboard Integration
├── Preis-Check Widget
├── Fahrzeug-Liste Spalte
├── Alerts für Langsteher
└── Bulk-Pricing für Liste

Woche 5-6: Datensammlung
├── pricing_history Tabelle
├── Nach-Verkauf-Erfassung
├── Analytics-Grundlagen
└── Export-Funktion

Woche 7-8: Polish
├── Performance-Optimierung
├── Erweiterte Filter
├── Benutzer-Feedback einarbeiten
└── Dokumentation updaten
```

**Deliverables:**
- [ ] Adjustment-System (Zustand, Region, Saison)
- [ ] Dashboard Widget "Preis-Check"
- [ ] Preis-Spalte in Fahrzeugliste
- [ ] Datenerfassung nach Verkauf
- [ ] `/api/pricing/bulk` Endpoint

---

### Phase 3: Eigene Daten & ML-Vorbereitung (Ongoing)

**Ziel:** Daten sammeln, erste eigene Analysen

```
Monat 1-3:
├── Verkaufsdaten akkumulieren
├── Erste Reports (Avg. Marge, Standzeit vs. Preis)
├── A/B: Empfehlung befolgt vs. ignoriert
└── Dashboard: "Pricing Performance"

Monat 4-6:
├── Analyse: Wo weicht Eurotax ab?
├── Eigene Adjustments verfeinern
├── ML-Experimente (offline)
└── Confidence-Scores einführen
```

**Deliverables:**
- [ ] Analytics Dashboard für Pricing
- [ ] Report: "Empfehlung vs. Realität"
- [ ] Verfeinerte Adjustments
- [ ] 1'000+ Datenpunkte gesammelt

---

### Phase 4: Hybrid ML (12+ Monate)

**Ziel:** Eigenes Modell als Ergänzung/Fallback

```
Bei genug Daten (5'000+ Verkäufe):
├── Eigenes XGBoost-Modell trainieren
├── A/B Test: Eurotax vs. Eigen
├── Hybrid: Eigen + Eurotax Blend
└── Entscheidung: Weiterer Weg
```

**Mögliche Outcomes:**
1. **Eurotax bleibt besser** → Weiter Hybrid, eigene Adjustments
2. **Eigen ist besser** → Eurotax als Fallback, eigenes Modell primär
3. **Blend ist besser** → Gewichtetes Ensemble

---

## 6. Technische Spezifikationen

### 6.1 Tech Stack Erweiterung

```yaml
# Neue Dependencies

Backend:
  - Eurotax SDK (oder REST client)
  - node-cache (in-memory für Rate Limiting)

Database:
  - Neue Tabellen: pricing_cache, pricing_history
  - Indizes für Analytics

Frontend:
  - Neue Komponenten:
    - PricingCard
    - PricingSlider (Min/Opt/Max)
    - AdjustmentList
    - PricingWidget (Dashboard)
```

### 6.2 Eurotax Integration (Pseudo-Code)

```typescript
// lib/eurotax/client.ts

import { createClient } from '@supabase/supabase-js';

const EUROTAX_BASE_URL = process.env.EUROTAX_API_URL;
const EUROTAX_API_KEY = process.env.EUROTAX_API_KEY;

interface EurotaxValuationRequest {
  vin: string;
  mileage: number;
  country: 'CH';
  currency: 'CHF';
}

interface EurotaxValuationResponse {
  vehicle: {
    brand: string;
    model: string;
    variant: string;
    firstRegistration: string;
    fuelType: string;
    powerKw: number;
  };
  valuation: {
    purchaseMin: number;
    purchaseMax: number;
    retailMin: number;
    retailMax: number;
  };
  timestamp: string;
}

export async function getEurotaxValuation(
  request: EurotaxValuationRequest
): Promise<EurotaxValuationResponse> {
  
  // 1. Check Cache first
  const cached = await getCachedValuation(request.vin, request.mileage);
  if (cached && !isExpired(cached.expiresAt)) {
    return cached.data;
  }
  
  // 2. Call Eurotax API
  const response = await fetch(`${EUROTAX_BASE_URL}/valuate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EUROTAX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new EurotaxError(response.status, await response.text());
  }
  
  const data = await response.json();
  
  // 3. Cache result
  await cacheValuation(request.vin, request.mileage, data);
  
  return data;
}
```

### 6.3 Adjustment-Engine

```typescript
// lib/pricing/adjustments.ts

interface AdjustmentContext {
  vehicleType: string;      // 'sedan', 'suv', 'cabrio', etc.
  condition: 1 | 2 | 3 | 4 | 5;
  postalCode: string;
  currentMonth: number;
}

interface AdjustmentResult {
  factor: string;
  label: string;
  percentage: number;
  reason: string;
}

export function calculateAdjustments(
  basePrice: number,
  context: AdjustmentContext
): AdjustmentResult[] {
  const adjustments: AdjustmentResult[] = [];
  
  // 1. Zustand
  const conditionAdj = getConditionAdjustment(context.condition);
  if (conditionAdj !== 0) {
    adjustments.push({
      factor: 'condition',
      label: `Zustand (${context.condition}/5)`,
      percentage: conditionAdj,
      reason: context.condition > 3 
        ? 'Überdurchschnittlicher Zustand'
        : 'Unterdurchschnittlicher Zustand',
    });
  }
  
  // 2. Region
  const regionAdj = getRegionAdjustment(context.postalCode);
  if (regionAdj !== 0) {
    adjustments.push({
      factor: 'region',
      label: getRegionName(context.postalCode),
      percentage: regionAdj,
      reason: regionAdj > 0 
        ? 'Premiummarkt'
        : 'Preissensitiver Markt',
    });
  }
  
  // 3. Saisonalität
  const seasonAdj = getSeasonalAdjustment(
    context.vehicleType, 
    context.currentMonth
  );
  if (seasonAdj !== 0) {
    adjustments.push({
      factor: 'season',
      label: getSeasonLabel(context.currentMonth),
      percentage: seasonAdj,
      reason: seasonAdj > 0
        ? 'Hohe Nachfrage für diesen Fahrzeugtyp'
        : 'Niedrigere Nachfrage in dieser Saison',
    });
  }
  
  return adjustments;
}

function getConditionAdjustment(condition: number): number {
  const map = { 1: -10, 2: -5, 3: 0, 4: +3, 5: +5 };
  return map[condition] ?? 0;
}

function getRegionAdjustment(postalCode: string): number {
  const prefix = postalCode.substring(0, 2);
  
  // Premium-Regionen
  if (['80', '81', '82'].includes(prefix)) return +5;  // Zürich
  if (['12', '12'].includes(prefix)) return +5;       // Genf
  
  // Durchschnitt
  if (['40', '41', '30', '31'].includes(prefix)) return 0; // Basel, Bern
  
  // Günstigere Regionen
  if (['65', '66', '39'].includes(prefix)) return -3; // Tessin, Wallis
  
  return 0;
}

function getSeasonalAdjustment(
  vehicleType: string, 
  month: number
): number {
  if (vehicleType === 'cabrio') {
    if ([3, 4, 5, 6].includes(month)) return +10; // Frühling/Sommer
    if ([10, 11, 12, 1].includes(month)) return -10; // Herbst/Winter
  }
  
  if (vehicleType === 'suv' || vehicleType === '4x4') {
    if ([9, 10, 11].includes(month)) return +5; // Vor Winter
    if ([4, 5].includes(month)) return -3; // Nach Winter
  }
  
  return 0;
}
```

---

## 7. Erfolgsmetriken

### 7.1 KPIs für das Pricing-Feature

| Metrik | Baseline | Ziel (6 Mt) | Ziel (12 Mt) |
|--------|----------|-------------|--------------|
| Adoption Rate | 0% | 50% | 80% |
| Empfehlung befolgt | - | 40% | 60% |
| Avg. Standzeit | 45 Tage | 38 Tage | 32 Tage |
| Avg. Marge | ? | +2% | +5% |
| API-Calls/Tag | 0 | 50 | 200 |

### 7.2 Tracking

```typescript
// Events für Analytics

// Beim Abrufen einer Empfehlung
analytics.track('pricing_recommendation_viewed', {
  vehicleId,
  eurotaxPrice,
  userPrice,
  priceDifference,
});

// Bei Preisübernahme
analytics.track('pricing_recommendation_applied', {
  vehicleId,
  oldPrice,
  newPrice,
  recommendedPrice,
});

// Bei Verkauf
analytics.track('vehicle_sold', {
  vehicleId,
  finalPrice,
  recommendedPrice,
  daysOnLot,
  followedRecommendation: boolean,
});
```

---

## 8. Risiken & Mitigationen

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| Händler ignorieren Empfehlung | Hoch | Gamification, Erfolgsgeschichten zeigen |
| Falsche Preise → Vertrauensverlust | Mittel | Disclaimer, "powered by Eurotax", Feedback-Loop |
| Eurotax API Downtime | Gering | 24h Cache, Graceful Degradation |
| Hohe API-Kosten | Mittel | Caching, Rate Limiting, Bulk-Requests |
| Datenschutz-Bedenken | Gering | Nur anonymisierte Daten für ML |

---

## 9. Offene Fragen

1. **Eurotax Konditionen:** Genaue API-Preise noch zu klären
2. **MVP Scope:** Alle 4 Touchpoints oder nur Fahrzeug-Detail?
3. **Confidence Display:** Zeigen wir "low confidence" oder verstecken?
4. **Multi-Dealer Analytics:** Dürfen wir Daten über Händler hinweg nutzen?
5. **White-Label:** Eurotax-Branding pflicht oder optional?

---

## 10. Nächste Schritte

### Sofort (Diese Woche)
- [ ] Eurotax kontaktieren → Demo anfordern
- [ ] API-Dokumentation anfordern
- [ ] Kosten klären

### Nach Eurotax-Gespräch
- [ ] Vertrag verhandeln
- [ ] API-Zugang einrichten
- [ ] Entwicklung starten

### Parallel
- [ ] UI-Wireframes finalisieren
- [ ] DB-Migrationen vorbereiten
- [ ] Beta-Tester identifizieren

---

## Anhang

### A. Mockups (Referenz)

Siehe Figma: `[Link einfügen]`

### B. API-Dokumentation

Wird nach Eurotax-Onboarding ergänzt.

### C. Eurotax Kontaktdaten

- Website: https://eurotax.ch
- Kontakt: https://eurotax.ch/kontakt/
- Produkte: https://eurotax.ch/produkt/das-neue-eurotax/
