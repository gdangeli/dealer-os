-- Migration: Add additional notification settings
-- Run in Supabase SQL Editor

-- Add quote/invoice notification settings
ALTER TABLE dealers
ADD COLUMN IF NOT EXISTS notification_quote_expiry BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_quote_expiry_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS notification_invoice_overdue BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_unsubscribe_token TEXT;

-- Generate unsubscribe tokens for existing dealers
UPDATE dealers 
SET notification_unsubscribe_token = encode(gen_random_bytes(32), 'hex')
WHERE notification_unsubscribe_token IS NULL;

-- Add comments
COMMENT ON COLUMN dealers.notification_quote_expiry IS 'Email wenn Offerte bald abläuft';
COMMENT ON COLUMN dealers.notification_quote_expiry_days IS 'Tage vor Ablauf warnen';
COMMENT ON COLUMN dealers.notification_invoice_overdue IS 'Email bei überfälliger Rechnung';
COMMENT ON COLUMN dealers.notification_unsubscribe_token IS 'Token für Email-Abmeldung';

-- Create table to track sent notifications (rate limiting / deduplication)
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  reference_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_to TEXT NOT NULL,
  subject TEXT,
  UNIQUE(dealer_id, notification_type, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_log_dealer ON notification_log(dealer_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_type_ref ON notification_log(notification_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(sent_at);

COMMENT ON TABLE notification_log IS 'Tracking für versendete Benachrichtigungen (Rate Limiting)';
