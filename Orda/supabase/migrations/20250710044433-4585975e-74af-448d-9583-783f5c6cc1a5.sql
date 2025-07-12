-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  cuisine_type TEXT,
  delivery_fee INTEGER DEFAULT 0, -- in cents
  min_order_amount INTEGER DEFAULT 0, -- in cents
  avg_delivery_time INTEGER DEFAULT 30, -- in minutes
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  opening_hours JSONB, -- {monday: {open: "09:00", close: "22:00"}, ...}
  coordinates POINT, -- for location-based searches
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  image_url TEXT,
  prep_time INTEGER DEFAULT 15, -- in minutes
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  allergens TEXT[], -- array of allergen strings
  ingredients TEXT[],
  nutritional_info JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal INTEGER NOT NULL, -- in cents
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  delivery_address JSONB NOT NULL, -- {street, city, state, postal_code, coordinates}
  customer_notes TEXT,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL, -- in cents
  total_price INTEGER NOT NULL, -- quantity * unit_price
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_routes table for route management
CREATE TABLE public.driver_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  start_location POINT,
  current_location POINT,
  estimated_completion_time TIMESTAMP WITH TIME ZONE,
  total_distance INTEGER, -- in meters
  total_duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create route_orders junction table
CREATE TABLE public.route_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.driver_routes(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'picked_up', 'delivered')),
  pickup_time TIMESTAMP WITH TIME ZONE,
  delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Anyone can view active restaurants" ON public.restaurants
FOR SELECT USING (is_active = true);

CREATE POLICY "Restaurant owners can manage their restaurants" ON public.restaurants
FOR ALL USING (owner_id = auth.uid());

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories of active restaurants" ON public.categories
FOR SELECT USING (
  is_active = true AND 
  restaurant_id IN (SELECT id FROM public.restaurants WHERE is_active = true)
);

CREATE POLICY "Restaurant owners can manage their categories" ON public.categories
FOR ALL USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
);

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view available menu items" ON public.menu_items
FOR SELECT USING (
  is_available = true AND 
  restaurant_id IN (SELECT id FROM public.restaurants WHERE is_active = true)
);

CREATE POLICY "Restaurant owners can manage their menu items" ON public.menu_items
FOR ALL USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
);

-- RLS Policies for orders
CREATE POLICY "Customers can view their own orders" ON public.orders
FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Restaurant owners can view their restaurant orders" ON public.orders
FOR SELECT USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
);

CREATE POLICY "Drivers can view their assigned orders" ON public.orders
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Customers can create orders" ON public.orders
FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Restaurant owners and drivers can update orders" ON public.orders
FOR UPDATE USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()) OR
  driver_id = auth.uid()
);

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for accessible orders" ON public.order_items
FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.orders WHERE 
    customer_id = auth.uid() OR 
    driver_id = auth.uid() OR
    restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
  )
);

CREATE POLICY "Customers can create order items" ON public.order_items
FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
);

-- RLS Policies for driver_routes
CREATE POLICY "Drivers can manage their own routes" ON public.driver_routes
FOR ALL USING (driver_id = auth.uid());

-- RLS Policies for route_orders
CREATE POLICY "Drivers can view their route orders" ON public.route_orders
FOR SELECT USING (
  route_id IN (SELECT id FROM public.driver_routes WHERE driver_id = auth.uid())
);

CREATE POLICY "Drivers can manage their route orders" ON public.route_orders
FOR ALL USING (
  route_id IN (SELECT id FROM public.driver_routes WHERE driver_id = auth.uid())
);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their orders" ON public.reviews
FOR INSERT WITH CHECK (
  customer_id = auth.uid() AND
  order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_restaurants_owner_id ON public.restaurants(owner_id);
CREATE INDEX idx_restaurants_active ON public.restaurants(is_active);
CREATE INDEX idx_restaurants_cuisine ON public.restaurants(cuisine_type);
CREATE INDEX idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_driver_routes_driver_id ON public.driver_routes(driver_id);
CREATE INDEX idx_reviews_restaurant_id ON public.reviews(restaurant_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_routes_updated_at
  BEFORE UPDATE ON public.driver_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || EXTRACT(YEAR FROM NOW()) || 
         LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') ||
         LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') ||
         '-' || LPAD((RANDOM() * 999999)::INTEGER::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Function to update restaurant ratings
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.restaurants
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.reviews
      WHERE restaurant_id = NEW.restaurant_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE restaurant_id = NEW.restaurant_id
    )
  WHERE id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_rating();