# Deployment Guide for Nimra Shop

## Option 1: Vercel Automatic Deployment (Recommended)

This is the standard "Zero Config" CI/CD pipeline.

1.  Go to [Vercel.com](https://vercel.com) and sign up/log in.
2.  Click **"Add New..."** -> **"Project"**.
3.  Click **"Continue with GitHub"**.
4.  Search for `nimracashandcarry-maker/website` and click **"Import"**.
5.  In the configuration screen:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Environment Variables**: Add your Supabase URL and Keys here if needed.
6.  Click **"Deploy"**.

Vercel will now automatically deploy your website whenever you push code to the `main` branch.

## Option 2: GitHub Actions (Advanced)

If you prefer to control deployment using GitHub Actions, you need to configure secrets in your GitHub repository setting (`Settings` -> `Secrets and variables` -> `Actions`).

Required Secrets:
*   `VERCEL_TOKEN`
*   `VERCEL_ORG_ID`
*   `VERCEL_PROJECT_ID`
