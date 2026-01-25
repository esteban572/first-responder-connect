# 🎨 Customize Google OAuth Consent Screen

## 🎯 Goal

Change the OAuth consent screen from showing "ibatkglpnvqjserqfjmm.supabase.co" to showing "Paranet" or "paranet.tech"

---

## 📋 Step-by-Step Fix

### Step 1: Go to OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent

2. Click **"EDIT APP"** button

---

### Step 2: Update App Information

On the **"OAuth consent screen"** page, update these fields:

#### **App name** (MOST IMPORTANT)
```
Paranet
```
This is what users will see: "Continue to Paranet"

#### **User support email**
```
[Your email address]
```

#### **App logo** (Optional but recommended)
- Upload your Paranet logo (square image, at least 120x120px)
- This will show on the consent screen
- Makes it look more professional

#### **Application home page**
```
https://paranet.tech
```

#### **Application privacy policy link**
```
https://paranet.tech/privacy
```

#### **Application terms of service link**
```
https://paranet.tech/terms
```

#### **Authorized domains**
Click **"+ ADD DOMAIN"** and add:
```
paranet.tech
```

---

### Step 3: Save and Continue

1. Click **"SAVE AND CONTINUE"** at the bottom

2. Continue through the next screens:
   - **Scopes:** Keep existing scopes (email, profile, openid)
   - **Test users:** Keep your test users if in Testing mode
   - **Summary:** Review and confirm

3. Click **"BACK TO DASHBOARD"**

---

### Step 4: Test

1. **Clear browser cache** (Cmd+Shift+Delete)

2. Open **incognito/private window**

3. Go to: https://paranet.tech/login

4. Click **"Continue with Google"**

5. You should now see: **"Continue to Paranet"** instead of the Supabase URL! ✅

---

## 🎨 What Users Will See

### Before (Current):
```
Continue to ibatkglpnvqjserqfjmm.supabase.co
```

### After (Fixed):
```
Continue to Paranet
```

With your logo (if uploaded) and:
- "Paranet wants to access your Google Account"
- Your app name prominently displayed
- Professional appearance

---

## 📸 Optional: Add App Logo

To make it even more professional, add a logo:

### Logo Requirements:
- **Format:** PNG, JPG, or GIF
- **Size:** At least 120x120 pixels (square)
- **Recommended:** 512x512 pixels for best quality
- **File size:** Under 1MB
- **Content:** Your Paranet shield logo

### Where to Upload:
1. In OAuth consent screen editor
2. Look for **"App logo"** field
3. Click **"Upload"** or drag and drop
4. Save changes

---

## 🔍 Additional Customization Options

### App Domain
Shows where your app is hosted:
```
paranet.tech
```

### Support Email
Where users can contact you:
```
support@paranet.tech
```
(Set up email forwarding in Vercel domain settings)

### Developer Contact Information
Your email for Google to contact you:
```
[Your email]
```

---

## ⚠️ Publishing Status

### Testing Mode (Current)
- Only test users can sign in
- Shows "This app hasn't been verified by Google" warning
- Good for development and beta testing

### Production Mode (Optional)
- Anyone can sign in
- No verification warning (for basic scopes)
- May require verification for sensitive scopes

**To publish:**
1. Go to OAuth consent screen
2. Click **"PUBLISH APP"**
3. Confirm

**Note:** For basic scopes (email, profile, openid), you don't need Google verification. For sensitive scopes, Google will review your app.

---

## 🎯 Recommended Settings

### For Best User Experience:

**App name:**
```
Paranet
```

**App logo:**
- Upload your shield logo
- Makes it instantly recognizable

**Application home page:**
```
https://paranet.tech
```

**Privacy policy:**
```
https://paranet.tech/privacy
```

**Terms of service:**
```
https://paranet.tech/terms
```

**Authorized domains:**
```
paranet.tech
```

**Scopes:**
- `.../auth/userinfo.email` ✅
- `.../auth/userinfo.profile` ✅
- `openid` ✅

---

## 🐛 Troubleshooting

### "Changes not showing"
- Clear browser cache completely
- Test in incognito mode
- Wait 5 minutes for changes to propagate

### "Can't save changes"
- Make sure all required fields are filled
- Check that URLs are valid (https://)
- Verify authorized domain is added

### "Verification required"
- Only needed for sensitive scopes
- Basic scopes (email, profile) don't require verification
- You can publish without verification for basic scopes

---

## ✅ Checklist

Before testing, make sure you've:

- [ ] Updated App name to "Paranet"
- [ ] Added application home page (https://paranet.tech)
- [ ] Added privacy policy link (https://paranet.tech/privacy)
- [ ] Added terms of service link (https://paranet.tech/terms)
- [ ] Added authorized domain (paranet.tech)
- [ ] (Optional) Uploaded app logo
- [ ] Clicked "SAVE AND CONTINUE"
- [ ] Cleared browser cache
- [ ] Tested in incognito mode

---

## 🎉 Result

After making these changes, when users click "Continue with Google", they'll see:

```
┌─────────────────────────────────┐
│   [Paranet Logo]                │
│                                 │
│   Continue to Paranet           │
│                                 │
│   Paranet wants to access       │
│   your Google Account           │
│                                 │
│   This will allow Paranet to:   │
│   • See your email address      │
│   • See your personal info      │
│                                 │
│   [Cancel]  [Continue]          │
└─────────────────────────────────┘
```

Much more professional than showing the Supabase URL! ✅

---

**Created:** January 25, 2026  
**Issue:** OAuth consent screen shows Supabase URL  
**Solution:** Update app name in OAuth consent screen to "Paranet"
