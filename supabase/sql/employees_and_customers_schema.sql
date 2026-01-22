-- Employees and Customers Schema
-- Run this in Supabase SQL Editor

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table (repeated customers)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  shipping_address TEXT NOT NULL,
  city VARCHAR(100),
  eir VARCHAR(20),
  vat_number VARCHAR(50) NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add employee_id to orders table (optional, for tracking who placed the order)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Add customer_id to orders table (optional, to link to customers table)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_vat_number ON customers(vat_number);
CREATE INDEX IF NOT EXISTS idx_orders_employee_id ON orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Employees can view their own record
CREATE POLICY "Employees can view their own record" ON employees
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all employees
CREATE POLICY "Admins can view all employees" ON employees
  FOR SELECT USING (is_admin());

-- Admins can insert employees
CREATE POLICY "Admins can insert employees" ON employees
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update employees
CREATE POLICY "Admins can update employees" ON employees
  FOR UPDATE USING (is_admin());

-- Admins can delete employees
CREATE POLICY "Admins can delete employees" ON employees
  FOR DELETE USING (is_admin());

-- Admins can view all customers
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT USING (is_admin());

-- Employees can view all customers (for selecting during checkout)
CREATE POLICY "Employees can view all customers" ON customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.is_active = true
    )
  );

-- Admins can insert customers
CREATE POLICY "Admins can insert customers" ON customers
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update customers
CREATE POLICY "Admins can update customers" ON customers
  FOR UPDATE USING (is_admin());

-- Admins can delete customers
CREATE POLICY "Admins can delete customers" ON customers
  FOR DELETE USING (is_admin());

-- Create function to update updated_at timestamp for employees
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for employees
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_employees_updated_at();

-- Create function to update updated_at timestamp for customers
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

