-- Add VAT percentage to products
-- Run this in Supabase SQL Editor

-- Add vat_percentage column (default 0 means no VAT)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS vat_percentage DECIMAL(5, 2) DEFAULT 0;

-- Update existing products to have 0% VAT (you can change this default)
UPDATE products SET vat_percentage = 0 WHERE vat_percentage IS NULL;

-- Add vat_percentage to order_items to preserve VAT at time of purchase
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS vat_percentage DECIMAL(5, 2) DEFAULT 0;
