
-- Add delivery_code column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_code VARCHAR(6);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_delivery_code ON orders(delivery_code);

-- Add constraint to ensure delivery codes are unique per order
ALTER TABLE orders ADD CONSTRAINT unique_delivery_code UNIQUE (delivery_code);
