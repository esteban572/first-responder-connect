# 🔐 GitHub Secrets Setup Guide

## Quick Setup (5 minutes)

You need to add 3 secrets to GitHub for the CD pipeline to work.

---

## Step 1: Get Your Vercel Token

1. **Go to:** https://vercel.com/account/tokens
2. **Click:** "Create Token"
3. **Name:** `GitHub Actions - First Responder Connect`
4. **Scope:** Full Account
5. **Click:** "Create"
6. **Copy the token** (you'll only see it once!)

---

## Step 2: Add Secrets to GitHub

1. **Go to:** https://github.com/esteban572/first-responder-connect/settings/secrets/actions

2. **Click:** "New repository secret" button

3. **Add these 3 secrets one by one:**

### Secret 1: VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** [Paste the token you copied from Step 1]
- Click "Add secret"

### Secret 2: VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** `team_tRwlC8TwWzPenYLz0ir3IDOQ`
- Click "Add secret"

### Secret 3: VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** `prj_Fjj8iE1E9zQA5IFAkJQr5iG7kByi`
- Click "Add secret"

---

## Step 3: Verify Secrets

After adding all 3 secrets, you should see:

```
✅ VERCEL_TOKEN
✅ VERCEL_ORG_ID
✅ VERCEL_PROJECT_ID
```

---

## Step 4: Test the CD Pipeline

Once secrets are configured:

```bash
# Commit and push the new workflow
git add .
git commit -m "chore: set up Vercel CD pipeline"
git push origin main
```

Then:
1. Go to: https://github.com/esteban572/first-responder-connect/actions
2. Watch the deployment run
3. Get your preview URL from the workflow summary

---

## ✅ You're Done!

From now on:
- **Every push to `main`** → Automatic preview deployment
- **Manual production deploy** → Via GitHub Actions UI

---

## 🔗 Quick Links

- **Add Secrets:** https://github.com/esteban572/first-responder-connect/settings/secrets/actions
- **Get Vercel Token:** https://vercel.com/account/tokens
- **View Actions:** https://github.com/esteban572/first-responder-connect/actions
