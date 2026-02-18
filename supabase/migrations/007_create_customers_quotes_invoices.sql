-- Migration: Customers, Quotes, and Invoices Module
-- DealerOS - Offerten- und Rechnungsmodul

-- ============================================
-- 1. CUSTOMERS TABLE
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  
  -- Customer Type
  customer_type TEXT NOT NULL DEFAULT 'private' CHECK (customer_type IN ('private', 'company')),
  
  -- Company (if customer_type = 'company')
  company_name TEXT,
  
  -- Personal Details
  salutation TEXT CHECK (salutation IN ('Herr', 'Frau', 'Firma', NULL)),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  
  -- Contact
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  -- Address
  street TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'CH',
  
  -- Bexio Sync
  bexio_contact_id INTEGER,
  bexio_synced_at TIMESTAMPTZ,
  
  -- Reference to original lead (if converted)
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_dealer ON customers(dealer_id);
CREATE INDEX idx_customers_email ON customers(dealer_id, email);
CREATE INDEX idx_customers_name ON customers(dealer_id, last_name, first_name);
CREATE INDEX idx_customers_bexio ON customers(bexio_contact_id) WHERE bexio_contact_id IS NOT NULL;

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view own customers" ON customers
  FOR SELECT USING (dealer_id = auth.uid());

CREATE POLICY "Dealers can create own customers" ON customers
  FOR INSERT WITH CHECK (dealer_id = auth.uid());

CREATE POLICY "Dealers can update own customers" ON customers
  FOR UPDATE USING (dealer_id = auth.uid());

CREATE POLICY "Dealers can delete own customers" ON customers
  FOR DELETE USING (dealer_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 2. QUOTES TABLE
-- ============================================

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  
  -- References
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Quote Number (auto-generated)
  quote_number TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',      -- Entwurf
    'sent',       -- Gesendet
    'viewed',     -- Vom Kunden angesehen
    'accepted',   -- Angenommen
    'rejected',   -- Abgelehnt
    'expired',    -- Abgelaufen
    'invoiced'    -- In Rechnung umgewandelt
  )),
  
  -- Validity
  valid_until DATE,
  
  -- Amounts (in Rappen/Cents for precision)
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  vat_rate NUMERIC(5,2) DEFAULT 8.1,
  vat_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  
  -- Trade-in
  trade_in_value INTEGER DEFAULT 0,
  trade_in_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  trade_in_description TEXT,
  
  -- Notes
  internal_notes TEXT,
  customer_notes TEXT,
  terms TEXT,
  
  -- Bexio Sync
  bexio_offer_id INTEGER,
  bexio_synced_at TIMESTAMPTZ,
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(dealer_id, quote_number, version)
);

-- Indexes
CREATE INDEX idx_quotes_dealer ON quotes(dealer_id);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(dealer_id, status);
CREATE INDEX idx_quotes_number ON quotes(dealer_id, quote_number);
CREATE INDEX idx_quotes_bexio ON quotes(bexio_offer_id) WHERE bexio_offer_id IS NOT NULL;

-- RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view own quotes" ON quotes
  FOR SELECT USING (dealer_id = auth.uid());

CREATE POLICY "Dealers can create own quotes" ON quotes
  FOR INSERT WITH CHECK (dealer_id = auth.uid());

CREATE POLICY "Dealers can update own quotes" ON quotes
  FOR UPDATE USING (dealer_id = auth.uid());

CREATE POLICY "Dealers can delete own quotes" ON quotes
  FOR DELETE USING (dealer_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 3. QUOTE ITEMS TABLE
-- ============================================

CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Position
  position INTEGER NOT NULL,
  
  -- Item Type
  item_type TEXT NOT NULL DEFAULT 'vehicle' CHECK (item_type IN (
    'vehicle',    -- Fahrzeug
    'accessory',  -- Zubehör
    'service',    -- Dienstleistung
    'warranty',   -- Garantie
    'discount',   -- Rabatt (negative)
    'other'       -- Sonstiges
  )),
  
  -- Description
  title TEXT NOT NULL,
  description TEXT,
  
  -- Amounts (in Rappen)
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total INTEGER NOT NULL,
  
  -- Optional vehicle reference
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX idx_quote_items_vehicle ON quote_items(vehicle_id) WHERE vehicle_id IS NOT NULL;

-- RLS (inherit from quotes via join)
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quote items follow quote access" ON quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quotes q WHERE q.id = quote_items.quote_id AND q.dealer_id = auth.uid()
    )
  );


-- ============================================
-- 4. INVOICES TABLE
-- ============================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  
  -- References
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  
  -- Invoice Number
  invoice_number TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',      -- Entwurf
    'sent',       -- Gesendet
    'paid',       -- Vollständig bezahlt
    'partial',    -- Teilweise bezahlt
    'overdue',    -- Überfällig
    'cancelled'   -- Storniert
  )),
  
  -- Dates
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Amounts (in Rappen)
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  trade_in_value INTEGER DEFAULT 0,
  vat_rate NUMERIC(5,2) DEFAULT 8.1,
  vat_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  paid_amount INTEGER DEFAULT 0,
  
  -- Payment
  payment_terms TEXT,
  payment_reference TEXT,
  
  -- Bexio Sync
  bexio_invoice_id INTEGER,
  bexio_synced_at TIMESTAMPTZ,
  bexio_pdf_url TEXT,
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(dealer_id, invoice_number)
);

-- Indexes
CREATE INDEX idx_invoices_dealer ON invoices(dealer_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(dealer_id, status);
CREATE INDEX idx_invoices_quote ON invoices(quote_id) WHERE quote_id IS NOT NULL;
CREATE INDEX idx_invoices_bexio ON invoices(bexio_invoice_id) WHERE bexio_invoice_id IS NOT NULL;
CREATE INDEX idx_invoices_due ON invoices(dealer_id, due_date) WHERE status IN ('sent', 'partial');

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view own invoices" ON invoices
  FOR SELECT USING (dealer_id = auth.uid());

CREATE POLICY "Dealers can create own invoices" ON invoices
  FOR INSERT WITH CHECK (dealer_id = auth.uid());

CREATE POLICY "Dealers can update own invoices" ON invoices
  FOR UPDATE USING (dealer_id = auth.uid());

CREATE POLICY "Dealers can delete own invoices" ON invoices
  FOR DELETE USING (dealer_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 5. INVOICE ITEMS TABLE
-- ============================================

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  position INTEGER NOT NULL,
  
  item_type TEXT NOT NULL DEFAULT 'vehicle' CHECK (item_type IN (
    'vehicle', 'accessory', 'service', 'warranty', 'discount', 'other'
  )),
  
  title TEXT NOT NULL,
  description TEXT,
  
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total INTEGER NOT NULL,
  
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoice items follow invoice access" ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = invoice_items.invoice_id AND i.dealer_id = auth.uid()
    )
  );


-- ============================================
-- 6. PAYMENTS TABLE (for partial payments)
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount INTEGER NOT NULL, -- in Rappen
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN (
    'bank_transfer', 'cash', 'card', 'twint', 'other'
  )),
  
  -- Reference
  reference TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments follow invoice access" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = payments.invoice_id AND i.dealer_id = auth.uid()
    )
  );


-- ============================================
-- 7. BEXIO CONNECTIONS TABLE
-- ============================================

CREATE TABLE bexio_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL UNIQUE REFERENCES dealers(id) ON DELETE CASCADE,
  
  -- OAuth Tokens (should be encrypted in production!)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Bexio Account Info
  bexio_company_id INTEGER,
  bexio_company_name TEXT,
  
  -- Sync Settings
  auto_sync_customers BOOLEAN DEFAULT true,
  auto_sync_quotes BOOLEAN DEFAULT false,
  auto_sync_invoices BOOLEAN DEFAULT true,
  default_vat_rate NUMERIC(5,2) DEFAULT 8.1,
  
  -- Status
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE bexio_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can manage own bexio connection" ON bexio_connections
  FOR ALL USING (dealer_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_bexio_connections_updated_at
  BEFORE UPDATE ON bexio_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 8. SEQUENCES FOR QUOTE/INVOICE NUMBERS
-- ============================================

-- Quote number sequence per dealer (stored in dealers table)
ALTER TABLE dealers 
ADD COLUMN IF NOT EXISTS next_quote_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_invoice_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS quote_prefix TEXT DEFAULT 'OFF',
ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'RE';

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number(p_dealer_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_number INTEGER;
  v_year TEXT;
BEGIN
  -- Get and increment the number atomically
  UPDATE dealers 
  SET next_quote_number = next_quote_number + 1
  WHERE id = p_dealer_id
  RETURNING quote_prefix, next_quote_number - 1 INTO v_prefix, v_number;
  
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  RETURN v_prefix || '-' || v_year || '-' || LPAD(v_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(p_dealer_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_number INTEGER;
  v_year TEXT;
BEGIN
  UPDATE dealers 
  SET next_invoice_number = next_invoice_number + 1
  WHERE id = p_dealer_id
  RETURNING invoice_prefix, next_invoice_number - 1 INTO v_prefix, v_number;
  
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  RETURN v_prefix || '-' || v_year || '-' || LPAD(v_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 9. EXTEND LEADS TABLE
-- ============================================

-- Add customer reference to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;


-- ============================================
-- 10. EXTEND VEHICLES TABLE
-- ============================================

-- Add sale tracking to vehicles
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sold_price INTEGER,
ADD COLUMN IF NOT EXISTS sold_to_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS final_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

-- Index for sold vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_sold ON vehicles(dealer_id, sold_at) WHERE sold_at IS NOT NULL;


-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE customers IS 'Kundenstammdaten für Offerten und Rechnungen';
COMMENT ON TABLE quotes IS 'Offerten/Angebote für Fahrzeugverkäufe';
COMMENT ON TABLE quote_items IS 'Positionen einer Offerte';
COMMENT ON TABLE invoices IS 'Rechnungen für abgeschlossene Verkäufe';
COMMENT ON TABLE invoice_items IS 'Positionen einer Rechnung';
COMMENT ON TABLE payments IS 'Zahlungseingänge für Teilzahlungen';
COMMENT ON TABLE bexio_connections IS 'Bexio OAuth-Verbindungen pro Händler';

COMMENT ON COLUMN quotes.total IS 'Gesamtbetrag in Rappen (CHF * 100)';
COMMENT ON COLUMN invoices.paid_amount IS 'Bereits bezahlter Betrag in Rappen';
