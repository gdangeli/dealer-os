-- Migration: Add Stripe subscription fields to dealers table
-- This enables proper subscription management with Stripe

-- Add Stripe-specific columns
ALTER TABLE dealers
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dealers_stripe_customer_id ON dealers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_dealers_stripe_subscription_id ON dealers(stripe_subscription_id);

-- Update subscription_plan to include 'enterprise' option
-- (The column already exists, but we document the valid values)
COMMENT ON COLUMN dealers.subscription_plan IS 'Subscription plan: beta, starter, pro, business, enterprise';
COMMENT ON COLUMN dealers.stripe_customer_id IS 'Stripe Customer ID (cus_xxx)';
COMMENT ON COLUMN dealers.stripe_subscription_id IS 'Stripe Subscription ID (sub_xxx)';
COMMENT ON COLUMN dealers.subscription_status IS 'Stripe subscription status: active, canceled, past_due, unpaid, trialing, etc.';
COMMENT ON COLUMN dealers.subscription_period_end IS 'When the current subscription period ends';

-- For existing beta users, ensure they have active status
UPDATE dealers 
SET subscription_status = 'active' 
WHERE subscription_plan = 'beta' AND subscription_status IS NULL;
