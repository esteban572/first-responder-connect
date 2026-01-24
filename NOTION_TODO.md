# 📋 Notion To-Do: Fix Google OAuth Sign-In

Copy this into your Notion to-do list:

---

## 🔴 CRITICAL: Fix Google OAuth Sign-In

**Priority:** High  
**Estimated Time:** 30-60 minutes  
**Due:** Today (January 24, 2026)

### Problem
- ❌ Google OAuth sign-in returns "404: DEPLOYMENT_NOT_FOUND"
- ✅ Email/password authentication works fine
- Issue: Google OAuth redirecting to old Vercel deployment URL

### Tasks

#### 1. Verify Supabase Configuration
- [ ] Go to Supabase URL Configuration
- [ ] Set Site URL to: `https://paranet-app.vercel.app`
- [ ] Add redirect URLs:
  - `https://paranet-app.vercel.app/**`
  - `https://paranet-app.vercel.app/feed`
  - `https://paranet-app.vercel.app/auth/callback`
- [ ] Save changes

#### 2. Check Google Provider Settings
- [ ] Go to Supabase Auth Providers
- [ ] Verify Google provider is enabled
- [ ] Copy callback URL: `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback`

#### 3. Update Google Cloud Console
- [ ] Go to Google Cloud Console Credentials
- [ ] Find OAuth 2.0 Client ID for this project
- [ ] Add authorized JavaScript origins:
  - `https://paranet-app.vercel.app`
  - `https://ibatkglpnvqjserqfjmm.supabase.co`
- [ ] Verify authorized redirect URI exists:
  - `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback`
- [ ] Save and wait 5-10 minutes for propagation

#### 4. Debug & Test
- [ ] Open browser DevTools (F12)
- [ ] Clear browser cache completely
- [ ] Test Google sign-in on https://paranet-app.vercel.app
- [ ] Check console for errors
- [ ] Check Network tab for redirect URLs
- [ ] Test in incognito mode

#### 5. Verify Fix
- [ ] Google sign-in redirects to Google ✅
- [ ] After approval, redirects back to app ✅
- [ ] User is logged in successfully ✅
- [ ] No 404 errors ✅

### Resources
- 📄 Detailed guide: `FIX_GOOGLE_OAUTH.md` in project root
- 🔗 Supabase Dashboard: https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm
- 🔗 Google Cloud Console: https://console.cloud.google.com/apis/credentials
- 🔗 Production App: https://paranet-app.vercel.app

### Notes
- Email/password auth is working fine
- Issue is isolated to Google OAuth only
- Likely a redirect URL configuration mismatch
- May need to wait 5-10 minutes after Google Cloud Console changes

### Success Criteria
✅ Users can sign in with Google without errors  
✅ OAuth flow redirects to correct production URL  
✅ No 404 deployment errors

---

## 📌 Additional Context

**Project:** First Responder Connect (Paranet)  
**Environment:** Production (Vercel)  
**Supabase Project:** ibatkglpnvqjserqfjmm  
**Production URL:** https://paranet-app.vercel.app

**Current Status:**
- ✅ App deployed successfully
- ✅ CD pipeline working
- ✅ Email/password auth working
- ❌ Google OAuth broken (404 error)

**Impact:**
- Users who prefer Google sign-in cannot access the app
- Blocks onboarding for Google OAuth users
- Email/password users unaffected
