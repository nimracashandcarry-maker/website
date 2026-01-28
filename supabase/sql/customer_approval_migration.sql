-- Customer Approval System Migration
-- Run this in Supabase SQL Editor

-- Add approval_status column to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved'
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add created_by_employee_id to track who created the customer
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS created_by_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Create index for approval_status
CREATE INDEX IF NOT EXISTS idx_customers_approval_status ON customers(approval_status);

-- Update existing customers to be approved (they were created before this feature)
UPDATE customers SET approval_status = 'approved' WHERE approval_status IS NULL;

-- Update RLS policy to allow employees to insert customers (with pending status)
DROP POLICY IF EXISTS "Employees can insert customers" ON customers;
CREATE POLICY "Employees can insert customers" ON customers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.is_active = true
    )
  );

-- Update employee view policy to only see approved customers
DROP POLICY IF EXISTS "Employees can view all customers" ON customers;
CREATE POLICY "Employees can view approved customers" ON customers
  FOR SELECT USING (
    (
      -- Employees can see approved customers
      approval_status = 'approved' AND
      EXISTS (
        SELECT 1 FROM employees
        WHERE employees.user_id = auth.uid()
        AND employees.is_active = true
      )
    )
    OR
    (
      -- Employees can see their own pending customers
      approval_status = 'pending' AND
      created_by_employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );
