// Types für E-Mail-Templates

export type EmailTemplateCategory = 
  | 'greeting'        // Begrüssung / Erstkontakt
  | 'test_drive'      // Probefahrt-Bestätigung
  | 'price_inquiry'   // Preisanfrage-Antwort
  | 'followup'        // Nachfass-E-Mail
  | 'rejection'       // Absage (höflich)
  | 'custom';         // Benutzerdefiniert

export interface EmailTemplate {
  id: string;
  dealer_id: string;
  name: string;
  category: EmailTemplateCategory;
  description: string | null;
  subject: string;
  body: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateCreate {
  name: string;
  category: EmailTemplateCategory;
  description?: string;
  subject: string;
  body: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface EmailTemplateUpdate {
  name?: string;
  category?: EmailTemplateCategory;
  description?: string;
  subject?: string;
  body?: string;
  is_active?: boolean;
  is_default?: boolean;
}

// Labels für Kategorien (Deutsch)
export const templateCategoryLabels: Record<EmailTemplateCategory, string> = {
  greeting: 'Erstkontakt',
  test_drive: 'Probefahrt',
  price_inquiry: 'Preisanfrage',
  followup: 'Nachfassen',
  rejection: 'Absage',
  custom: 'Benutzerdefiniert',
};

// Icons für Kategorien (Emoji)
export const templateCategoryIcons: Record<EmailTemplateCategory, string> = {
  greeting: '👋',
  test_drive: '🚗',
  price_inquiry: '💰',
  followup: '📞',
  rejection: '🙏',
  custom: '✏️',
};

// Farben für Kategorien
export const templateCategoryColors: Record<EmailTemplateCategory, string> = {
  greeting: 'bg-blue-100 text-blue-800',
  test_drive: 'bg-green-100 text-green-800',
  price_inquiry: 'bg-yellow-100 text-yellow-800',
  followup: 'bg-purple-100 text-purple-800',
  rejection: 'bg-red-100 text-red-800',
  custom: 'bg-slate-100 text-slate-800',
};

// Verfügbare Platzhalter mit Beschreibungen
export interface PlaceholderInfo {
  key: string;
  label: string;
  example: string;
}

export const availablePlaceholders: PlaceholderInfo[] = [
  // Kunde
  { key: '{{kunde_name}}', label: 'Vollständiger Kundenname', example: 'Max Mustermann' },
  { key: '{{kunde_vorname}}', label: 'Vorname', example: 'Max' },
  { key: '{{kunde_nachname}}', label: 'Nachname', example: 'Mustermann' },
  { key: '{{kunde_email}}', label: 'E-Mail-Adresse', example: 'max@example.com' },
  
  // Fahrzeug
  { key: '{{fahrzeug}}', label: 'Fahrzeug (Marke + Modell)', example: 'BMW 320i' },
  { key: '{{fahrzeug_marke}}', label: 'Marke', example: 'BMW' },
  { key: '{{fahrzeug_modell}}', label: 'Modell', example: '320i' },
  { key: '{{fahrzeug_jahrgang}}', label: 'Jahrgang', example: '2021' },
  { key: '{{preis}}', label: 'Preis (formatiert)', example: 'CHF 35\'000' },
  
  // Händler
  { key: '{{haendler_name}}', label: 'Händler/Garage Name', example: 'Auto Müller AG' },
  { key: '{{haendler_telefon}}', label: 'Telefonnummer', example: '+41 44 123 45 67' },
  { key: '{{haendler_email}}', label: 'E-Mail', example: 'info@automueller.ch' },
  
  // Datum/Zeit
  { key: '{{datum}}', label: 'Datum', example: '15.03.2024' },
  { key: '{{uhrzeit}}', label: 'Uhrzeit', example: '14:00 Uhr' },
];

// Kontext-Daten für Platzhalter-Ersetzung
export interface TemplateContext {
  // Kunde
  kunde_name?: string;
  kunde_vorname?: string;
  kunde_nachname?: string;
  kunde_email?: string;
  
  // Fahrzeug
  fahrzeug?: string;
  fahrzeug_marke?: string;
  fahrzeug_modell?: string;
  fahrzeug_jahrgang?: string;
  preis?: string;
  
  // Händler
  haendler_name?: string;
  haendler_telefon?: string;
  haendler_email?: string;
  
  // Datum/Zeit
  datum?: string;
  uhrzeit?: string;
}

// Funktion zum Ersetzen von Platzhaltern
export function replacePlaceholders(template: string, context: TemplateContext): string {
  let result = template;
  
  // Alle bekannten Platzhalter durchgehen
  for (const placeholder of availablePlaceholders) {
    const key = placeholder.key.replace('{{', '').replace('}}', '');
    const value = context[key as keyof TemplateContext] || '';
    result = result.replace(new RegExp(placeholder.key.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  
  return result;
}

// Funktion zum Extrahieren verwendeter Platzhalter aus einem Template
export function extractPlaceholders(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = template.match(regex) || [];
  return [...new Set(matches)];
}
