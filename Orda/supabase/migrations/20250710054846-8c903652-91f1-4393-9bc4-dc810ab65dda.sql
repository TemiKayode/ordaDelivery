-- Add discount percentage and website URL to menu items for featured deals
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS website_url text;

-- Add comments for clarity
COMMENT ON COLUMN public.menu_items.discount_percentage IS 'Discount percentage for featured deals (0-100)';
COMMENT ON COLUMN public.menu_items.website_url IS 'Optional website URL for external deal links';