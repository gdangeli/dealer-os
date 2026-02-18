export type EmailTemplateCategory = 
  | 'greeting' 
  | 'test_drive' 
  | 'price_inquiry' 
  | 'followup' 
  | 'rejection' 
  | 'custom';

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

export const categoryLabels: Record<EmailTemplateCategory, string> = {
  greeting: 'Erstkontakt',
  test_drive: 'Probefahrt',
  price_inquiry: 'Preisanfrage',
  followup: 'Nachfassen',
  rejection: 'Absage',
  custom: 'Benutzerdefiniert',
};

export const categoryIcons: Record<EmailTemplateCategory, string> = {
  greeting: '👋',
  test_drive: '🚗',
  price_inquiry: '💰',
  followup: '🔄',
  rejection: '❌',
  custom: '✏️',
};

export const categoryColors: Record<EmailTemplateCategory, string> = {
  greeting: 'bg-blue-100 text-blue-800',
  test_drive: 'bg-green-100 text-green-800',
  price_inquiry: 'bg-yellow-100 text-yellow-800',
  followup: 'bg-purple-100 text-purple-800',
  rejection: 'bg-red-100 text-red-800',
  custom: 'bg-slate-100 text-slate-800',
};

// Verfügbare Platzhalter für Templates
export const templatePlaceholders = [
  { key: '{{kunde_vorname}}', label: 'Vorname', example: 'Max' },
  { key: '{{kunde_nachname}}', label: 'Nachname', example: 'Muster' },
  { key: '{{kunde_name}}', label: 'Voller Name', example: 'Max Muster' },
  { key: '{{fahrzeug}}', label: 'Fahrzeug', example: 'BMW 320d Touring' },
  { key: '{{fahrzeug_marke}}', label: 'Marke', example: 'BMW' },
  { key: '{{fahrzeug_modell}}', label: 'Modell', example: '320d Touring' },
  { key: '{{fahrzeug_jahrgang}}', label: 'Jahrgang', example: '2022' },
  { key: '{{preis}}', label: 'Preis', example: 'CHF 45\'900' },
  { key: '{{haendler_name}}', label: 'Händler Name', example: 'Auto Müller AG' },
  { key: '{{haendler_telefon}}', label: 'Händler Telefon', example: '+41 44 123 45 67' },
  { key: '{{haendler_email}}', label: 'Händler E-Mail', example: 'info@auto-mueller.ch' },
  { key: '{{datum}}', label: 'Datum', example: '18.02.2026' },
  { key: '{{uhrzeit}}', label: 'Uhrzeit', example: '14:30' },
];
