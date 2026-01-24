# 🔧 Google Sign-In 404 Fix

## Problem
Getting `404: DEPLOYMENT_NOT_FOUND` when trying to sign in with Google.

## Root Cause
Supabase is redirecting to an old/non-existent Vercel deployment URL instead of your current production URL.

---

## ✅ Solution: Update Supabase Redirect URLs

### Step 1: Update Site URL in Supabase

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/url-configuration

2. Set **Site URL** to:
   ```
   https://paranet-app.vercel.app
   ```

3. Click **Save**

---

### Step 2: Add Redirect URLs (Wildcard)

In the same page, under **Redirect URLs**, add:

```
https://paranet-app.vercel.app/**
https://paranet-app.vercel.app/feed
https://paranet-app.vercel.app/auth/callback
```

Click **Save**

---

### Step 3: Verify Google OAuth Settings

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/providers

2. Click on **Google** provider

3. Verify it's **Enabled**

4. Copy the **Callback URL (for OAuth)** - should be:
   ```
   https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
   ```

---

### Step 4: Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials

2. Find your OAuth 2.0 Client ID

3. Click to edit

4. Under **Authorized JavaScript origins**, add:
   ```
   https://paranet-app.vercel.app
   https://ibatkglpnvqjserqfjmm.supabase.co
   ```

5. Under **Authorized redirect URIs**, make sure this exists:
   ```
   https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
   ```

6. Click **Save**

---

## 🧪 Test the Fix

1. Clear your browser cache (Cmd+Shift+R on Mac)
2. Go to: https://paranet-app.vercel.app
3. Click "Sign in with Google"
4. Should redirect to Google login
5. After login, should redirect back to `/feed`

---

## 🐛 Still Not Working?

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Sign in with Google"
4. Look for any error messages
5. Share the error with me

### Check Network Tab

1. Open DevTools → Network tab
2. Click "Sign in with Google"
3. Look for the redirect URL in the requests
4. Check if it's going to the wrong domain

---

## 📝 Common Issues

### Issue: "redirect_uri_mismatch"
**Fix:** Make sure the Supabase callback URL is added to Google Cloud Console authorized redirect URIs

### Issue: Still redirecting to old deployment
**Fix:** 
1. Clear browser cache completely
2. Try incognito/private browsing mode
3. Check Supabase Site URL is set correctly

### Issue: "Invalid redirect URL"
**Fix:** Add the exact redirect URL to Supabase allowed redirect URLs list

---

## ✅ Expected Flow

1. User clicks "Sign in with Google" on `https://paranet-app.vercel.app`
2. Redirects to Google OAuth consent screen
3. User approves
4. Google redirects to: `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback`
5. Supabase processes auth
6. Supabase redirects to: `https://paranet-app.vercel.app/feed`
7. User is logged in ✅

---

**Last Updated:** January 24, 2026
