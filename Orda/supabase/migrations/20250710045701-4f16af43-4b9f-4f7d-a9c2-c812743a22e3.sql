-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order_update', 'delivery_update', 'payment_success', 'general')),
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create GPS tracking table for delivery routes
CREATE TABLE public.gps_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy DECIMAL(5,2),
  speed DECIMAL(5,2),
  bearing DECIMAL(5,2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table with enhanced features
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_rating INTEGER CHECK (restaurant_rating >= 1 AND restaurant_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  restaurant_comment TEXT,
  driver_comment TEXT,
  food_comment TEXT,
  delivery_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Drop the old reviews table if it exists and recreate
DROP TABLE IF EXISTS public.reviews CASCADE;

CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_rating INTEGER CHECK (restaurant_rating >= 1 AND restaurant_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  restaurant_comment TEXT,
  driver_comment TEXT,
  food_comment TEXT,
  delivery_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service can create notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- RLS Policies for GPS tracking
CREATE POLICY "Drivers can manage their own GPS data" ON public.gps_tracking
FOR ALL USING (driver_id = auth.uid());

CREATE POLICY "Customers can view GPS data for their orders" ON public.gps_tracking
FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
);

CREATE POLICY "Restaurant owners can view GPS data for their orders" ON public.gps_tracking
FOR SELECT USING (
  order_id IN (
    SELECT o.id FROM public.orders o
    JOIN public.restaurants r ON o.restaurant_id = r.id
    WHERE r.owner_id = auth.uid()
  )
);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their orders" ON public.reviews
FOR INSERT WITH CHECK (
  customer_id = auth.uid() AND
  order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
);

CREATE POLICY "Customers can update their own reviews" ON public.reviews
FOR UPDATE USING (customer_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_gps_tracking_driver_id ON public.gps_tracking(driver_id);
CREATE INDEX idx_gps_tracking_order_id ON public.gps_tracking(order_id);
CREATE INDEX idx_gps_tracking_timestamp ON public.gps_tracking(timestamp);
CREATE INDEX idx_reviews_restaurant_id ON public.reviews(restaurant_id);
CREATE INDEX idx_reviews_driver_id ON public.reviews(driver_id);
CREATE INDEX idx_reviews_order_id ON public.reviews(order_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate average ratings for restaurants
CREATE OR REPLACE FUNCTION update_restaurant_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.restaurants
  SET 
    rating = (
      SELECT AVG(restaurant_rating)::DECIMAL(3,2)
      FROM public.reviews
      WHERE restaurant_id = NEW.restaurant_id AND restaurant_rating IS NOT NULL
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE restaurant_id = NEW.restaurant_id AND restaurant_rating IS NOT NULL
    )
  WHERE id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for restaurant rating updates
CREATE TRIGGER update_restaurant_ratings_trigger
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_ratings();

-- Function to send notification when order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only send notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_title := 'Order Confirmed';
        notification_message := 'Your order ' || NEW.order_number || ' has been confirmed and is being prepared.';
      WHEN 'preparing' THEN
        notification_title := 'Order Being Prepared';
        notification_message := 'Your order ' || NEW.order_number || ' is now being prepared.';
      WHEN 'ready' THEN
        notification_title := 'Order Ready';
        notification_message := 'Your order ' || NEW.order_number || ' is ready for pickup.';
      WHEN 'picked_up' THEN
        notification_title := 'Order Picked Up';
        notification_message := 'Your order ' || NEW.order_number || ' has been picked up and is on its way.';
      WHEN 'delivering' THEN
        notification_title := 'Out for Delivery';
        notification_message := 'Your order ' || NEW.order_number || ' is out for delivery.';
      WHEN 'delivered' THEN
        notification_title := 'Order Delivered';
        notification_message := 'Your order ' || NEW.order_number || ' has been delivered. Enjoy your meal!';
      WHEN 'cancelled' THEN
        notification_title := 'Order Cancelled';
        notification_message := 'Your order ' || NEW.order_number || ' has been cancelled.';
      ELSE
        notification_title := 'Order Update';
        notification_message := 'Your order ' || NEW.order_number || ' status has been updated.';
    END CASE;

    -- Insert notification
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      NEW.customer_id,
      notification_title,
      notification_message,
      'order_update',
      jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'status', NEW.status
      )
    );

    -- Also notify driver if assigned
    IF NEW.driver_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, data)
      VALUES (
        NEW.driver_id,
        'Delivery Update',
        'Order ' || NEW.order_number || ' status: ' || NEW.status,
        'delivery_update',
        jsonb_build_object(
          'order_id', NEW.id,
          'order_number', NEW.order_number,
          'status', NEW.status
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status notifications
CREATE TRIGGER notify_order_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gps_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;