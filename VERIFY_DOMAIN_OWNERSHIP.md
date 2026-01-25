# 🔐 Verify Domain Ownership with Google

## 🎯 Goal

Verify that you own `paranet.tech` so Google OAuth consent screen accepts it.

---

## 📋 Method 1: DNS Verification (Recommended - Easiest with Vercel)

### Step 1: Start Verification Process

1. Go to: https://search.google.com/search-console

2. Click **"Add Property"**

3. Select **"Domain"** (not URL prefix)

4. Enter:
   ```
   paranet.tech
   ```

5. Click **"Continue"**

---

### Step 2: Get DNS TXT Record

Google will show you a TXT record like:
```
google-site-verification=abc123xyz456...
```

**Copy this entire value!**

---

### Step 3: Add TXT Record to Vercel

1. Go to: https://vercel.com/esteban-ibarras-projects-30cb10dd/paranet-app/settings/domains

2. Find your domain `paranet.tech`

3. Click on it or click **"Edit"**

4. Look for **"DNS Records"** or go to your domain settings

5. Click **"Add Record"**

6. Fill in:
   - **Type:** TXT
   - **Name:** @ (or leave blank for root domain)
   - **Value:** Paste the `google-site-verification=...` value from Google

7. Click **"Save"**

---

### Step 4: Verify in Google Search Console

1. Go back to Google Search Console

2. Click **"Verify"**

3. Google will check for the TXT record

4. ✅ Should say "Ownership verified"

**Note:** DNS changes can take a few minutes to propagate. If it fails, wait 5-10 minutes and try again.

---

## 📋 Method 2: HTML File Upload (Alternative)

If DNS method doesn't work, try this:

### Step 1: Get Verification File

1. In Google Search Console verification screen

2. Choose **"HTML file"** method

3. Download the verification file (e.g., `google1234567890abcdef.html`)

---

### Step 2: Add File to Your Project

1. Copy the downloaded file to your project's `public` folder:
   ```
   /Users/estebanibarra/first-responder-connect/public/google1234567890abcdef.html
   ```

2. The file should contain just the verification meta tag

---

### Step 3: Deploy

1. Commit and push:
   ```bash
   git add public/google*.html
   git commit -m "Add Google verification file"
   git push origin main
   ```

2. Wait for Vercel to deploy (1-2 minutes)

---

### Step 4: Verify

1. Test the file is accessible:
   - Go to: `https://paranet.tech/google1234567890abcdef.html`
   - Should show the verification content

2. Go back to Google Search Console

3. Click **"Verify"**

4. ✅ Should say "Ownership verified"

---

## 📋 Method 3: HTML Meta Tag (Alternative)

### Step 1: Get Meta Tag

1. In Google Search Console verification screen

2. Choose **"HTML tag"** method

3. Copy the meta tag:
   ```html
   <meta name="google-site-verification" content="abc123xyz..." />
   ```

---

### Step 2: Add to Your HTML

1. Open: `/Users/estebanibarra/first-responder-connect/index.html`

2. Add the meta tag inside the `<head>` section:
   ```html
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <meta name="google-site-verification" content="abc123xyz..." />
     <title>Paranet</title>
   </head>
   ```

---

### Step 3: Deploy

1. Commit and push:
   ```bash
   git add index.html
   git commit -m "Add Google verification meta tag"
   git push origin main
   ```

2. Wait for Vercel to deploy

---

### Step 4: Verify

1. Go back to Google Search Console

2. Click **"Verify"**

3. ✅ Should say "Ownership verified"

---

## 🔄 After Verification

Once your domain is verified in Google Search Console:

### Step 1: Add to OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent

2. Click **"EDIT APP"**

3. Under **"Authorized domains"**, add:
   ```
   paranet.tech
   ```

4. It should now accept it without the verification error! ✅

5. Click **"SAVE AND CONTINUE"**

---

## ⚠️ Important Notes

### About www vs non-www

If you verify `paranet.tech`, it covers:
- ✅ `paranet.tech`
- ✅ `www.paranet.tech`
- ✅ Any subdomain

So you only need to verify the root domain.

---

### Verification Methods Priority

**Easiest to Hardest:**
1. **DNS TXT Record** (Recommended) - Permanent, works for all subdomains
2. **HTML File Upload** - Easy, but file must stay on server
3. **HTML Meta Tag** - Easy, but tag must stay in HTML

**I recommend DNS TXT Record method** because:
- ✅ Permanent verification
- ✅ Works for all subdomains
- ✅ Doesn't require code changes
- ✅ Easy to manage in Vercel

---

## 🎯 Quick Summary

### For Vercel Users (Easiest):

1. ✅ Go to Google Search Console
2. ✅ Add property: `paranet.tech`
3. ✅ Copy the TXT record value
4. ✅ Add TXT record in Vercel domain settings
5. ✅ Wait 5 minutes
6. ✅ Click "Verify" in Google Search Console
7. ✅ Add `paranet.tech` to OAuth consent screen authorized domains

---

## 🐛 Troubleshooting

### "Verification failed"
- Wait 5-10 minutes for DNS to propagate
- Check TXT record is added correctly in Vercel
- Try verifying again

### "Can't find TXT record"
- Make sure you added it to the root domain (@)
- Check Vercel DNS settings are correct
- Wait longer (DNS can take up to 24 hours, but usually 5-10 minutes)

### "HTML file not found"
- Make sure file is in `public` folder
- Check file name matches exactly
- Verify deployment was successful
- Test URL directly in browser

---

## ✅ Verification Checklist

- [ ] Started verification in Google Search Console
- [ ] Chose verification method (DNS recommended)
- [ ] Added TXT record to Vercel (or uploaded file/added meta tag)
- [ ] Waited 5-10 minutes for propagation
- [ ] Clicked "Verify" in Google Search Console
- [ ] Saw "Ownership verified" message
- [ ] Added `paranet.tech` to OAuth consent screen authorized domains
- [ ] Saved OAuth consent screen changes

---

## 🎉 Result

After verification, you can:
- ✅ Add `paranet.tech` to OAuth consent screen
- ✅ Use it as your application home page
- ✅ No more "not registered to you" error
- ✅ Professional OAuth consent screen

---

**Created:** January 25, 2026  
**Issue:** Domain ownership not verified  
**Solution:** Verify domain in Google Search Console using DNS TXT record
