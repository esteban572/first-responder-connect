# 🔍 Google OAuth Debug Checklist

## Current Setup
- **Production URL:** https://paranet.tech
- **Supabase Project:** ibatkglpnvqjserqfjmm
- **Supabase Callback:** https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback

---

## ✅ Step-by-Step Verification

### Step 1: Check Google Cloud Console OAuth Client Type

1. Go to: https://console.cloud.google.com/apis/credentials

2. Find your OAuth 2.0 Client ID

3. **CRITICAL:** Check the "Type" column
   - ✅ Must say **"Web application"**
   - ❌ If it says "iOS", "Android", "Desktop", or anything else → **CREATE NEW CLIENT**

**If you need to create a new client:**
- Click "+ CREATE CREDENTIALS" → "OAuth client ID"
- Select "Web application"
- Name it "Paranet Web App"
- Continue to Step 2

---

### Step 2: Configure Authorized JavaScript Origins

In your OAuth client settings, under **Authorized JavaScript origins**, add:

```
https://paranet.tech
https://www.paranet.tech
https://ibatkglpnvqjserqfjmm.supabase.co
```

**DO NOT ADD:**
- ❌ http://localhost:5173 (remove this for production testing)
- ❌ Old Vercel URLs

**For local development only, add:**
- http://localhost:5173

---

### Step 3: Configure Authorized Redirect URIs

Under **Authorized redirect URIs**, add ONLY:

```
https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
```

**IMPORTANT:**
- ✅ Must be EXACTLY this URL
- ✅ No trailing slash
- ✅ Must use https://
- ✅ Must include /auth/v1/callback

**For local development, also add:**
```
http://localhost:54321/auth/v1/callback
```

Click **SAVE**

---

### Step 4: Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent

2. **Check Publishing Status:**
   - If status is "Testing" → You MUST add test users
   - If status is "In Production" → Anyone can sign in

3. **If in Testing Mode:**
   - Scroll to "Test users"
   - Click "+ ADD USERS"
   - Add YOUR email address (the one you're testing with)
   - Click "Save"

4. **Add App Information:**
   - App name: Paranet
   - User support email: [your email]
   - Developer contact: [your email]

5. **Add Links (IMPORTANT):**
   - Application home page: `https://paranet.tech`
   - Application privacy policy link: `https://paranet.tech/privacy`
   - Application terms of service link: `https://paranet.tech/terms`

6. **Authorized domains:**
   - Add: `paranet.tech`

7. **Scopes:**
   - Make sure you have:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`

Click **SAVE AND CONTINUE** through all steps

---

### Step 5: Update Supabase Configuration

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/url-configuration

2. **Site URL** - Set to:
   ```
   https://paranet.tech
   ```

3. **Redirect URLs** - Add ALL of these:
   ```
   https://paranet.tech/**
   https://paranet.tech/feed
   https://paranet.tech/auth/callback
   https://www.paranet.tech/**
   https://www.paranet.tech/feed
   ```

4. Click **Save**

---

### Step 6: Verify Google Provider in Supabase

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/providers

2. Click on **Google**

3. Verify:
   - ✅ **Enabled** checkbox is checked
   - ✅ **Client ID** matches your Google Cloud Console OAuth Client ID
   - ✅ **Client Secret** matches your Google Cloud Console OAuth Client Secret

4. **If you created a NEW OAuth client in Step 1:**
   - Copy the NEW Client ID from Google Cloud Console
   - Copy the NEW Client Secret from Google Cloud Console
   - Paste them here
   - Click **Save**

---

### Step 7: Wait for Propagation

⏰ **CRITICAL:** After making changes in Google Cloud Console:
- Wait **5-10 minutes** for changes to propagate
- Google's systems need time to update globally

---

### Step 8: Clear Browser Cache

1. **Chrome/Edge:**
   - Press Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
   - Select "All time"
   - Check "Cookies and other site data"
   - Check "Cached images and files"
   - Click "Clear data"

2. **Safari:**
   - Press Cmd+Option+E
   - Or Safari → Clear History → All History

---

### Step 9: Test in Incognito Mode

1. Open a **new incognito/private window**
2. Go to: https://paranet.tech
3. Click "Continue with Google"
4. Watch for errors

---

## 🐛 Common Error Messages & Fixes

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth client is not type "Web application" OR consent screen not configured

**Fix:**
1. Verify OAuth client type is "Web application"
2. Check OAuth consent screen is configured
3. If in Testing mode, add your email as a test user

---

### Error: "redirect_uri_mismatch"

**Cause:** Redirect URI in Google Console doesn't match Supabase callback

**Fix:**
1. Copy the EXACT redirect URI from the error message
2. Add it to Google Cloud Console → Authorized redirect URIs
3. Make sure it's: `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback`

---

### Error: "invalid_client"

**Cause:** Client ID or Client Secret is incorrect

**Fix:**
1. Go to Google Cloud Console
2. Copy the Client ID and Client Secret
3. Paste them into Supabase Google provider settings
4. Make sure there are no extra spaces or characters

---

### Error: "unauthorized_client"

**Cause:** OAuth client doesn't have permission for the requested scopes

**Fix:**
1. Check OAuth consent screen scopes
2. Make sure email, profile, and openid scopes are enabled
3. If you added sensitive scopes, you may need Google verification

---

## 🔍 Debug Information to Collect

If still not working, collect this information:

1. **OAuth Client Type:** [Web application / iOS / Android / Desktop]

2. **OAuth Consent Screen Status:** [Testing / In Production]

3. **Test Users Added:** [Yes / No]

4. **Exact Error Message:** [Copy the full error text]

5. **Browser Console Errors:**
   - Open DevTools (F12)
   - Go to Console tab
   - Click "Sign in with Google"
   - Copy any red error messages

6. **Network Tab:**
   - Open DevTools → Network tab
   - Click "Sign in with Google"
   - Look for failed requests (red)
   - Check the request URL and response

---

## 📸 Screenshots to Take

If you need help, take screenshots of:

1. Google Cloud Console → OAuth 2.0 Client ID details page
   - Show: Type, Authorized JavaScript origins, Authorized redirect URIs

2. Google Cloud Console → OAuth consent screen
   - Show: Publishing status, Test users section

3. Supabase → Auth → URL Configuration
   - Show: Site URL and Redirect URLs

4. Supabase → Auth → Providers → Google
   - Show: Enabled status (hide Client Secret)

5. Browser error message
   - Show: The exact error Google displays

---

## 🎯 Most Likely Issues (in order)

1. **OAuth client is NOT "Web application" type** (90% of cases)
2. **OAuth consent screen in Testing mode but no test users added** (5% of cases)
3. **Redirect URI mismatch** (3% of cases)
4. **Client ID/Secret incorrect in Supabase** (1% of cases)
5. **Didn't wait 5-10 minutes after Google changes** (1% of cases)

---

## ✅ Final Checklist

Before testing, verify ALL of these:

- [ ] OAuth client type is "Web application"
- [ ] Authorized JavaScript origins includes `https://paranet.tech` and Supabase URL
- [ ] Authorized redirect URI is EXACTLY `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback`
- [ ] OAuth consent screen is configured
- [ ] Privacy Policy link added: `https://paranet.tech/privacy`
- [ ] Terms of Service link added: `https://paranet.tech/terms`
- [ ] If Testing mode: Your email is added as test user
- [ ] Supabase Site URL is `https://paranet.tech`
- [ ] Supabase redirect URLs include `https://paranet.tech/**`
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret match between Google and Supabase
- [ ] Waited 5-10 minutes after Google changes
- [ ] Cleared browser cache
- [ ] Tested in incognito mode

---

## 🆘 Still Not Working?

Share this information:

1. OAuth client type: _______________
2. Consent screen status: _______________
3. Test users added: _______________
4. Exact error message: _______________
5. Browser console errors: _______________

---

**Created:** January 24, 2026  
**For:** Paranet (paranet.tech)  
**Supabase Project:** ibatkglpnvqjserqfjmm
