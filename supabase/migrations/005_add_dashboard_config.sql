-- Add dashboard_config column to dealers table
ALTER TABLE dealers 
ADD COLUMN IF NOT EXISTS dashboard_config JSONB DEFAULT '{"widgets": [
  {"id": "kpi-cards", "enabled": true, "order": 0},
  {"id": "recent-leads", "enabled": true, "order": 1},
  {"id": "long-standing", "enabled": true, "order": 2},
  {"id": "quick-actions", "enabled": true, "order": 3}
]}'::jsonb;

-- Add comment
COMMENT ON COLUMN dealers.dashboard_config IS 'User-specific dashboard widget configuration';
