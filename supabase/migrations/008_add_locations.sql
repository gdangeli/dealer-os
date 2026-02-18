-- Migration: Add Multi-Location Support
-- This migration adds support for multiple locations per dealer

-- ============================================================================
-- 1. Create locations table
-- ============================================================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_locations_dealer_id ON locations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_locations_is_main ON locations(dealer_id, is_main) WHERE is_main = true;

-- ============================================================================
-- 2. Add location_id to related tables (nullable for migration compatibility)
-- ============================================================================

-- Add location_id to vehicles
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_location_id ON vehicles(location_id);

-- Add location_id to leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_location_id ON leads(location_id);

-- Add location_id to customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customers_location_id ON customers(location_id);

-- ============================================================================
-- 3. Enable RLS for locations
-- ============================================================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Dealers can view their own locations" ON locations;
DROP POLICY IF EXISTS "Dealers can insert their own locations" ON locations;
DROP POLICY IF EXISTS "Dealers can update their own locations" ON locations;
DROP POLICY IF EXISTS "Dealers can delete their own locations" ON locations;

-- Policy: Dealers can view their own locations
CREATE POLICY "Dealers can view their own locations"
ON locations FOR SELECT
USING (
    dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
    )
);

-- Policy: Dealers can insert their own locations
CREATE POLICY "Dealers can insert their own locations"
ON locations FOR INSERT
WITH CHECK (
    dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
    )
);

-- Policy: Dealers can update their own locations
CREATE POLICY "Dealers can update their own locations"
ON locations FOR UPDATE
USING (
    dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
    )
);

-- Policy: Dealers can delete their own locations
CREATE POLICY "Dealers can delete their own locations"
ON locations FOR DELETE
USING (
    dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- 4. Function to ensure only one main location per dealer
-- ============================================================================
CREATE OR REPLACE FUNCTION ensure_single_main_location()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this location as main, unset all other main locations for this dealer
    IF NEW.is_main = true THEN
        UPDATE locations
        SET is_main = false, updated_at = NOW()
        WHERE dealer_id = NEW.dealer_id
        AND id != NEW.id
        AND is_main = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_ensure_single_main_location ON locations;

CREATE TRIGGER trigger_ensure_single_main_location
BEFORE INSERT OR UPDATE OF is_main ON locations
FOR EACH ROW
WHEN (NEW.is_main = true)
EXECUTE FUNCTION ensure_single_main_location();

-- ============================================================================
-- 5. Function to auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_locations_updated_at ON locations;

CREATE TRIGGER trigger_update_locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_locations_updated_at();

-- ============================================================================
-- 6. Function to create default main location from dealer data
-- ============================================================================
-- This can be run manually after migration to create default locations
-- from existing dealer address data:
--
-- INSERT INTO locations (dealer_id, name, address, postal_code, city, phone, email, is_main)
-- SELECT 
--     id as dealer_id,
--     company_name || ' - Hauptstandort' as name,
--     street as address,
--     zip as postal_code,
--     city,
--     phone,
--     email,
--     true as is_main
-- FROM dealers
-- WHERE NOT EXISTS (
--     SELECT 1 FROM locations WHERE locations.dealer_id = dealers.id
-- );

COMMENT ON TABLE locations IS 'Dealer locations/branches for multi-location support';
COMMENT ON COLUMN locations.is_main IS 'Whether this is the main/primary location for the dealer';
COMMENT ON COLUMN vehicles.location_id IS 'Optional: which location this vehicle is at';
COMMENT ON COLUMN leads.location_id IS 'Optional: which location this lead is assigned to';
COMMENT ON COLUMN customers.location_id IS 'Optional: which location this customer is assigned to';
