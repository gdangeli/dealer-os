export type VehicleStatus = 'in_stock' | 'reserved' | 'sold';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plugin_hybrid' | 'gas';

export type Transmission = 'manual' | 'automatic';

export interface Vehicle {
  id: string;
  dealer_id: string;
  
  // Basis-Infos
  make: string;
  model: string;
  variant: string | null;
  
  // Technische Daten
  first_registration: string | null; // DATE
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  power_kw: number | null;
  color: string | null;
  vin: string | null;
  
  // Preise
  purchase_price: number | null;
  asking_price: number | null;
  ai_suggested_price: number | null;
  
  // Beschreibungen
  description: string | null;
  internal_notes: string | null;
  
  // Status
  status: VehicleStatus;
  
  // Dates
  acquired_at: string | null;
  sold_at: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface VehicleFormData {
  make: string;
  model: string;
  variant: string;
  first_registration: string;
  mileage: number;
  fuel_type: FuelType;
  transmission: Transmission;
  power_kw: number | null;
  color: string;
  vin: string;
  purchase_price: number | null;
  asking_price: number;
  description: string;
  internal_notes: string;
  status: VehicleStatus;
}

// Hilfsfunktionen für Labels
export const fuelTypeLabels: Record<FuelType, string> = {
  petrol: 'Benzin',
  diesel: 'Diesel',
  electric: 'Elektro',
  hybrid: 'Hybrid (Voll)',
  plugin_hybrid: 'Plug-in Hybrid',
  gas: 'Gas / CNG',
};

export const transmissionLabels: Record<Transmission, string> = {
  manual: 'Handschaltung',
  automatic: 'Automat',
};

export const statusLabels: Record<VehicleStatus, string> = {
  in_stock: 'Verfügbar',
  reserved: 'Reserviert',
  sold: 'Verkauft',
};

export const statusColors: Record<VehicleStatus, string> = {
  in_stock: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-slate-100 text-slate-800',
};
