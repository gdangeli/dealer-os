-- Fix: Add RLS to notification_log table
-- This table was created without RLS policies

-- Enable RLS
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Policy: Dealers can only see their own notification logs
CREATE POLICY "Dealers can view own notification logs" ON notification_log
  FOR SELECT USING (auth.uid() = dealer_id);

-- Policy: System can insert (via service role)
-- Note: Inserts happen via server-side code with service_role key
CREATE POLICY "Service role can insert notification logs" ON notification_log
  FOR INSERT WITH CHECK (true);

-- Policy: Dealers can delete their own logs (optional cleanup)
CREATE POLICY "Dealers can delete own notification logs" ON notification_log
  FOR DELETE USING (auth.uid() = dealer_id);

COMMENT ON TABLE notification_log IS 'Tracking für versendete Benachrichtigungen (Rate Limiting) - RLS enabled';
