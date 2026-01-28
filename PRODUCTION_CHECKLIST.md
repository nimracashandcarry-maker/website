# Production Setup Checklist

Use this checklist to track your Supabase production setup progress.

## Pre-Setup
- [ ] Created Supabase account
- [ ] Created new Supabase project
- [ ] Saved project credentials securely

## Database Setup
- [ ] Step 1: Created Supabase project
- [ ] Step 2: Retrieved credentials (URL, anon key, service role key)
- [ ] Step 3: Configured authentication (disabled email confirmations)
- [ ] Step 4.1: Ran `schema.sql`
- [ ] Step 4.2: Ran `fix_rls_policies.sql`
- [ ] Step 4.3: Ran `orders_schema.sql`
- [ ] Step 4.4: Ran `storage_setup.sql`
- [ ] Step 4.5: Ran `user_details_schema.sql`
- [ ] Step 4.6: Ran `employees_and_customers_schema.sql`
- [ ] Step 4.7: Ran `fix_order_items_cascade.sql`
- [ ] Step 5a: Created admin user via Dashboard
- [ ] Step 5b: Set admin role via SQL
- [ ] Step 6: Verified database setup (all queries passed)

## Storage Setup
- [ ] Verified `product-images` bucket exists
- [ ] Verified storage policies are configured
- [ ] Tested image upload (optional at this stage)

## Environment Variables
- [ ] Created `.env.local` file
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `SMTP_HOST`
- [ ] Added `SMTP_PORT`
- [ ] Added `SMTP_USER`
- [ ] Added `SMTP_PASS`
- [ ] Added `FROM_EMAIL`
- [ ] Added `BUSINESS_EMAIL`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` (optional)

## Email Configuration
- [ ] Set up Gmail App Password (or other SMTP service)
- [ ] Tested email sending
- [ ] Verified order notification emails work

## Testing
- [ ] Tested admin login (`/admin-login`)
- [ ] Tested database connection (products load)
- [ ] Tested storage upload (product image)
- [ ] Tested order placement
- [ ] Tested email notifications

## Production Deployment
- [ ] Built application (`npm run build`)
- [ ] Deployed to hosting platform
- [ ] Added environment variables to production
- [ ] Tested production deployment
- [ ] Verified admin login works in production
- [ ] Verified orders work in production

## Security
- [ ] Verified RLS policies are enabled
- [ ] Verified admin user has correct role
- [ ] Verified storage policies are secure
- [ ] Confirmed service role key is secret
- [ ] Confirmed database password is strong

## Optional
- [ ] Ran `seed.sql` for sample data
- [ ] Configured custom email templates
- [ ] Set up monitoring/backups
- [ ] Configured custom domain

## Notes
_Add any notes or issues encountered during setup:_

_________________________________________________
_________________________________________________
_________________________________________________

---

**Setup Date:** _______________
**Supabase Project URL:** _______________
**Admin Email:** _______________
