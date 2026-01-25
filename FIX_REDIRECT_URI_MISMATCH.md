# 🔧 Fix: 400 redirect_uri_mismatch Error

## 🐛 The Problem

Google is saying the redirect URI doesn't match what's configured in Google Cloud Console.

---

## ✅ The Solution

You need to add the EXACT Supabase callback URL to Google Cloud Console.

---

## 📋 Step-by-Step Fix

### Step 1: Get Your Supabase Callback URL

Your Supabase callback URL is:
```
https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
```

**IMPORTANT:** 
- ✅ Must be EXACTLY this
- ✅ No trailing slash
- ✅ Must use `https://`
- ✅ Must include `/auth/v1/callback`

---

### Step 2: Add to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials

2. Find your **OAuth 2.0 Client ID** (should be type "Web application")

3. Click on it to edit

4. Scroll to **"Authorized redirect URIs"**

5. Click **"+ ADD URI"**

6. Paste EXACTLY this:
   ```
   https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
   ```

7. **CRITICAL:** Make sure there are NO extra spaces, NO trailing slashes

8. Click **"SAVE"**

---

### Step 3: Verify Authorized JavaScript Origins

While you're there, also verify **"Authorized JavaScript origins"** has:

```
https://paranet.tech
https://www.paranet.tech
https://ibatkglpnvqjserqfjmm.supabase.co
```

Click **"+ ADD URI"** for each one if missing.

---

### Step 4: Wait for Propagation

⏰ **CRITICAL:** Wait **5-10 minutes** for Google's changes to propagate globally.

---

### Step 5: Clear Browser Cache

1. **Chrome/Edge:**
   - Press Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
   - Select "All time"
   - Check "Cookies and other site data"
   - Check "Cached images and files"
   - Click "Clear data"

2. **Safari:**
   - Press Cmd+Option+E

---

### Step 6: Test in Incognito Mode

1. Open a **new incognito/private window**

2. Go to: https://paranet.tech/login

3. Click **"Continue with Google"**

4. Should work now! ✅

---

## 🔍 Common Mistakes

### ❌ Wrong: Extra trailing slash
```
https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback/
```

### ✅ Correct: No trailing slash
```
https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
```

---

### ❌ Wrong: Using your app domain
```
https://paranet.tech/auth/callback
```

### ✅ Correct: Using Supabase domain
```
https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
```

---

### ❌ Wrong: HTTP instead of HTTPS
```
http://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
```

### ✅ Correct: HTTPS
```
https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
```

---

## 📸 What Your Google Console Should Look Like

### OAuth 2.0 Client ID Settings:

**Application type:**
```
Web application
```

**Authorized JavaScript origins:**
```
https://paranet.tech
https://www.paranet.tech
https://ibatkglpnvqjserqfjmm.supabase.co
```

**Authorized redirect URIs:**
```
https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
```

---

## 🔍 How to Verify the Exact Redirect URI

If you want to see what redirect URI Supabase is using:

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/providers

2. Click on **"Google"** provider

3. Look for **"Callback URL (for OAuth)"**

4. Copy that EXACT URL

5. Paste it into Google Cloud Console → Authorized redirect URIs

---

## 🐛 Still Getting the Error?

### Check 1: Is the OAuth Client Type Correct?

1. Go to: https://console.cloud.google.com/apis/credentials

2. Look at the **"Type"** column for your OAuth client

3. It MUST say **"Web application"**

4. If it says anything else (iOS, Android, Desktop):
   - You need to create a NEW OAuth client
   - Select "Web application" as the type
   - Add the redirect URIs
   - Update Supabase with the new Client ID and Secret

---

### Check 2: Did You Wait Long Enough?

Google changes can take 5-10 minutes to propagate. If you just made the change:
- ⏰ Wait 10 minutes
- 🧹 Clear browser cache
- 🕵️ Try in incognito mode

---

### Check 3: Are You Using the Right Google Account?

If your OAuth consent screen is in "Testing" mode:
- Only test users can sign in
- Go to: https://console.cloud.google.com/apis/credentials/consent
- Scroll to "Test users"
- Make sure YOUR email is added
- Click "+ ADD USERS" if needed

---

## 📋 Complete Checklist

Before testing, verify ALL of these:

- [ ] OAuth client type is "Web application"
- [ ] Authorized JavaScript origins includes `https://paranet.tech`
- [ ] Authorized JavaScript origins includes `https://www.paranet.tech`
- [ ] Authorized JavaScript origins includes `https://ibatkglpnvqjserqfjmm.supabase.co`
- [ ] Authorized redirect URI is EXACTLY `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback`
- [ ] No trailing slash on redirect URI
- [ ] No extra spaces in redirect URI
- [ ] Clicked "SAVE" in Google Console
- [ ] Waited 5-10 minutes
- [ ] Cleared browser cache
- [ ] Testing in incognito mode
- [ ] If Testing mode: Your email is added as test user

---

## 🎯 Quick Fix Summary

1. ✅ Add `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback` to Google Console
2. ✅ Make sure OAuth client is "Web application" type
3. ✅ Wait 5-10 minutes
4. ✅ Clear browser cache
5. ✅ Test in incognito mode

---

## 📞 Need More Help?

If still not working, tell me:

1. **What is your OAuth client type?** (Web application / iOS / Android / Desktop)

2. **What redirect URIs do you have in Google Console?** (copy/paste them)

3. **What is the EXACT error message?** (take a screenshot if possible)

4. **Did you wait 5-10 minutes after making changes?**

---

**Created:** January 24, 2026  
**Issue:** 400 redirect_uri_mismatch  
**Solution:** Add exact Supabase callback URL to Google Console
