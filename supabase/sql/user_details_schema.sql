-- User Details Schema
-- Run this in Supabase SQL Editor

-- Create user_details table to store customer information
CREATE TABLE IF NOT EXISTS user_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  shipping_address TEXT NOT NULL,
  city VARCHAR(100),
  eir VARCHAR(20),
  vat_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_details_user_id ON user_details(user_id);

-- Enable Row Level Security
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;

-- Users can view their own details
CREATE POLICY "Users can view their own details" ON user_details
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own details
CREATE POLICY "Users can insert their own details" ON user_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own details
CREATE POLICY "Users can update their own details" ON user_details
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_user_details_updated_at
  BEFORE UPDATE ON user_details
  FOR EACH ROW
  EXECUTE FUNCTION update_user_details_updated_at();

