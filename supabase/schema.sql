-- Dealer OS Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEALERS (Händler / Garagen)
-- ============================================
CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Auth
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Company Info
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Address
  street TEXT,
  zip TEXT,
  city TEXT,
  country TEXT DEFAULT 'CH',
  
  -- Business
  vehicle_count_estimate INT,
  subscription_plan TEXT DEFAULT 'beta', -- beta, starter, pro, business
  
  -- Status
  status TEXT DEFAULT 'pending' -- pending, active, suspended
);

-- ============================================
-- VEHICLES (Fahrzeuge)
-- ============================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  make TEXT NOT NULL,           -- BMW, VW, Audi...
  model TEXT NOT NULL,          -- 320d, Golf, A4...
  variant TEXT,                 -- Touring, GTI, Avant...
  
  -- Details
  first_registration DATE,
  mileage INT,                  -- km
  fuel_type TEXT,               -- petrol, diesel, electric, hybrid
  transmission TEXT,            -- manual, automatic
  power_kw INT,
  color TEXT,
  
  -- Pricing
  purchase_price DECIMAL(10,2), -- Einkaufspreis
  asking_price DECIMAL(10,2),   -- Verkaufspreis
  ai_suggested_price DECIMAL(10,2),
  
  -- Status
  status TEXT DEFAULT 'in_stock', -- in_stock, reserved, sold
  
  -- Dates
  acquired_at DATE DEFAULT CURRENT_DATE,
  sold_at DATE,
  
  -- VIN
  vin TEXT,
  
  -- Description
  description TEXT,
  internal_notes TEXT
);

-- ============================================
-- VEHICLE_IMAGES
-- ============================================
CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position INT DEFAULT 0,       -- Sort order
  is_main BOOLEAN DEFAULT FALSE
);

-- ============================================
-- LISTINGS (Inserate auf Plattformen)
-- ============================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  
  platform TEXT NOT NULL,       -- autoscout24, tutti, facebook, mobile_de
  external_id TEXT,             -- ID auf der Plattform
  url TEXT,                     -- Link zum Inserat
  
  status TEXT DEFAULT 'draft',  -- draft, active, paused, expired, sold
  
  -- Stats
  views INT DEFAULT 0,
  inquiries INT DEFAULT 0,
  
  -- Sync
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT
);

-- ============================================
-- LEADS (Kundenanfragen)
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  
  -- Contact Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Source
  source TEXT,                  -- autoscout24, tutti, website, phone, walkin
  
  -- Message
  message TEXT,
  
  -- Status
  status TEXT DEFAULT 'new',    -- new, contacted, qualified, won, lost
  
  -- Follow-up
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_vehicles_dealer ON vehicles(dealer_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_listings_vehicle ON listings(vehicle_id);
CREATE INDEX idx_listings_platform ON listings(platform);
CREATE INDEX idx_leads_dealer ON leads(dealer_id);
CREATE INDEX idx_leads_status ON leads(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Dealers: Users can only see their own dealer profile
CREATE POLICY "Users can view own dealer" ON dealers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own dealer" ON dealers
  FOR UPDATE USING (auth.uid() = user_id);

-- Vehicles: Users can only access vehicles of their dealer
CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own vehicles" ON vehicles
  FOR INSERT WITH CHECK (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own vehicles" ON vehicles
  FOR UPDATE USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own vehicles" ON vehicles
  FOR DELETE USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
  );

-- Similar policies for other tables
CREATE POLICY "Users can manage own vehicle images" ON vehicle_images
  FOR ALL USING (
    vehicle_id IN (
      SELECT v.id FROM vehicles v 
      JOIN dealers d ON v.dealer_id = d.id 
      WHERE d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own listings" ON listings
  FOR ALL USING (
    vehicle_id IN (
      SELECT v.id FROM vehicles v 
      JOIN dealers d ON v.dealer_id = d.id 
      WHERE d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own leads" ON leads
  FOR ALL USING (
    dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run in Supabase Dashboard > Storage:
-- Create bucket: vehicle-images (public)
