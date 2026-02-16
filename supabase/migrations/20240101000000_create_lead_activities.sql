-- Create lead_activities table for activity timeline
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'call', 'email', 'status_change', 'system_event')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reminder_at TIMESTAMP WITH TIME ZONE NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_dealer_id ON lead_activities(dealer_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);
CREATE INDEX idx_lead_activities_reminder_at ON lead_activities(reminder_at) WHERE reminder_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view activities for leads in their dealer
CREATE POLICY "Users can view their dealer's lead activities"
  ON lead_activities
  FOR SELECT
  USING (
    dealer_id IN (
      SELECT id FROM dealers WHERE user_id = auth.uid()
    )
  );

-- Users can create activities for their dealer's leads
CREATE POLICY "Users can create activities for their dealer's leads"
  ON lead_activities
  FOR INSERT
  WITH CHECK (
    dealer_id IN (
      SELECT id FROM dealers WHERE user_id = auth.uid()
    )
    AND lead_id IN (
      SELECT id FROM leads WHERE dealer_id IN (
        SELECT id FROM dealers WHERE user_id = auth.uid()
      )
    )
  );

-- Users can update their own activities
CREATE POLICY "Users can update their own activities"
  ON lead_activities
  FOR UPDATE
  USING (
    dealer_id IN (
      SELECT id FROM dealers WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own activities (optional, might want to restrict)
CREATE POLICY "Users can delete their dealer's activities"
  ON lead_activities
  FOR DELETE
  USING (
    dealer_id IN (
      SELECT id FROM dealers WHERE user_id = auth.uid()
    )
  );

-- Comment on table
COMMENT ON TABLE lead_activities IS 'Activity timeline for leads including notes, calls, emails, and system events';
COMMENT ON COLUMN lead_activities.type IS 'Activity type: note, call, email, status_change, system_event';
COMMENT ON COLUMN lead_activities.metadata IS 'Additional structured data for specific activity types';
COMMENT ON COLUMN lead_activities.reminder_at IS 'Optional timestamp for follow-up reminders';
