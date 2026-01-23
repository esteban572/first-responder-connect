# GitHub Secrets Setup Guide

Step-by-step guide to configure all required GitHub secrets for the CI/CD pipeline.

## 📍 Where to Add Secrets

1. Go to your GitHub repository: https://github.com/esteban572/first-responder-connect
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret** button

---

## 🔑 Required Secrets (7 total)

### 1. VITE_SUPABASE_URL

**What it is:** Your Supabase project URL

**How to get it:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** → **API**
4. Copy the **Project URL**
5. Example: `https://abcdefghijklmnop.supabase.co`

**Add to GitHub:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://your-project.supabase.co`

---

### 2. VITE_SUPABASE_ANON_KEY

**What it is:** Your Supabase anonymous/public key

**How to get it:**
1. Same location as above (Settings → API)
2. Copy the **anon public** key
3. Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Add to GitHub:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `your-anon-key-here`

---

### 3. DOCKER_USERNAME

**What it is:** Your Docker Hub username

**How to get it:**
1. Your Docker Hub username is: `esteban572`

**Add to GitHub:**
- Name: `DOCKER_USERNAME`
- Value: `esteban572`

---

### 4. DOCKER_PASSWORD

**What it is:** Docker Hub access token (NOT your password)

**How to get it:**
1. Go to https://hub.docker.com
2. Click your profile → **Account Settings**
3. Click **Security** tab
4. Click **New Access Token**
5. Description: `GitHub Actions - First Responder Connect`
6. Access permissions: **Read, Write, Delete**
7. Click **Generate**
8. **Copy the token immediately** (you won't see it again!)

**Add to GitHub:**
- Name: `DOCKER_PASSWORD`
- Value: `dckr_pat_...` (your token)

---

### 5. VERCEL_TOKEN

**What it is:** Vercel deployment token

**How to get it:**
1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Token Name: `GitHub Actions - First Responder Connect`
4. Scope: **Full Account**
5. Expiration: **No Expiration** (or set to 1 year)
6. Click **Create**
7. **Copy the token immediately**

**Add to GitHub:**
- Name: `VERCEL_TOKEN`
- Value: `your-vercel-token`

---

### 6. VERCEL_ORG_ID

**What it is:** Your Vercel organization/team ID

**How to get it:**

**Method 1: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to your project
cd /Users/estebanibarra/Documents/first-responder-connect

# Link to Vercel project
vercel link

# Get the org ID
cat .vercel/project.json
```

The file will show:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

**Method 2: From Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click on your team/account name
3. Go to **Settings** → **General**
4. Copy the **Team ID** or **User ID**

**Add to GitHub:**
- Name: `VERCEL_ORG_ID`
- Value: `team_xxxxxxxxxxxxx` or `user_xxxxxxxxxxxxx`

---

### 7. VERCEL_PROJECT_ID

**What it is:** Your Vercel project ID

**How to get it:**

**Method 1: From vercel link (Recommended)**
```bash
# Same as above
cat .vercel/project.json
```

Copy the `projectId` value.

**Method 2: From Vercel Dashboard**
1. Go to your project in Vercel
2. Click **Settings**
3. Scroll to **General** section
4. Copy the **Project ID**

**Add to GitHub:**
- Name: `VERCEL_PROJECT_ID`
- Value: `prj_xxxxxxxxxxxxx`

---

## 🔧 Optional Secrets (Recommended)

### SNYK_TOKEN (Security Scanning)

**What it is:** Snyk security scanning token

**How to get it:**
1. Go to https://snyk.io (create free account)
2. Go to **Account Settings**
3. Click **General** → **Auth Token**
4. Click **Show** and copy the token

**Add to GitHub:**
- Name: `SNYK_TOKEN`
- Value: `your-snyk-token`

**Benefits:**
- Advanced vulnerability detection
- Detailed security reports
- Fix recommendations

---

### Staging Environment Secrets

If you have a separate staging Supabase project:

**STAGING_SUPABASE_URL**
- Same process as production Supabase URL
- Use your staging project

**STAGING_SUPABASE_ANON_KEY**
- Same process as production anon key
- Use your staging project

---

### Production Environment Secrets

If you want separate prod credentials:

**PROD_SUPABASE_URL**
- Your production Supabase URL

**PROD_SUPABASE_ANON_KEY**
- Your production Supabase anon key

**Note:** If you don't add these, the workflow will use the default `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] All 7 required secrets are added
- [ ] Secret names match exactly (case-sensitive)
- [ ] No extra spaces in secret values
- [ ] Tokens are valid and not expired
- [ ] Docker Hub repository exists
- [ ] Vercel project is linked

### Test Your Secrets

```bash
# Push a test commit
cd /Users/estebanibarra/Documents/first-responder-connect
git commit --allow-empty -m "ci: Test GitHub Actions setup"
git push origin main

# Then check:
# 1. Go to Actions tab in GitHub
# 2. Watch the workflow run
# 3. All jobs should be green ✅
```

---

## 🚨 Troubleshooting

### "Secret not found" error

**Problem:** Workflow can't access secret

**Solutions:**
1. Verify secret name matches exactly
2. Check for typos in workflow file
3. Ensure secret is added to repository (not organization)
4. Re-add the secret

### Docker push fails

**Problem:** "unauthorized: authentication required"

**Solutions:**
1. Verify `DOCKER_USERNAME` is correct
2. Regenerate Docker Hub token
3. Ensure token has write permissions
4. Check if Docker Hub repository exists

### Vercel deployment fails

**Problem:** "Invalid token" or "Project not found"

**Solutions:**
1. Regenerate Vercel token
2. Run `vercel link` again to get fresh IDs
3. Verify project exists in Vercel dashboard
4. Check token hasn't expired

### Supabase connection fails

**Problem:** "Invalid API key" or "Project not found"

**Solutions:**
1. Verify URL format: `https://xxx.supabase.co`
2. Regenerate anon key from Supabase dashboard
3. Check project is not paused
4. Verify RLS policies allow access

---

## 🔒 Security Best Practices

### Do's ✅

- ✅ Use GitHub Secrets for all sensitive data
- ✅ Rotate tokens every 90 days
- ✅ Use least-privilege access tokens
- ✅ Enable secret scanning in repository
- ✅ Review secret access logs

### Don'ts ❌

- ❌ Never commit secrets to code
- ❌ Don't share secrets in PR comments
- ❌ Don't use personal passwords as tokens
- ❌ Don't give tokens more permissions than needed
- ❌ Don't disable secret scanning

---

## 📋 Quick Reference

### All Required Secrets

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Docker Hub
DOCKER_USERNAME=esteban572
DOCKER_PASSWORD=dckr_pat_...

# Vercel
VERCEL_TOKEN=vercel_token_...
VERCEL_ORG_ID=team_... or user_...
VERCEL_PROJECT_ID=prj_...
```

### Optional Secrets

```bash
# Snyk (Security)
SNYK_TOKEN=snyk_token_...

# Staging Environment
STAGING_SUPABASE_URL=https://staging.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Production Environment (if separate)
PROD_SUPABASE_URL=https://prod.supabase.co
PROD_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Next Steps

After adding all secrets:

1. ✅ Enable GitHub Actions (if not already enabled)
2. ✅ Set up branch protection rules
3. ✅ Test the pipeline with a push
4. ✅ Review first workflow run
5. ✅ Configure notifications (optional)

---

## 📞 Support

If you need help:

1. Check the [Quick Start Guide](./CI_CD_QUICK_START.md)
2. Review [Complete Guide](./CI_CD_COMPLETE_GUIDE.md)
3. Check GitHub Actions logs
4. Create an issue in the repository

---

**Created:** January 23, 2026  
**Last Updated:** January 23, 2026  
**Estimated Setup Time:** 15 minutes
