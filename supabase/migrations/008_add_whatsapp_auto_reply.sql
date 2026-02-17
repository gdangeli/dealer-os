-- Migration: Add Auto-Reply support to WhatsApp
-- Adds auto_reply_enabled and auto_reply_message columns

ALTER TABLE whatsapp_connections 
ADD COLUMN IF NOT EXISTS auto_reply_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_reply_message TEXT DEFAULT 'Danke für Ihre Nachricht! Wir melden uns so schnell wie möglich bei Ihnen.';

-- Add index for active connections with auto-reply
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_auto_reply 
  ON whatsapp_connections(dealer_id, auto_reply_enabled) 
  WHERE status = 'active' AND auto_reply_enabled = true;

COMMENT ON COLUMN whatsapp_connections.auto_reply_enabled IS 'Enable automatic reply to new WhatsApp messages';
COMMENT ON COLUMN whatsapp_connections.auto_reply_message IS 'Message text for automatic reply';
