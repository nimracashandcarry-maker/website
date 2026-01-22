# Supabase Authentication Setup

## Disable Email Verification

To allow users to sign up without email verification and automatically log them in:

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll down to **Email Auth** section
3. Find **"Enable email confirmations"** toggle
4. **Turn OFF** the toggle (disable email confirmations)
5. Click **Save**

This will allow users to sign up and be automatically logged in without needing to verify their email.

---

## Alternative: Keep Email Verification but Auto-Confirm

If you want to keep email verification enabled but auto-confirm users (for development/testing):

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll down to **Email Auth** section
3. Find **"Enable email confirmations"** toggle
4. Keep it **ON**
5. In **"Email Templates"** section, you can customize the confirmation email
6. For development, you can also use the **"Auto Confirm Users"** option in the Auth settings

---

## Current Implementation

The signup page (`src/app/signup/page.tsx`) is configured to:
- Create the account
- Automatically sign the user in after successful signup
- Redirect to the home page

If email confirmation is disabled in Supabase settings, users will be automatically signed in after signup.

