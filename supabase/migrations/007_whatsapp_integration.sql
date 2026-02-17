-- Migration: WhatsApp Business Integration
-- Creates tables for WhatsApp connections and messages

-- 1. WhatsApp-Verbindungen pro Händler
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  
  -- Meta API Credentials
  phone_number_id VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  waba_id VARCHAR(50) NOT NULL, -- WhatsApp Business Account ID
  access_token TEXT NOT NULL, -- Should be encrypted in production
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'pending')),
  display_name VARCHAR(100),
  
  -- Webhook verification
  verify_token VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(dealer_id), -- Ein WhatsApp pro Händler (MVP)
  UNIQUE(phone_number_id)
);

-- 2. WhatsApp-Nachrichten
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Message Details
  wamid VARCHAR(100) UNIQUE, -- WhatsApp Message ID (from Meta)
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  
  -- Sender/Recipient
  from_number VARCHAR(20) NOT NULL,
  to_number VARCHAR(20) NOT NULL,
  contact_name VARCHAR(100), -- Name from WhatsApp profile
  
  -- Content
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video', 'template', 'interactive', 'location', 'contacts')),
  content TEXT,
  media_id VARCHAR(100), -- Meta media ID
  media_url TEXT,
  media_mime_type VARCHAR(50),
  media_filename VARCHAR(255),
  
  -- Template (for outbound)
  template_name VARCHAR(100),
  template_params JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_code VARCHAR(20),
  error_message TEXT,
  
  -- Timestamps
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL, -- WhatsApp message timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_dealer_id ON whatsapp_connections(dealer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_lead_id ON whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_dealer_id ON whatsapp_messages(dealer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_number ON whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_wamid ON whatsapp_messages(wamid);

-- 4. Extend leads table
-- Add 'whatsapp' to allowed sources
DO $$
BEGIN
  -- Check if the constraint exists and modify it
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'leads_source_check'
  ) THEN
    ALTER TABLE leads DROP CONSTRAINT leads_source_check;
  END IF;
  
  -- Add new constraint with whatsapp source
  ALTER TABLE leads ADD CONSTRAINT leads_source_check 
    CHECK (source IN ('website', 'autoscout24', 'mobile.de', 'walkin', 'phone', 'whatsapp', 'other'));
EXCEPTION
  WHEN others THEN
    -- Constraint might not exist, continue
    NULL;
END $$;

-- Add WhatsApp-specific columns to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_last_message_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_leads_whatsapp_number ON leads(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

-- 5. Extend lead_activities types
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'lead_activities_type_check'
  ) THEN
    ALTER TABLE lead_activities DROP CONSTRAINT lead_activities_type_check;
  END IF;
  
  ALTER TABLE lead_activities ADD CONSTRAINT lead_activities_type_check 
    CHECK (type IN ('note', 'call', 'email', 'status_change', 'system_event', 'whatsapp_inbound', 'whatsapp_outbound'));
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

-- 6. RLS Policies
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Dealers can manage their WhatsApp connection" ON whatsapp_connections;
DROP POLICY IF EXISTS "Dealers can view their WhatsApp messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Service role can manage WhatsApp" ON whatsapp_connections;
DROP POLICY IF EXISTS "Service role can manage WhatsApp messages" ON whatsapp_messages;

-- Dealers can manage their own WhatsApp connection
CREATE POLICY "Dealers can manage their WhatsApp connection"
  ON whatsapp_connections
  FOR ALL
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Dealers can view/manage their WhatsApp messages
CREATE POLICY "Dealers can view their WhatsApp messages"
  ON whatsapp_messages
  FOR ALL
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Service role bypass for webhooks (important!)
CREATE POLICY "Service role can manage WhatsApp"
  ON whatsapp_connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage WhatsApp messages"
  ON whatsapp_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Updated_at trigger for whatsapp_connections
CREATE OR REPLACE FUNCTION update_whatsapp_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_whatsapp_connections_updated_at ON whatsapp_connections;
CREATE TRIGGER trigger_whatsapp_connections_updated_at
  BEFORE UPDATE ON whatsapp_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_connections_updated_at();

-- 8. Comments
COMMENT ON TABLE whatsapp_connections IS 'WhatsApp Business connections for dealers';
COMMENT ON TABLE whatsapp_messages IS 'WhatsApp message history for leads';
COMMENT ON COLUMN whatsapp_messages.wamid IS 'WhatsApp Message ID from Meta API';
COMMENT ON COLUMN whatsapp_messages.direction IS 'inbound = customer to dealer, outbound = dealer to customer';
