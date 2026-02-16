/**
 * Lead Scoring System für DealerOS
 * 
 * Score-Berechnung (0-100 Punkte):
 * - Quelle: 0-20 Punkte (Website/Portale höher als Walk-in/Telefon)
 * - Aktivität: 0-25 Punkte (mehr Aktivitäten = höherer Score)
 * - Reaktionszeit: 0-20 Punkte (schnelle erste Reaktion = höher)
 * - Fahrzeugwert: 0-20 Punkte (teurere Autos = höher)
 * - Frische: 0-15 Punkte (neuere Anfragen = höher)
 */

import { Lead, LeadSource } from "@/types/leads";

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: string;
  created_at: string;
}

export interface LeadScoreBreakdown {
  source: number;
  activity: number;
  responseTime: number;
  vehicleValue: number;
  freshness: number;
  total: number;
}

export interface LeadWithScore extends Lead {
  score: number;
  scoreBreakdown?: LeadScoreBreakdown;
  activities?: LeadActivity[];
}

// Quelle-Gewichtung (0-20 Punkte)
const SOURCE_SCORES: Record<LeadSource, number> = {
  website: 20,        // Eigene Website = höchste Qualität
  autoscout24: 18,    // Portal-Leads sind qualifiziert
  "mobile.de": 18,
  walkin: 12,         // Vor Ort = mittleres Interesse
  phone: 10,          // Telefonisch = oft unqualifiziert
  other: 8,
};

/**
 * Berechnet den Score basierend auf der Lead-Quelle
 */
function calculateSourceScore(source: LeadSource): number {
  return SOURCE_SCORES[source] ?? 8;
}

/**
 * Berechnet den Score basierend auf Aktivitäten (0-25 Punkte)
 * Mehr Interaktionen = höherer Score
 */
function calculateActivityScore(activities: LeadActivity[]): number {
  const count = activities.length;
  
  if (count === 0) return 0;
  if (count === 1) return 5;
  if (count === 2) return 10;
  if (count <= 4) return 15;
  if (count <= 6) return 20;
  return 25; // 7+ Aktivitäten = Maximum
}

/**
 * Berechnet den Score basierend auf Reaktionszeit (0-20 Punkte)
 * Schnelle erste Reaktion nach Anfrage = höher
 */
function calculateResponseTimeScore(
  createdAt: string, 
  activities: LeadActivity[]
): number {
  // Wenn keine Aktivitäten, dann noch keine Reaktion
  if (activities.length === 0) return 0;

  // Finde die erste Aktivität (nach Erstellung)
  const leadCreated = new Date(createdAt).getTime();
  const firstActivity = activities
    .map(a => new Date(a.created_at).getTime())
    .filter(time => time > leadCreated)
    .sort((a, b) => a - b)[0];

  if (!firstActivity) return 10; // Aktivität vor Lead? Gib Basis-Punkte

  const responseHours = (firstActivity - leadCreated) / (1000 * 60 * 60);

  // Schnelle Reaktion wird belohnt
  if (responseHours <= 1) return 20;    // Innerhalb 1 Stunde
  if (responseHours <= 4) return 16;    // Innerhalb 4 Stunden
  if (responseHours <= 24) return 12;   // Innerhalb 1 Tag
  if (responseHours <= 48) return 8;    // Innerhalb 2 Tage
  if (responseHours <= 72) return 4;    // Innerhalb 3 Tage
  return 2;                              // Länger als 3 Tage
}

/**
 * Berechnet den Score basierend auf Fahrzeugwert (0-20 Punkte)
 * Teurere Fahrzeuge = höherer Score
 */
function calculateVehicleValueScore(price: number | undefined | null): number {
  if (!price || price <= 0) return 5; // Kein Fahrzeug zugeordnet = Basis

  // Schweizer Markt - CHF
  if (price >= 100000) return 20;  // Luxus
  if (price >= 60000) return 18;   // Premium
  if (price >= 40000) return 15;   // Gehoben
  if (price >= 25000) return 12;   // Mittelklasse
  if (price >= 15000) return 10;   // Einstieg
  if (price >= 8000) return 7;     // Budget
  return 5;                         // Sehr günstig
}

/**
 * Berechnet den Frische-Score (0-15 Punkte)
 * Neuere Anfragen = höherer Score
 */
function calculateFreshnessScore(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceCreation <= 1) return 15;   // Heute
  if (daysSinceCreation <= 3) return 13;   // Letzte 3 Tage
  if (daysSinceCreation <= 7) return 10;   // Diese Woche
  if (daysSinceCreation <= 14) return 7;   // Letzte 2 Wochen
  if (daysSinceCreation <= 30) return 4;   // Letzter Monat
  return 2;                                 // Älter als 1 Monat
}

/**
 * Berechnet den gesamten Lead-Score
 */
export function calculateLeadScore(
  lead: Lead,
  activities: LeadActivity[] = []
): LeadScoreBreakdown {
  const source = calculateSourceScore(lead.source);
  const activity = calculateActivityScore(activities);
  const responseTime = calculateResponseTimeScore(lead.created_at, activities);
  const vehicleValue = calculateVehicleValueScore(lead.vehicle?.asking_price);
  const freshness = calculateFreshnessScore(lead.created_at);

  const total = source + activity + responseTime + vehicleValue + freshness;

  return {
    source,
    activity,
    responseTime,
    vehicleValue,
    freshness,
    total,
  };
}

/**
 * Score-Label für Anzeige
 */
export function getScoreLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) {
    return { label: "Sehr Hoch", color: "bg-green-500 text-white", emoji: "🔥" };
  }
  if (score >= 60) {
    return { label: "Hoch", color: "bg-green-100 text-green-800", emoji: "⬆️" };
  }
  if (score >= 40) {
    return { label: "Mittel", color: "bg-yellow-100 text-yellow-800", emoji: "➡️" };
  }
  if (score >= 20) {
    return { label: "Niedrig", color: "bg-orange-100 text-orange-800", emoji: "⬇️" };
  }
  return { label: "Sehr Niedrig", color: "bg-red-100 text-red-800", emoji: "❄️" };
}

/**
 * Score-Breakdown Labels für Tooltip/Details
 */
export const SCORE_BREAKDOWN_LABELS: Record<keyof Omit<LeadScoreBreakdown, "total">, { label: string; max: number }> = {
  source: { label: "Quelle", max: 20 },
  activity: { label: "Aktivität", max: 25 },
  responseTime: { label: "Reaktionszeit", max: 20 },
  vehicleValue: { label: "Fahrzeugwert", max: 20 },
  freshness: { label: "Frische", max: 15 },
};
