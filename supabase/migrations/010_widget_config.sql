-- Add widget configuration to dealers table
ALTER TABLE dealers 
ADD COLUMN IF NOT EXISTS widget_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS widget_config JSONB DEFAULT '{}'::jsonb;

-- Widget config structure:
-- {
--   "primary_color": "#2563eb",
--   "font_family": "system-ui",
--   "button_style": "rounded", // rounded, square, pill
--   "dark_mode": false,
--   "layout": "grid", // grid, list, slider
--   "show_price": true,
--   "contact_url": null, // custom contact URL
--   "allowed_domains": [] // empty = allow all
-- }

COMMENT ON COLUMN dealers.widget_enabled IS 'Whether the embed widget is enabled for this dealer';
COMMENT ON COLUMN dealers.widget_config IS 'JSON configuration for the embed widget';
