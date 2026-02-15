-- Migration: Add onboarding_completed field to dealers table
-- This field tracks whether a dealer has completed the onboarding wizard

ALTER TABLE dealers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- For existing dealers, mark onboarding as completed (they already have accounts)
UPDATE dealers SET onboarding_completed = true WHERE onboarding_completed IS NULL;

-- Set NOT NULL constraint after backfill
ALTER TABLE dealers ALTER COLUMN onboarding_completed SET NOT NULL;
ALTER TABLE dealers ALTER COLUMN onboarding_completed SET DEFAULT false;
