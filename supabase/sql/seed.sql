-- Seed data for testing
-- Run this in your Supabase SQL Editor

-- Insert test categories
INSERT INTO categories (name, slug) VALUES
  ('Electronics', 'electronics'),
  ('Clothing', 'clothing'),
  ('Books', 'books'),
  ('Home & Garden', 'home-garden'),
  ('Sports', 'sports')
ON CONFLICT (slug) DO NOTHING;

-- Insert test products
-- Note: Replace category_id with actual IDs from your categories table
-- You can get the IDs by running: SELECT id, name FROM categories;

-- Electronics products
INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Wireless Headphones',
  'wireless-headphones',
  'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
  129.99,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  id
FROM categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Smart Watch',
  'smart-watch',
  'Feature-rich smartwatch with fitness tracking, heart rate monitor, and smartphone notifications.',
  249.99,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  id
FROM categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Laptop Stand',
  'laptop-stand',
  'Ergonomic aluminum laptop stand with adjustable height. Improves posture and workspace organization.',
  49.99,
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
  id
FROM categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

-- Clothing products
INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Cotton T-Shirt',
  'cotton-t-shirt',
  '100% organic cotton t-shirt. Comfortable, breathable, and available in multiple colors.',
  24.99,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  id
FROM categories WHERE slug = 'clothing'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Denim Jeans',
  'denim-jeans',
  'Classic fit denim jeans with stretch for comfort. Durable and stylish for everyday wear.',
  79.99,
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
  id
FROM categories WHERE slug = 'clothing'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Winter Jacket',
  'winter-jacket',
  'Warm and waterproof winter jacket with insulated lining. Perfect for cold weather adventures.',
  149.99,
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
  id
FROM categories WHERE slug = 'clothing'
ON CONFLICT (slug) DO NOTHING;

-- Books products
INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'The Great Novel',
  'the-great-novel',
  'A captivating story that takes you on an unforgettable journey through time and space.',
  19.99,
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
  id
FROM categories WHERE slug = 'books'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Programming Guide',
  'programming-guide',
  'Comprehensive guide to modern programming practices and best practices for developers.',
  39.99,
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800',
  id
FROM categories WHERE slug = 'books'
ON CONFLICT (slug) DO NOTHING;

-- Home & Garden products
INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Indoor Plant Set',
  'indoor-plant-set',
  'Beautiful set of 3 low-maintenance indoor plants perfect for beginners. Includes pots and care guide.',
  34.99,
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
  id
FROM categories WHERE slug = 'home-garden'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Coffee Maker',
  'coffee-maker',
  'Programmable coffee maker with thermal carafe. Brews up to 12 cups of perfect coffee.',
  89.99,
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
  id
FROM categories WHERE slug = 'home-garden'
ON CONFLICT (slug) DO NOTHING;

-- Sports products
INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Yoga Mat',
  'yoga-mat',
  'Premium non-slip yoga mat with carrying strap. Perfect for yoga, pilates, and exercise.',
  29.99,
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
  id
FROM categories WHERE slug = 'sports'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, image_url, category_id)
SELECT 
  'Running Shoes',
  'running-shoes',
  'Lightweight running shoes with cushioned sole and breathable mesh upper. Ideal for daily runs.',
  99.99,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  id
FROM categories WHERE slug = 'sports'
ON CONFLICT (slug) DO NOTHING;

-- Verify the data
SELECT 
  c.name as category_name,
  COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

