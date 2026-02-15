export type VehicleStatus = 'in_stock' | 'reserved' | 'sold';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plugin_hybrid' | 'gas';

export type Transmission = 'manual' | 'automatic';

export interface Vehicle {
  id: string;
  dealer_id: string;
  
  // Basis-Infos
  brand: string;
  model: string;
  variant: string | null;
  
  // Technische Daten
  first_registration: string; // YYYY-MM Format
  mileage: number;
  fuel_type: FuelType;
  transmission: Transmission;
  color: string | null;
  vin: string | null;
  
  // Preise
  purchase_price: number | null;
  selling_price: number;
  
  // Beschreibungen
  description: string | null;
  internal_notes: string | null;
  
  // Status
  status: VehicleStatus;
  
  // Bild
  image_url: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface VehicleFormData {
  brand: string;
  model: string;
  variant: string;
  first_registration: string;
  mileage: number;
  fuel_type: FuelType;
  transmission: Transmission;
  color: string;
  vin: string;
  purchase_price: number | null;
  selling_price: number;
  description: string;
  internal_notes: string;
  status: VehicleStatus;
}

// Hilfsfunktionen für Labels
export const fuelTypeLabels: Record<FuelType, string> = {
  petrol: 'Benzin',
  diesel: 'Diesel',
  electric: 'Elektro',
  hybrid: 'Hybrid',
  plugin_hybrid: 'Plug-in Hybrid',
  gas: 'Gas (CNG/LPG)',
};

export const transmissionLabels: Record<Transmission, string> = {
  manual: 'Schaltgetriebe',
  automatic: 'Automatik',
};

export const statusLabels: Record<VehicleStatus, string> = {
  in_stock: 'An Lager',
  reserved: 'Reserviert',
  sold: 'Verkauft',
};

export const statusColors: Record<VehicleStatus, string> = {
  in_stock: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-slate-100 text-slate-800',
};
