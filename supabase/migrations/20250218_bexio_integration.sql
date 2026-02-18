-- Migration: Add Bexio integration fields to dealers table
-- This enables OAuth connection and data sync with Bexio

-- Add Bexio OAuth and connection fields
ALTER TABLE dealers
ADD COLUMN IF NOT EXISTS bexio_access_token TEXT,
ADD COLUMN IF NOT EXISTS bexio_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS bexio_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bexio_company_id INTEGER,
ADD COLUMN IF NOT EXISTS bexio_company_name TEXT,
ADD COLUMN IF NOT EXISTS bexio_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bexio_is_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bexio_last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bexio_last_error TEXT;

-- Add comments for documentation
COMMENT ON COLUMN dealers.bexio_access_token IS 'Encrypted Bexio OAuth access token';
COMMENT ON COLUMN dealers.bexio_refresh_token IS 'Encrypted Bexio OAuth refresh token';
COMMENT ON COLUMN dealers.bexio_token_expires_at IS 'When the current access token expires';
COMMENT ON COLUMN dealers.bexio_company_id IS 'Bexio company/organization ID';
COMMENT ON COLUMN dealers.bexio_company_name IS 'Bexio company name for display';
COMMENT ON COLUMN dealers.bexio_connected_at IS 'When the Bexio connection was established';
COMMENT ON COLUMN dealers.bexio_is_connected IS 'Whether dealer has active Bexio connection';
COMMENT ON COLUMN dealers.bexio_last_sync_at IS 'When the last sync was performed';
COMMENT ON COLUMN dealers.bexio_last_error IS 'Last sync error message (if any)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dealers_bexio_connected ON dealers(bexio_is_connected) WHERE bexio_is_connected = true;

-- Ensure customers table has Bexio fields (should already exist from billing.ts types)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS bexio_contact_id INTEGER,
ADD COLUMN IF NOT EXISTS bexio_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN customers.bexio_contact_id IS 'Corresponding Bexio contact ID';
COMMENT ON COLUMN customers.bexio_synced_at IS 'When customer was last synced to Bexio';

-- Ensure invoices table has Bexio fields (should already exist from billing.ts types)
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS bexio_invoice_id INTEGER,
ADD COLUMN IF NOT EXISTS bexio_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bexio_pdf_url TEXT;

COMMENT ON COLUMN invoices.bexio_invoice_id IS 'Corresponding Bexio invoice ID';
COMMENT ON COLUMN invoices.bexio_synced_at IS 'When invoice was last synced to Bexio';
COMMENT ON COLUMN invoices.bexio_pdf_url IS 'URL to Bexio-generated PDF';

-- Create index for finding unsynced records
CREATE INDEX IF NOT EXISTS idx_customers_bexio_unsynced ON customers(dealer_id) WHERE bexio_contact_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_bexio_unsynced ON invoices(dealer_id) WHERE bexio_invoice_id IS NULL;
