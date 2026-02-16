export interface Dealer {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  street?: string;
  zip?: string;
  city?: string;
  country: string;
  vehicle_count_estimate?: number;
  subscription_plan: 'beta' | 'starter' | 'pro' | 'business' | 'enterprise';
  status: 'pending' | 'active' | 'suspended';
  onboarding_completed: boolean;
  // Stripe subscription fields
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'paused' | null;
  subscription_period_end?: string;
}

export interface Vehicle {
  id: string;
  created_at: string;
  updated_at: string;
  dealer_id: string;
  make: string;
  model: string;
  variant?: string;
  first_registration?: string;
  mileage?: number;
  fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
  transmission?: 'manual' | 'automatic';
  power_kw?: number;
  color?: string;
  purchase_price?: number;
  asking_price?: number;
  ai_suggested_price?: number;
  status: 'in_stock' | 'reserved' | 'sold';
  acquired_at: string;
  sold_at?: string;
  vin?: string;
  description?: string;
  internal_notes?: string;
}

export interface VehicleImage {
  id: string;
  created_at: string;
  vehicle_id: string;
  storage_path: string;
  url: string;
  position: number;
  is_main: boolean;
}

export interface Listing {
  id: string;
  created_at: string;
  updated_at: string;
  vehicle_id: string;
  platform: 'autoscout24' | 'tutti' | 'facebook' | 'mobile_de' | 'website';
  external_id?: string;
  url?: string;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'sold';
  views: number;
  inquiries: number;
  last_synced_at?: string;
  sync_error?: string;
}

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  dealer_id: string;
  vehicle_id?: string;
  listing_id?: string;
  name: string;
  email?: string;
  phone?: string;
  source?: 'autoscout24' | 'tutti' | 'website' | 'phone' | 'walkin' | 'other';
  message?: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  last_contact_at?: string;
  next_followup_at?: string;
  notes?: string;
  // Joined data
  vehicles?: {
    make: string;
    model: string;
  };
}
