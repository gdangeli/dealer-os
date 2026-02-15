-- Migration: Add notification settings to dealers table
-- Run in Supabase SQL Editor

-- Add company profile fields
ALTER TABLE dealers 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Add notification settings
ALTER TABLE dealers
ADD COLUMN IF NOT EXISTS notification_new_lead BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_daily_summary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_longstanding_days INTEGER DEFAULT 30;

-- Add comments for documentation
COMMENT ON COLUMN dealers.phone IS 'Telefonnummer';
COMMENT ON COLUMN dealers.address IS 'Strasse und Hausnummer';
COMMENT ON COLUMN dealers.city IS 'Ort';
COMMENT ON COLUMN dealers.postal_code IS 'Postleitzahl';
COMMENT ON COLUMN dealers.notification_new_lead IS 'Email bei neuer Anfrage senden';
COMMENT ON COLUMN dealers.notification_daily_summary IS 'Tägliche Zusammenfassung senden';
COMMENT ON COLUMN dealers.notification_longstanding_days IS 'Langsteher-Warnung nach X Tagen';
