-- Fix RLS Policies to use auth.jwt() instead of auth.users table
-- Run this in Supabase SQL Editor after running the main schema

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can insert categories
CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (is_admin());

-- Admin can update categories
CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (is_admin());

-- Admin can delete categories
CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (is_admin());

-- Admin can insert products
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (is_admin());

-- Admin can update products
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (is_admin());

-- Admin can delete products
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (is_admin());

