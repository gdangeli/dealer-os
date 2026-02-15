-- Migration: Update leads table for CRM module
-- Run this if you already have the leads table created

-- Add first_name and last_name columns if they don't exist
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migrate data from old 'name' column if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'name') THEN
    UPDATE leads SET 
      first_name = SPLIT_PART(name, ' ', 1),
      last_name = COALESCE(NULLIF(SUBSTRING(name FROM POSITION(' ' IN name) + 1), ''), '-')
    WHERE first_name IS NULL OR last_name IS NULL;
  END IF;
END $$;

-- Set defaults and NOT NULL constraints
ALTER TABLE leads ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE leads ALTER COLUMN last_name SET NOT NULL;

-- Rename next_followup_at to next_followup if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'next_followup_at') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'next_followup') THEN
    ALTER TABLE leads RENAME COLUMN next_followup_at TO next_followup;
  END IF;
END $$;

-- Ensure next_followup exists as DATE type
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_followup DATE;

-- Update source default
ALTER TABLE leads ALTER COLUMN source SET DEFAULT 'other';

-- Drop old 'name' column if migration is complete (optional, run manually)
-- ALTER TABLE leads DROP COLUMN IF EXISTS name;
