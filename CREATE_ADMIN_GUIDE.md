# How to Create a New Admin User

Follow these steps to create a new admin user with a new password for your NimraCashAndCarry application.

---

## Step 1: Create User via Supabase Dashboard

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users** (in the left sidebar)
3. Click **"Add user"** button (top right)
4. Select **"Create new user"**
5. Fill in the form:
   - **Email**: Enter your admin email (e.g., `admin@nimracashandcarry.com`)
   - **Password**: Enter a strong password (save this securely!)
   - **Auto Confirm User**: ✅ **Check this box** (important!)
6. Click **"Create user"**
7. **Copy the User ID** (UUID) that appears - you'll need it for the next step

---

## Step 2: Set Admin Role via SQL

1. Go to **SQL Editor** in your Supabase dashboard
2. Open the file `supabase/sql/create_new_admin.sql`
3. **Replace** `'your-new-admin@email.com'` with your actual admin email
4. Copy the SQL query
5. Paste into SQL Editor
6. Click **Run**

**The SQL query:**
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'your-new-admin@email.com';
```

**Alternative method** (if you have the User ID):
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE id = 'USER_ID_HERE';
```

---

## Step 3: Verify Admin Role

Run this verification query in SQL Editor:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'your-new-admin@email.com';
```

**Expected Result:**
- `role` should show as `admin`
- Email should match your admin email

---

## Step 4: Test Login

1. Go to your application's admin login page: `/admin-login`
2. Enter your new admin credentials:
   - **Email**: The email you created
   - **Password**: The password you set
3. Click **Login**
4. You should be redirected to `/admin` dashboard

---

## Troubleshooting

### "User not found" error
- Make sure you created the user in Step 1 first
- Check that the email matches exactly (case-sensitive)

### "Permission denied" after login
- Verify the admin role was set correctly (run verification query)
- Check that `raw_user_meta_data` contains `{"role": "admin"}`
- Try logging out and logging back in
- Clear browser cookies

### Can't access admin panel
- Make sure you're using the correct email and password
- Verify the user exists in Authentication → Users
- Check that the role is set to 'admin' in the verification query

---

## Quick Reference

**Create User:**
- Dashboard → Authentication → Users → Add user

**Set Admin Role:**
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'your-email@example.com';
```

**Verify:**
```sql
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

---

## Security Tips

- Use a strong, unique password for your admin account
- Don't share admin credentials
- Consider using 2FA if available
- Keep your admin email secure
- Regularly review admin users in Authentication → Users

---

**That's it!** Your new admin user is ready to use. 🎉
