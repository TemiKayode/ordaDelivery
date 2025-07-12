-- Create restaurant_users table for multiple users per restaurant
CREATE TABLE public.restaurant_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  permissions JSONB DEFAULT '{"menu": true, "orders": true, "analytics": false, "settings": false}',
  invited_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Enable RLS
ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurant_users
CREATE POLICY "Restaurant owners can manage their restaurant users"
ON public.restaurant_users
FOR ALL
USING (restaurant_id IN (
  SELECT id FROM restaurants WHERE owner_id = auth.uid()
));

CREATE POLICY "Restaurant users can view their own access"
ON public.restaurant_users
FOR SELECT
USING (user_id = auth.uid());

-- Add foreign key constraints
ALTER TABLE public.restaurant_users
ADD CONSTRAINT restaurant_users_restaurant_id_fkey
FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE public.restaurant_users
ADD CONSTRAINT restaurant_users_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.restaurant_users
ADD CONSTRAINT restaurant_users_invited_by_fkey
FOREIGN KEY (invited_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Add stock_quantity field to menu_items for inventory management
ALTER TABLE public.menu_items
ADD COLUMN stock_quantity INTEGER DEFAULT 0,
ADD COLUMN low_stock_threshold INTEGER DEFAULT 5;

-- Add location coordinates to restaurants for distance calculations
ALTER TABLE public.restaurants
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC;

-- Create function to calculate distance between two points (haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 NUMERIC, lon1 NUMERIC, lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  RETURN 6371 * acos(
    cos(radians(lat1)) * cos(radians(lat2)) * 
    cos(radians(lon2) - radians(lon1)) + 
    sin(radians(lat1)) * sin(radians(lat2))
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add delivery constraints for drivers
ALTER TABLE public.driver_routes
ADD COLUMN max_orders INTEGER DEFAULT 5,
ADD COLUMN current_order_count INTEGER DEFAULT 0;

-- Create trigger to update restaurant_users timestamp
CREATE TRIGGER update_restaurant_users_updated_at
BEFORE UPDATE ON public.restaurant_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();