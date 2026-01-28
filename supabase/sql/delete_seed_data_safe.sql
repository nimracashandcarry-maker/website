-- Safe Delete Seed Data Script (Keeps Admin User)
-- This script deletes seed data but preserves your admin user and any real data
-- Run this in Supabase SQL Editor

-- Step 1: Delete all order items
-- This removes all items from all orders
DELETE FROM order_items;

-- Step 2: Delete all orders
-- This removes all order records
DELETE FROM orders;

-- Step 3: Delete all user details
-- This removes customer information stored in user_details
DELETE FROM user_details;

-- Step 4: Delete all customers
-- This removes all customer records
DELETE FROM customers;

-- Step 5: Delete all products
-- This removes all product records
DELETE FROM products;

-- Step 6: Delete all categories
-- This removes all category records
DELETE FROM categories;

-- Note: Employees table is NOT deleted here
-- If you want to delete dummy employees, do it manually:
-- DELETE FROM employees WHERE employee_id = 'dummy-employee-id';

-- Verification Queries (run these after deletion to confirm):
-- 
-- SELECT 'order_items' as table_name, COUNT(*) as count FROM order_items
-- UNION ALL
-- SELECT 'orders', COUNT(*) FROM orders
-- UNION ALL
-- SELECT 'user_details', COUNT(*) FROM user_details
-- UNION ALL
-- SELECT 'customers', COUNT(*) FROM customers
-- UNION ALL
-- SELECT 'products', COUNT(*) FROM products
-- UNION ALL
-- SELECT 'categories', COUNT(*) FROM categories;
--
-- All counts should be 0
