-- Add discount percentage and website URL to menu items for featured deals
ALTER TABLE public.menu_items 
ADD COLUMN discount_percentage integer DEFAULT 0,
ADD COLUMN website_url text;

-- Update the menu_items trigger to handle updated_at
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for clarity
COMMENT ON COLUMN public.menu_items.discount_percentage IS 'Discount percentage for featured deals (0-100)';
COMMENT ON COLUMN public.menu_items.website_url IS 'Optional website URL for external deal links';