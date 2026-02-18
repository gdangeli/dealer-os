/**
 * Location Types for Multi-Location Support
 */

export interface Location {
  id: string;
  dealer_id: string;
  name: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationFormData {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  is_main: boolean;
}

export const emptyLocationFormData: LocationFormData = {
  name: '',
  address: '',
  postal_code: '',
  city: '',
  phone: '',
  email: '',
  is_main: false,
};

/**
 * Format location for display (e.g., in dropdowns)
 */
export function formatLocationDisplay(location: Location): string {
  const parts = [location.name];
  if (location.city) {
    parts.push(`(${location.city})`);
  }
  return parts.join(' ');
}

/**
 * Format full address
 */
export function formatLocationAddress(location: Location): string {
  const parts: string[] = [];
  
  if (location.address) {
    parts.push(location.address);
  }
  
  const cityLine: string[] = [];
  if (location.postal_code) {
    cityLine.push(location.postal_code);
  }
  if (location.city) {
    cityLine.push(location.city);
  }
  
  if (cityLine.length > 0) {
    parts.push(cityLine.join(' '));
  }
  
  return parts.join(', ');
}
