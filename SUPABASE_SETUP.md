# Supabase Database Setup Guide

This guide contains all SQL commands needed to set up your Supabase database for the NimraCashAndCarry e-commerce application.

## Prerequisites

- A Supabase account and project
- Access to Supabase SQL Editor

## Setup Steps

Follow these steps in order. Copy and paste each SQL script from the referenced files into the Supabase SQL Editor and run them sequentially.

---

## Step 1: Main Database Schema

**File:** `supabase/sql/schema.sql`

This creates the main tables (categories and products) with all fields including:
- Categories table
- Products table with **stock** and **is_featured** columns (already included)

1. Open `supabase/sql/schema.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click **Run**

---

## Step 2: Fix RLS Policies

**File:** `supabase/sql/fix_rls_policies.sql`

This fixes the admin policies to use `auth.jwt()` instead of querying `auth.users` directly, and creates the `is_admin()` function.

1. Open `supabase/sql/fix_rls_policies.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click **Run**

---

## Step 3: Orders Schema

**File:** `supabase/sql/orders_schema.sql`

This creates the orders and order_items tables for the e-commerce functionality.

**Required fields:** customer_name, customer_phone, shipping_address, vat_number  
**Optional fields:** customer_email, city, eir (eircode)

1. Open `supabase/sql/orders_schema.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click **Run**

---

## Step 4: Storage Setup

**File:** `supabase/sql/storage_setup.sql`

This sets up Supabase Storage for product image uploads.

1. Open `supabase/sql/storage_setup.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click **Run**

---

## Step 5: Create Admin User

**File:** `supabase/sql/create_admin.sql`

**IMPORTANT:** You must create the user first via Supabase Dashboard, then run the SQL.

### Step 5a: Create User via Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**

### Step 5b: Set Admin Role via SQL

1. Open `supabase/sql/create_admin.sql`
2. Replace `'your-admin@email.com'` with the email you used in Step 5a
3. Copy all contents
4. Paste into Supabase SQL Editor
5. Click **Run**

---

## Step 6: User Details Schema (Optional - for user authentication)

**File:** `supabase/sql/user_details_schema.sql`

This creates the user_details table for storing customer information (name, address, phone, VAT number, eircode, etc.) so users don't have to re-enter their details on each order.

**Required fields:** full_name, phone, shipping_address, vat_number  
**Optional fields:** email, city, eir (eircode)

**Note:** Only run this if you're using user authentication features.

1. Open `supabase/sql/user_details_schema.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click **Run**

---

## Step 7: Employees and Customers Schema

**File:** `supabase/sql/employees_and_customers_schema.sql`

This creates the employees and customers tables for employee order management functionality.

**Employees table:** Stores employee accounts that can place orders on behalf of customers
**Customers table:** Stores repeated customer information for quick order placement

This also adds `employee_id` and `customer_id` columns to the orders table to track which employee placed the order and which customer it's for.

1. Open `supabase/sql/employees_and_customers_schema.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click **Run**

---

## Step 8: Seed Data (Optional)

**File:** `supabase/sql/seed.sql`

This adds sample categories and products for testing. This step is optional.

1. Open `supabase/sql/seed.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click **Run**

---

## Verification

After running all scripts, verify your setup by running this in the SQL Editor:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'products', 'orders', 'order_items', 'user_details', 'employees', 'customers');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'products', 'orders', 'order_items', 'user_details', 'employees', 'customers');

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check admin function exists
SELECT proname FROM pg_proc WHERE proname = 'is_admin';
```

---

## Troubleshooting

### If you get permission errors:
- Make sure you're running the SQL as a database owner/admin
- Check that RLS policies are correctly set up

### If admin policies don't work:
- Verify the `is_admin()` function exists (run verification query above)
- Check that the user's `raw_user_meta_data` contains `{"role": "admin"}`
- Make sure you're logged in as the admin user when testing

### If storage uploads fail:
- Verify the `product-images` bucket exists (run verification query above)
- Check storage policies are correctly set
- Ensure the user has the admin role in their metadata

---

## File Structure

All SQL files are organized in `supabase/sql/`:

**Core Schema Files:**
- `schema.sql` - Main database schema (categories, products with stock and is_featured)
- `fix_rls_policies.sql` - RLS policy fixes and is_admin() function
- `orders_schema.sql` - Orders and order_items tables (includes vat_number and eir)
- `user_details_schema.sql` - User details table (includes vat_number and eir)
- `employees_and_customers_schema.sql` - Employees and customers tables for employee order management

**Setup Files:**
- `storage_setup.sql` - Storage bucket setup for product images
- `create_admin.sql` - Admin user setup (requires manual email update)

**Optional Files:**
- `seed.sql` - Sample data for testing
- `update_product_images.sql` - Update product images (for existing products)

---

## Quick Reference

**Execution Order (Fresh Setup):**
1. `supabase/sql/schema.sql` - Main tables (categories, products with stock and is_featured)
2. `supabase/sql/fix_rls_policies.sql` - RLS policies and is_admin() function
3. `supabase/sql/orders_schema.sql` - Orders and order_items tables (includes vat_number and eir)
4. `supabase/sql/storage_setup.sql` - Storage bucket for images
5. Create admin user via Dashboard, then run `supabase/sql/create_admin.sql`
6. (Optional) `supabase/sql/user_details_schema.sql` - User details table (if using authentication)
7. `supabase/sql/employees_and_customers_schema.sql` - Employees and customers tables
8. (Optional) `supabase/sql/seed.sql` - Sample data

**Note:** All schema files are up-to-date and include the latest fields. The `schema.sql` file includes stock and is_featured columns directly in the products table definition - no separate migration needed!

---

## Next Steps

After completing the database setup:

1. Update your `.env.local` with Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Run `npm run dev` to start the development server

3. Log in at `/admin-login` with your admin credentials

4. Start managing your e-commerce store!
