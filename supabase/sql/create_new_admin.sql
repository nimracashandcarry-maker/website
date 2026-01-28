-- Create New Admin User Script
-- Follow these steps to create a new admin user

-- STEP 1: Create the user via Supabase Dashboard first
-- 1. Go to Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter:
--    - Email: your-new-admin@email.com
--    - Password: your-strong-password
--    - Auto Confirm User: ✅ Check this box
-- 4. Click "Create user"
-- 5. Copy the User ID (UUID) that appears

-- STEP 2: Run this SQL to set admin role
-- Replace 'your-new-admin@email.com' with the email you used above
-- OR replace 'USER_ID_HERE' with the UUID from Step 1

-- Method 1: Using Email (recommended)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'your-new-admin@email.com';

-- Method 2: Using User ID (if you have the UUID)
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_build_object('role', 'admin')
-- WHERE id = 'USER_ID_HERE';

-- STEP 3: Verify the admin was created
-- Run this query to check:
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'your-new-admin@email.com';

-- The role should show as 'admin'

-- STEP 4: Test login
-- Go to /admin-login and login with your new admin credentials
