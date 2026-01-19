# Supabase Connection Diagnostic

Since both profile editing and post creation are failing, let's diagnose the issue step by step.

## Step 1: Check Environment Variables

1. Open your browser's Developer Console (F12 or Cmd+Option+I)
2. Go to the Console tab
3. Type this and press Enter:

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
```

**Expected output:**
- URL should show: `https://ibatkglpnvqjserqfjmm.supabase.co`
- Key should show: `Present`

**If missing:** Your `.env` file isn't being loaded. Restart your dev server.

## Step 2: Test Supabase Connection

In the browser console, run:

```javascript
testSupabaseConnection()
```

This will check:
- ✅ Environment variables
- ✅ Authentication status
- ✅ If tables exist (profiles, posts)
- ✅ Storage bucket

## Step 3: Check if Tables Exist in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Check if you see these tables:
   - `profiles`
   - `posts`
   - `post_likes`
   - `media`
   - `connections`

**If tables are missing:** Run the `DATABASE_SCHEMA.sql` script in SQL Editor

## Step 4: Verify Your Supabase Project

1. Go to Supabase Dashboard → Settings → API
2. Verify:
   - **Project URL** matches: `https://ibatkglpnvqjserqfjmm.supabase.co`
   - **anon/public key** is set (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 5: Check Browser Network Tab

1. Open Developer Tools → Network tab
2. Try to create a post or edit profile
3. Look for requests to Supabase
4. Click on the failed request
5. Check the **Response** tab for the actual error message

## Common Issues & Solutions

### Issue: "Could not find the table 'public.posts'"
**Solution:** The table doesn't exist. Run `VERIFY_AND_FIX_POSTS.sql` in SQL Editor

### Issue: "new row violates row-level security policy"
**Solution:** RLS policies aren't set up. Run the database schema script

### Issue: "permission denied"
**Solution:** Check that you're authenticated and the anon key is correct

### Issue: Environment variables not loading
**Solution:** 
1. Make sure `.env` file is in the project root
2. Restart your dev server: `npm run dev`
3. Check that variables start with `VITE_`

### Issue: Wrong Supabase project
**Solution:** Verify the URL in `.env` matches your Supabase project URL

## Quick Test Query

Run this in Supabase SQL Editor to test if you can insert data:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users LIMIT 1;

-- Then try inserting (replace YOUR_USER_ID with the ID from above)
INSERT INTO profiles (id, email, full_name)
VALUES ('YOUR_USER_ID', 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Check if it worked
SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';
```

If this works, the issue is in the app code. If it fails, the issue is in the database setup.
