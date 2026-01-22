-- Quick Admin User Setup
-- IMPORTANT: You must create the user first via Supabase Dashboard, then run this SQL

-- Step 1: Create user via Supabase Dashboard
-- Go to: Authentication → Users → Add user → Create new user
-- Enter email and password, then create the user

-- Step 2: After creating the user, run this SQL to set admin role
-- Replace 'your-admin@email.com' with the email you used

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-admin@email.com';

-- Verify the admin role was set
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'your-admin@email.com';

