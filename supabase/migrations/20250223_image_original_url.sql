-- Add original_url column to vehicle_images for before/after comparison
-- When an image is optimized, original_url stores the pre-optimization URL

ALTER TABLE vehicle_images 
ADD COLUMN IF NOT EXISTS original_url text;

-- Add comment for documentation
COMMENT ON COLUMN vehicle_images.original_url IS 'Original image URL before AI optimization, used for before/after comparison toggle';
