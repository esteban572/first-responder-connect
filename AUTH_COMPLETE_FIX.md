# 🔧 Complete Authentication Fix Guide

## Issues
1. ❌ Google Sign-In returns 404: DEPLOYMENT_NOT_FOUND
2. ❌ Email confirmation emails not being sent

---

## 🎯 Root Causes

### Issue 1: Google OAuth 404
- Supabase is redirecting to old/wrong deployment URLs
- Need to configure proper redirect URLs

### Issue 2: Email Not Sending
- Supabase's default email service has rate limits (3-4 emails/hour on free tier)
- Email templates may have wrong redirect URLs
- Need to either:
  - Use Supabase's built-in SMTP (limited)
  - OR set up custom SMTP provider (recommended for production)

---

## ✅ SOLUTION 1: Fix Google OAuth (Critical)

### Step 1: Disable Email Confirmation (Temporary Fix)

This will let users sign in with Google immediately without email verification.

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/settings/auth
2. Scroll to **Email Auth**
3. Find **"Enable email confirmations"**
4. **UNCHECK** this option (disable it)
5. Click **Save**

This allows Google OAuth to work without email verification blocking it.

---

### Step 2: Fix Redirect URLs in Supabase

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/url-configuration

2. **Site URL** - Set to:
   ```
   https://paranet-app.vercel.app
   ```

3. **Redirect URLs** - Add ALL of these (click "Add URL" for each):
   ```
   https://paranet-app.vercel.app/**
   https://paranet-app.vercel.app/feed
   https://paranet-app.vercel.app/auth/callback
   http://localhost:5173/**
   http://localhost:5173/feed
   ```

4. Click **Save**

---

### Step 3: Check Google Provider Settings

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/providers

2. Click on **Google**

3. Verify:
   - ✅ **Enabled** is checked
   - ✅ Client ID is filled in
   - ✅ Client Secret is filled in

4. Copy the **Callback URL (for OAuth)**:
   ```
   https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
   ```

---

### Step 4: Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials

2. Find your OAuth 2.0 Client ID (for this project)

3. Click to edit

4. **Authorized JavaScript origins** - Add:
   ```
   https://paranet-app.vercel.app
   https://ibatkglpnvqjserqfjmm.supabase.co
   http://localhost:5173
   ```

5. **Authorized redirect URIs** - Make sure this exists:
   ```
   https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
   ```

6. Click **Save**

7. **IMPORTANT:** Wait 5 minutes for Google to propagate changes

---

## ✅ SOLUTION 2: Fix Email Sending (For Email/Password Auth)

### Option A: Use Supabase Built-in Email (Quick Fix)

**Limitations:**
- Only 3-4 emails per hour on free tier
- Uses Supabase's domain (may go to spam)
- Good for testing, not production

**Steps:**

1. Go to: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/templates

2. Click on **"Confirm signup"** template

3. Update the template to use correct URL:
   - Find `{{ .ConfirmationURL }}`
   - Make sure the template looks good
   - Click **Save**

4. Repeat for other templates:
   - Magic Link
   - Reset Password
   - Invite User

**Note:** Supabase will automatically use your Site URL from Step 2 above.

---

### Option B: Set Up Custom SMTP (Recommended for Production)

**Use a service like:**
- **Resend** (recommended, 3000 free emails/month)
- **SendGrid** (100 free emails/day)
- **Mailgun** (5000 free emails/month for 3 months)

**Steps for Resend (Easiest):**

1. Sign up at: https://resend.com

2. Get your API key

3. Go to Supabase: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/settings/auth

4. Scroll to **SMTP Settings**

5. Enable **"Enable Custom SMTP"**

6. Fill in Resend SMTP settings:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key]
   Sender email: noreply@yourdomain.com (or use Resend's test domain)
   Sender name: Paranet
   ```

7. Click **Save**

---

## 🧪 Testing the Fixes

### Test 1: Google Sign-In

1. Clear browser cache completely (Cmd+Shift+Delete)
2. Go to: https://paranet-app.vercel.app
3. Click "Sign in with Google"
4. Should redirect to Google
5. After login, should redirect to `/feed`
6. ✅ You should be logged in!

### Test 2: Email Sign-Up (if you enabled SMTP)

1. Go to: https://paranet-app.vercel.app
2. Try to sign up with email
3. Check your email inbox (and spam folder)
4. Click confirmation link
5. ✅ Should be logged in!

---

## 🐛 Troubleshooting

### Still Getting 404 on Google Sign-In?

**Check in Browser Console (F12):**

1. Open DevTools → Console
2. Click "Sign in with Google"
3. Look for errors
4. Check what URL it's redirecting to

**Common fixes:**
- Clear ALL browser data (cache, cookies, local storage)
- Try incognito/private mode
- Wait 5 minutes after changing Google Cloud Console settings
- Make sure you saved ALL changes in Supabase

### Google Says "redirect_uri_mismatch"?

**Fix:**
1. Copy the exact redirect URI from the error message
2. Add it to Google Cloud Console → Authorized redirect URIs
3. Save and wait 5 minutes

### Emails Still Not Sending?

**Check:**
1. Supabase email rate limits (3-4/hour on free tier)
2. Check spam folder
3. Verify SMTP settings if using custom SMTP
4. Check Supabase logs: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/logs/edge-logs

---

## 🎯 Recommended Setup for Production

1. ✅ **Disable email confirmation** for Google OAuth (users don't need it)
2. ✅ **Keep email confirmation enabled** for email/password signups
3. ✅ **Use custom SMTP** (Resend or SendGrid) for reliable email delivery
4. ✅ **Set up proper domain** for email sender (noreply@yourdomain.com)

---

## 📋 Quick Checklist

- [ ] Disabled email confirmation in Supabase Auth settings
- [ ] Set Site URL to `https://paranet-app.vercel.app`
- [ ] Added all redirect URLs in Supabase
- [ ] Verified Google provider is enabled in Supabase
- [ ] Added authorized origins in Google Cloud Console
- [ ] Added redirect URI in Google Cloud Console
- [ ] Waited 5 minutes for Google changes to propagate
- [ ] Cleared browser cache
- [ ] Tested Google sign-in
- [ ] (Optional) Set up custom SMTP for emails

---

## 🚀 Next Steps After Fix

Once Google OAuth works:

1. Test the app thoroughly
2. Set up custom SMTP for production emails
3. Configure email templates with your branding
4. Add custom domain for professional emails
5. Monitor auth logs for any issues

---

**Last Updated:** January 24, 2026  
**Priority:** Critical - Authentication is blocking all users
