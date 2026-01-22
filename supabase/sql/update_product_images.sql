-- Update Coffee Maker and Programming Guide product images
-- Run this in Supabase SQL Editor to update existing products

-- Update Coffee Maker image
UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800'
WHERE slug = 'coffee-maker';

-- Update Programming Guide image
UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800'
WHERE slug = 'programming-guide';


