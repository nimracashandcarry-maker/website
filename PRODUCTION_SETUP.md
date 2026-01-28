# Production Supabase Setup Guide - Step by Step

This guide will walk you through setting up your Supabase database for production deployment of NimraCashAndCarry.

---

## Prerequisites

- A Supabase account (sign up at https://supabase.com if needed)
- Access to your Supabase project dashboard
- All SQL files from the `supabase/sql/` directory

---

## Step 1: Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: `NimraCashAndCarry` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the closest region to your users (e.g., `Europe West` for Ireland)
   - **Pricing Plan**: Select your plan (Free tier is fine to start)
5. Click **"Create new project"**
6. Wait for the project to be provisioned (2-3 minutes)

---

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

3. Save these credentials securely - you'll need them for environment variables

---

## Step 3: Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth** section
3. **Disable email confirmations** (turn OFF "Enable email confirmations")
   - This allows users to sign up and login immediately without email verification
4. Click **Save**

**Optional:** Configure email templates if you want custom emails for password reset, etc.

---

## Step 4: Run Database Schema Scripts

Open the **SQL Editor** in your Supabase dashboard (left sidebar → SQL Editor).

Run each script **in this exact order**:

### 4.1: Main Schema
1. Open `supabase/sql/schema.sql` from your project
2. Copy **ALL** contents
3. Paste into SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify success message

### 4.2: Fix RLS Policies
1. Open `supabase/sql/fix_rls_policies.sql`
2. Copy **ALL** contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success message

### 4.3: Orders Schema
1. Open `supabase/sql/orders_schema.sql`
2. Copy **ALL** contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success message

### 4.4: Storage Setup
1. Open `supabase/sql/storage_setup.sql`
2. Copy **ALL** contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success message

### 4.5: User Details Schema
1. Open `supabase/sql/user_details_schema.sql`
2. Copy **ALL** contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success message

### 4.6: Employees and Customers Schema
1. Open `supabase/sql/employees_and_customers_schema.sql`
2. Copy **ALL** contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success message

### 4.7: Fix Order Items Cascade (if needed)
1. Open `supabase/sql/fix_order_items_cascade.sql`
2. Copy **ALL** contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify success message

---

## Step 5: Create Admin User

### 5a: Create User via Dashboard
1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: Your admin email (e.g., `admin@nimracashandcarry.com`)
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create user"**
5. **Copy the User ID** (UUID) - you'll need it for the next step

### 5b: Set Admin Role via SQL
1. Open `supabase/sql/create_admin.sql`
2. **IMPORTANT**: Replace `'your-admin@email.com'` with your actual admin email
3. Copy the modified SQL
4. Paste into SQL Editor
5. Click **Run**
6. Verify success message

**Alternative method** (if you have the User ID):
```sql
-- Replace 'USER_ID_HERE' with the UUID from Step 5a
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE id = 'USER_ID_HERE';
```

---

## Step 6: Verify Database Setup

Run this verification query in SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'categories', 
  'products', 
  'orders', 
  'order_items', 
  'user_details', 
  'employees', 
  'customers'
)
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'categories', 
  'products', 
  'orders', 
  'order_items', 
  'user_details', 
  'employees', 
  'customers'
);

-- Check storage bucket exists
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'product-images';

-- Check admin function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_admin';
```

**Expected Results:**
- All 7 tables should be listed
- All tables should show `rowsecurity = true`
- Storage bucket `product-images` should exist and be public
- `is_admin` function should exist

---

## Step 7: Configure Storage Policies

1. Go to **Storage** in the left sidebar
2. Click on **`product-images`** bucket
3. Go to **Policies** tab
4. Verify these policies exist:
   - **Public Read Access**: Anyone can read files
   - **Admin Upload Access**: Only admins can upload

If policies are missing, run the storage setup SQL again or create them manually:
- **Public Read**: `SELECT` policy for `authenticated` and `anon` roles
- **Admin Upload**: `INSERT`, `UPDATE`, `DELETE` policies for users with `role = 'admin'`

---

## Step 8: Set Up Environment Variables

### For Local Development (.env.local)

Create or update `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Email Configuration (for order notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=NimraCashAndCarry <nimracashandcarry@gmail.com>
BUSINESS_EMAIL=nimracashandcarry@gmail.com

# Optional: For admin features
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### For Production Deployment

Add these same environment variables to your hosting platform:

**Vercel:**
1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable from above
3. Set them for **Production**, **Preview**, and **Development** environments

**Other Platforms:**
- Follow your platform's documentation for adding environment variables
- Ensure all variables are set for production environment

---

## Step 9: Test Your Setup

### 9.1: Test Admin Login
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/admin-login`
3. Login with your admin credentials
4. You should be redirected to `/admin` dashboard

### 9.2: Test Database Connection
1. Go to any page that loads products (e.g., `/products`)
2. Products should load (may be empty if you haven't added any)
3. Check browser console for any errors

### 9.3: Test Storage
1. Go to `/admin/products/new`
2. Try uploading a product image
3. Image should upload successfully to Supabase Storage

### 9.4: Test Orders
1. Add products to cart
2. Go through checkout
3. Place an order
4. Check Supabase dashboard → **Table Editor** → **orders** table
5. Order should appear there

---

## Step 10: Seed Sample Data (Optional)

If you want to add sample categories and products for testing:

1. Open `supabase/sql/seed.sql`
2. Review the data (you can modify it)
3. Copy **ALL** contents
4. Paste into SQL Editor
5. Click **Run**
6. Verify data appears in **Table Editor**

**Note:** You can skip this step if you want to add your own products via the admin panel.

---

## Step 11: Configure Email Service (for Order Notifications)

Your application sends emails for:
- Order confirmations to customers
- New order notifications to business
- Password reset emails
- Contact form submissions

### Using Gmail SMTP:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password
3. **Update Environment Variables**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   FROM_EMAIL=NimraCashAndCarry <nimracashandcarry@gmail.com>
   BUSINESS_EMAIL=nimracashandcarry@gmail.com
   ```

### Using Other Email Services:

- **SendGrid**: Use their SMTP settings
- **Resend**: Use their API (requires code changes)
- **AWS SES**: Use their SMTP settings

---

## Step 12: Security Checklist

Before going live, verify:

- [ ] All RLS policies are enabled
- [ ] Admin user is created and has admin role
- [ ] Storage bucket policies are configured
- [ ] Environment variables are set (especially in production)
- [ ] Service role key is kept secret (never commit to git)
- [ ] Email service is configured and tested
- [ ] Database password is strong and secure
- [ ] Admin credentials are secure

---

## Step 13: Production Deployment

1. **Build your application**:
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform** (Vercel, Netlify, etc.)

3. **Add environment variables** to your production environment

4. **Test production deployment**:
   - Visit your live site
   - Test admin login
   - Test product browsing
   - Test order placement
   - Test email notifications

---

## Troubleshooting

### "Permission denied" errors
- Check RLS policies are enabled
- Verify admin user has `role: 'admin'` in metadata
- Check storage bucket policies

### "Table doesn't exist" errors
- Verify all SQL scripts ran successfully
- Check table names match exactly
- Run verification query from Step 6

### Email not sending
- Verify SMTP credentials are correct
- Check environment variables are set
- Test SMTP connection separately
- Check spam folder

### Admin login not working
- Verify admin user exists in Authentication → Users
- Check `raw_user_meta_data` contains `{"role": "admin"}`
- Try logging out and back in
- Clear browser cookies

### Storage upload fails
- Verify `product-images` bucket exists
- Check storage policies allow uploads
- Verify user has admin role
- Check file size limits

---

## Quick Reference: SQL Execution Order

1. ✅ `schema.sql` - Main tables
2. ✅ `fix_rls_policies.sql` - RLS and admin function
3. ✅ `orders_schema.sql` - Orders tables
4. ✅ `storage_setup.sql` - Storage bucket
5. ✅ `user_details_schema.sql` - User details
6. ✅ `employees_and_customers_schema.sql` - Employees & customers
7. ✅ `fix_order_items_cascade.sql` - Cascade fixes
8. ✅ Create admin user (Dashboard + SQL)
9. ✅ `seed.sql` - Sample data (optional)

---

## Support

If you encounter issues:
1. Check the error message in Supabase SQL Editor
2. Verify all previous steps completed successfully
3. Check Supabase logs: **Logs** → **Postgres Logs**
4. Review the troubleshooting section above

---

## Next Steps After Setup

1. ✅ Add your products via `/admin/products`
2. ✅ Add categories via `/admin/categories`
3. ✅ Configure your business information (already in Footer/Contact)
4. ✅ Test the full order flow
5. ✅ Set up monitoring and backups in Supabase
6. ✅ Configure custom domain (if needed)

---

**Congratulations!** Your Supabase production database is now set up and ready to use! 🎉
