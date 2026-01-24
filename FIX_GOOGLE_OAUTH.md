# 🔧 Fix Google OAuth Sign-In Issue

## 🐛 Problem
- Email/password sign-up works ✅
- Email/password sign-in works ✅
- **Google OAuth sign-in returns 404: DEPLOYMENT_NOT_FOUND** ❌

## 🎯 Root Cause
Google OAuth is redirecting to an old/incorrect Vercel deployment URL instead of the current production URL.

---

## ✅ Solution Steps

### Step 1: Verify Supabase Redirect URLs

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/url-configuration

2. **Site URL** should be:
   ```
   https://paranet-app.vercel.app
   ```

3. **Redirect URLs** should include:
   ```
   https://paranet-app.vercel.app/**
   https://paranet-app.vercel.app/feed
   https://paranet-app.vercel.app/auth/callback
   http://localhost:5173/**
   http://localhost:5173/feed
   ```

4. Click **Save**

---

### Step 2: Check Google Provider Configuration

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/providers

2. Click on **Google** provider

3. Verify:
   - ✅ **Enabled** checkbox is checked
   - ✅ **Client ID** is filled in
   - ✅ **Client Secret** is filled in

4. Copy the **Callback URL (for OAuth)** - should be:
   ```
   https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
   ```

---

### Step 3: Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials

2. Select the correct Google Cloud Project (the one used for this app)

3. Find the **OAuth 2.0 Client ID** used for this project

4. Click on it to edit

5. Under **Authorized JavaScript origins**, add:
   ```
   https://paranet-app.vercel.app
   https://ibatkglpnvqjserqfjmm.supabase.co
   http://localhost:5173
   ```

6. Under **Authorized redirect URIs**, verify this exists:
   ```
   https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
   ```

7. Click **Save**

8. **⏰ IMPORTANT:** Wait 5-10 minutes for Google to propagate the changes

---

### Step 4: Debug in Browser Console

Before testing, open browser DevTools to see what's happening:

1. Open https://paranet-app.vercel.app
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Click "Sign in with Google"
5. Watch for:
   - Any error messages
   - The redirect URL being used
   - Network requests in the **Network** tab

**Look for:**
- What URL is Google redirecting to after authentication?
- Is it an old Vercel deployment URL?
- Any CORS errors?

---

### Step 5: Check Code Configuration

The code in `src/contexts/AuthContext.tsx` uses:

```typescript
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/feed`,
    },
  });
  // ...
};
```

This should dynamically use the current domain. Verify:

1. Open browser console on https://paranet-app.vercel.app
2. Type: `window.location.origin`
3. Should return: `https://paranet-app.vercel.app`

If it returns something else, there's a browser/cache issue.

---

## 🧪 Testing Steps

### Test 1: Clear Everything
```bash
# Clear browser cache completely
# Chrome: Cmd+Shift+Delete → Select "All time" → Clear data
# Safari: Cmd+Option+E
# Firefox: Cmd+Shift+Delete
```

### Test 2: Try Incognito/Private Mode
1. Open incognito/private browser window
2. Go to https://paranet-app.vercel.app
3. Try Google sign-in
4. If it works here but not in regular browser → cache issue

### Test 3: Check Network Tab
1. Open DevTools → Network tab
2. Click "Sign in with Google"
3. Look for the OAuth redirect request
4. Check the `redirect_uri` parameter in the URL
5. Should point to Supabase callback, not old Vercel URL

---

## 🔍 Debugging Checklist

- [ ] Verified Site URL in Supabase is `https://paranet-app.vercel.app`
- [ ] Added all redirect URLs in Supabase
- [ ] Google provider is enabled in Supabase
- [ ] Google Cloud Console has correct authorized origins
- [ ] Google Cloud Console has correct redirect URI
- [ ] Waited 5-10 minutes after Google Cloud changes
- [ ] Cleared browser cache completely
- [ ] Tested in incognito mode
- [ ] Checked browser console for errors
- [ ] Checked Network tab for redirect URLs

---

## 🐛 Common Issues & Fixes

### Issue: "redirect_uri_mismatch" error from Google

**Cause:** The redirect URI in the OAuth request doesn't match what's configured in Google Cloud Console

**Fix:**
1. Copy the exact redirect URI from the error message
2. Add it to Google Cloud Console → Authorized redirect URIs
3. Save and wait 5 minutes

---

### Issue: Still redirecting to old deployment URL

**Possible causes:**
1. **Browser cache** - Clear all cache, cookies, local storage
2. **Supabase cache** - Site URL not updated properly
3. **Code issue** - Old hardcoded URL somewhere

**Fix:**
1. Clear browser completely
2. Verify Supabase Site URL is correct
3. Search codebase for old URLs:
   ```bash
   grep -r "vercel.app" src/
   ```

---

### Issue: 404 DEPLOYMENT_NOT_FOUND

**Cause:** Redirecting to a Vercel deployment that no longer exists

**Fix:**
1. Check what URL is in the 404 error
2. That's the URL Supabase is trying to redirect to
3. Update Supabase Site URL to the correct production URL
4. Clear browser cache

---

## 🔧 Alternative: Temporary Workaround

If Google OAuth continues to fail, you can:

1. **Disable Google OAuth temporarily**
   - Users can still sign up/in with email/password
   - Fix Google OAuth later when you have more time

2. **Use Magic Link instead**
   - Enable magic link auth in Supabase
   - Users get email with login link (no password needed)
   - Requires working SMTP setup

---

## 📊 Expected OAuth Flow

**Correct flow:**
1. User clicks "Sign in with Google" on `https://paranet-app.vercel.app`
2. App calls Supabase with `redirectTo: https://paranet-app.vercel.app/feed`
3. Supabase redirects to Google OAuth consent screen
4. User approves
5. Google redirects to: `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback?code=...`
6. Supabase processes the auth code
7. Supabase redirects to: `https://paranet-app.vercel.app/feed`
8. User is logged in ✅

**Current broken flow:**
1. User clicks "Sign in with Google"
2. Goes through Google OAuth
3. Supabase tries to redirect to old deployment URL
4. Gets 404: DEPLOYMENT_NOT_FOUND ❌

---

## 🎯 Priority Actions

**High Priority (Do Today):**
1. ✅ Verify Supabase Site URL is correct
2. ✅ Check Google Cloud Console settings
3. ✅ Test in incognito mode
4. ✅ Check browser console for actual redirect URL

**Medium Priority (This Week):**
1. Set up custom SMTP for reliable emails
2. Add better error handling for OAuth failures
3. Add loading states during OAuth flow

**Low Priority (Future):**
1. Add more OAuth providers (GitHub, Microsoft, etc.)
2. Implement social account linking
3. Add OAuth analytics/monitoring

---

## 📝 Notes

- Email/password auth works perfectly ✅
- Issue is isolated to Google OAuth only
- Likely a configuration mismatch between Supabase and Google Cloud Console
- OR browser cache showing old deployment URLs

---

## 🔗 Quick Links

- **Supabase Auth Settings:** https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/settings/auth
- **Supabase URL Config:** https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/url-configuration
- **Supabase Providers:** https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/providers
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Production App:** https://paranet-app.vercel.app
- **Vercel Dashboard:** https://vercel.com/esteban-ibarras-projects-30cb10dd/paranet-app

---

**Created:** January 24, 2026  
**Status:** 🔴 Critical - Blocking Google OAuth users  
**Estimated Fix Time:** 30-60 minutes  
**Assigned To:** Esteban Ibarra
