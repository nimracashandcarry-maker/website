-- Fix Order Items Cascade Delete Issue
-- Run this in Supabase SQL Editor
-- 
-- PROBLEM: When a product is deleted, all order_items referencing it are also deleted,
-- resulting in orders with no items.
--
-- SOLUTION: Change from ON DELETE CASCADE to ON DELETE SET NULL
-- This way, when a product is deleted, the order_item remains but product_id becomes NULL.
-- We already store product_name and product_price in order_items, so order history is preserved.

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Step 2: Add new foreign key with SET NULL instead of CASCADE
ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;

-- Verify the change
SELECT 
  conname as constraint_name,
  confdeltype as delete_action
FROM pg_constraint 
WHERE conname = 'order_items_product_id_fkey';

-- Note: confdeltype values:
-- 'a' = NO ACTION
-- 'r' = RESTRICT  
-- 'c' = CASCADE
-- 'n' = SET NULL
-- 'd' = SET DEFAULT
