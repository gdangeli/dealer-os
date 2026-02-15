export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type LeadSource = 'website' | 'autoscout24' | 'mobile.de' | 'walkin' | 'phone' | 'other';

export interface Lead {
  id: string;
  dealer_id: string;
  vehicle_id: string | null;
  
  // Kontaktdaten
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  
  // Lead Info
  message: string | null;
  source: LeadSource;
  status: LeadStatus;
  
  // Follow-up
  next_followup: string | null;
  notes: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Joined data
  vehicle?: {
    id: string;
    make: string;
    model: string;
    first_registration: string;
    asking_price: number;
  };
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: 'Offen',
  contacted: 'In Bearbeitung',
  qualified: 'Heiss 🔥',
  won: 'Verkauft ✓',
  lost: 'Nicht gekauft',
};

export const leadStatusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export const leadSourceLabels: Record<LeadSource, string> = {
  website: 'Eigene Website',
  autoscout24: 'AutoScout24',
  'mobile.de': 'mobile.de',
  walkin: 'Vor Ort',
  phone: 'Telefonisch',
  other: 'Andere',
};
