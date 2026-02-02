-- Add product variations table for dynamic product options (sizes, colors, volumes, etc.)

CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- e.g., "Small", "Red", "100ml"
  attribute_type VARCHAR(100) NOT NULL, -- e.g., "Size", "Color", "Volume"
  price DECIMAL(10,2) NOT NULL,         -- Price for this variation
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by product
CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON product_variations(product_id);

-- Add variation columns to order_items to track which variation was ordered
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variation_id UUID REFERENCES product_variations(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variation_name VARCHAR(255);

-- Enable RLS
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variations
-- Everyone can read variations (public products)
CREATE POLICY "Anyone can view product variations" ON product_variations
  FOR SELECT USING (true);

-- Only admins can manage variations (using is_admin() function from fix_rls_policies.sql)
CREATE POLICY "Admins can insert product variations" ON product_variations
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update product variations" ON product_variations
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete product variations" ON product_variations
  FOR DELETE USING (is_admin());
