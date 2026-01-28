-- Delete Seed Data Script
-- This script safely deletes all dummy/seed data from your database
-- Run this in Supabase SQL Editor after transferring to production

-- IMPORTANT: This will delete ALL data from these tables
-- Make sure you want to delete everything before running!

-- Step 1: Delete order items first (child table)
-- This deletes all order items from all orders
DELETE FROM order_items;

-- Step 2: Delete orders (parent table, but depends on customers/employees)
DELETE FROM orders;

-- Step 3: Delete user details (customer information)
DELETE FROM user_details;

-- Step 4: Delete customers (if any were created)
DELETE FROM customers;

-- Step 5: Delete employees (except your admin user - be careful!)
-- Only delete if you have dummy employees
-- Uncomment the line below if you want to delete employees
-- DELETE FROM employees WHERE employee_id != 'your-admin-employee-id';

-- Step 6: Delete products (child of categories)
DELETE FROM products;

-- Step 7: Delete categories (parent table)
DELETE FROM categories;

-- Verification: Check that tables are empty
-- Run these queries to verify deletion:

-- SELECT COUNT(*) as order_items_count FROM order_items;
-- SELECT COUNT(*) as orders_count FROM orders;
-- SELECT COUNT(*) as user_details_count FROM user_details;
-- SELECT COUNT(*) as customers_count FROM customers;
-- SELECT COUNT(*) as products_count FROM products;
-- SELECT COUNT(*) as categories_count FROM categories;

-- All counts should be 0 after running the deletion script
