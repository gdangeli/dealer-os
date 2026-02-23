-- Test Drives / Probefahrt-Buchung
-- Ermöglicht Online-Terminbuchung für Probefahrten

CREATE TABLE IF NOT EXISTS test_drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relations
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Customer info (denormalized for when no customer record exists)
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(200),
    customer_phone VARCHAR(50),
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Anfrage eingegangen
        'confirmed',    -- Vom Händler bestätigt
        'completed',    -- Durchgeführt
        'cancelled',    -- Abgesagt
        'no_show'       -- Kunde nicht erschienen
    )),
    
    -- Additional info
    notes TEXT,
    cancellation_reason TEXT,
    source VARCHAR(50) DEFAULT 'website', -- website, widget, manual, phone
    
    -- Notification tracking
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_test_drives_dealer ON test_drives(dealer_id);
CREATE INDEX idx_test_drives_vehicle ON test_drives(vehicle_id);
CREATE INDEX idx_test_drives_scheduled ON test_drives(scheduled_at);
CREATE INDEX idx_test_drives_status ON test_drives(status);

-- RLS Policies
ALTER TABLE test_drives ENABLE ROW LEVEL SECURITY;

-- Dealers can see their own test drives
CREATE POLICY "Dealers can view own test drives"
    ON test_drives FOR SELECT
    USING (dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
        UNION
        SELECT dealer_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    ));

-- Dealers can insert their own test drives
CREATE POLICY "Dealers can insert own test drives"
    ON test_drives FOR INSERT
    WITH CHECK (dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
        UNION
        SELECT dealer_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    ));

-- Dealers can update their own test drives
CREATE POLICY "Dealers can update own test drives"
    ON test_drives FOR UPDATE
    USING (dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
        UNION
        SELECT dealer_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    ));

-- Dealers can delete their own test drives
CREATE POLICY "Dealers can delete own test drives"
    ON test_drives FOR DELETE
    USING (dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
        UNION
        SELECT dealer_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'
    ));

-- Public can insert (for booking widget) - with anon key
CREATE POLICY "Public can book test drives"
    ON test_drives FOR INSERT
    WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_test_drives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_drives_updated_at
    BEFORE UPDATE ON test_drives
    FOR EACH ROW
    EXECUTE FUNCTION update_test_drives_updated_at();

-- Comment
COMMENT ON TABLE test_drives IS 'Probefahrt-Buchungen von Kunden';
