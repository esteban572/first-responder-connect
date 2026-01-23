# 🔑 Configure GitHub Secrets - Step-by-Step Guide

**Time Required:** 15 minutes  
**Difficulty:** Easy  
**Prerequisites:** GitHub account access, Supabase project, Docker Hub account, Vercel account

---

## 📍 Quick Navigation

1. [Where to Add Secrets](#where-to-add-secrets)
2. [Required Secrets (7)](#required-secrets)
3. [Optional Secrets](#optional-secrets)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

---

## Where to Add Secrets

### Step 1: Go to Repository Settings

1. Open your browser and go to:
   ```
   https://github.com/esteban572/first-responder-connect
   ```

2. Click the **Settings** tab (top menu bar)

3. In the left sidebar, click **Secrets and variables** → **Actions**

4. You'll see a green button: **New repository secret**

### Step 2: Add Each Secret

For each secret below:
1. Click **New repository secret**
2. Enter the **Name** (exactly as shown)
3. Paste the **Value**
4. Click **Add secret**

---

## Required Secrets

### 🗄️ Secret 1: VITE_SUPABASE_URL

**What it is:** Your Supabase project URL

**How to get it:**

1. Go to https://supabase.com/dashboard
2. Click on your **First Responder Connect** project
3. Click **Settings** (gear icon in sidebar)
4. Click **API**
5. Find **Project URL** section
6. Copy the URL (looks like: `https://abcdefghijklmnop.supabase.co`)

**Add to GitHub:**
```
Name:  VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co
```

✅ Click **Add secret**

---

### 🔐 Secret 2: VITE_SUPABASE_ANON_KEY

**What it is:** Your Supabase public/anonymous key

**How to get it:**

1. Same page as above (Settings → API)
2. Find **Project API keys** section
3. Copy the **anon** **public** key
4. It's a long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Add to GitHub:**
```
Name:  VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

✅ Click **Add secret**

---

### 🐳 Secret 3: DOCKER_USERNAME

**What it is:** Your Docker Hub username

**How to get it:**

Your Docker Hub username is: **esteban572**

**Add to GitHub:**
```
Name:  DOCKER_USERNAME
Value: esteban572
```

✅ Click **Add secret**

---

### 🔑 Secret 4: DOCKER_PASSWORD

**What it is:** Docker Hub access token (NOT your password!)

**How to get it:**

1. Go to https://hub.docker.com
2. Click your profile picture (top right) → **Account Settings**
3. Click **Security** tab (left sidebar)
4. Click **New Access Token** button
5. Fill in:
   - **Access Token Description:** `GitHub Actions - First Responder Connect`
   - **Access permissions:** Select **Read, Write, Delete**
6. Click **Generate**
7. **⚠️ IMPORTANT:** Copy the token immediately! You won't see it again!
   - It looks like: `dckr_pat_1234567890abcdefghijklmnop`

**Add to GitHub:**
```
Name:  DOCKER_PASSWORD
Value: dckr_pat_1234567890abcdefghijklmnop
```

✅ Click **Add secret**

---

### ▲ Secret 5: VERCEL_TOKEN

**What it is:** Vercel deployment token

**How to get it:**

1. Go to https://vercel.com/account/tokens
2. Click **Create Token** button
3. Fill in:
   - **Token Name:** `GitHub Actions - First Responder Connect`
   - **Scope:** Select **Full Account**
   - **Expiration:** Select **No Expiration** (or 1 year)
4. Click **Create Token**
5. **⚠️ IMPORTANT:** Copy the token immediately!
   - It looks like: `vercel_1234567890abcdefghijklmnop`

**Add to GitHub:**
```
Name:  VERCEL_TOKEN
Value: vercel_1234567890abcdefghijklmnop
```

✅ Click **Add secret**

---

### 🆔 Secret 6 & 7: VERCEL_ORG_ID and VERCEL_PROJECT_ID

**What they are:** Your Vercel organization and project identifiers

**How to get them (Easy Method - Using Vercel CLI):**

1. Open your terminal

2. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

3. Navigate to your project:
   ```bash
   cd /Users/estebanibarra/Documents/first-responder-connect
   ```

4. Link to Vercel:
   ```bash
   vercel link
   ```
   
   Follow the prompts:
   - **Set up and deploy?** → Yes
   - **Which scope?** → Select your account (esteban572)
   - **Link to existing project?** → Yes (if exists) or No (create new)
   - **What's your project's name?** → first-responder-connect

5. Get the IDs:
   ```bash
   cat .vercel/project.json
   ```

   You'll see:
   ```json
   {
     "orgId": "team_abc123xyz789",
     "projectId": "prj_def456uvw012"
   }
   ```

**Add to GitHub:**

**Secret 6:**
```
Name:  VERCEL_ORG_ID
Value: team_abc123xyz789
```
(or `user_abc123xyz789` if personal account)

✅ Click **Add secret**

**Secret 7:**
```
Name:  VERCEL_PROJECT_ID
Value: prj_def456uvw012
```

✅ Click **Add secret**

---

**Alternative Method (Without CLI):**

1. Go to https://vercel.com/dashboard
2. Click on your **First Responder Connect** project
3. Click **Settings**
4. Scroll to **General** section
5. Copy **Project ID**
6. For Org ID, click your team/account name → Settings → General → Copy **Team ID**

---

## 🔧 Optional Secrets (Recommended)

### SNYK_TOKEN (Advanced Security Scanning)

**What it is:** Snyk security scanning token for enhanced vulnerability detection

**How to get it:**

1. Go to https://snyk.io
2. Sign up for free account (or login)
3. Click your profile → **Account Settings**
4. Click **General** tab
5. Find **Auth Token** section
6. Click **Show** and copy the token

**Add to GitHub:**
```
Name:  SNYK_TOKEN
Value: your-snyk-token-here
```

**Benefits:**
- More detailed vulnerability reports
- Fix recommendations
- License compliance checking

---

### Staging Environment Secrets (If you have separate staging)

If you have a separate Supabase project for staging:

```
Name:  STAGING_SUPABASE_URL
Value: https://your-staging-project.supabase.co

Name:  STAGING_SUPABASE_ANON_KEY
Value: your-staging-anon-key
```

---

## ✅ Verification Checklist

After adding all secrets, verify you have:

- [ ] `VITE_SUPABASE_URL` ✓
- [ ] `VITE_SUPABASE_ANON_KEY` ✓
- [ ] `DOCKER_USERNAME` ✓
- [ ] `DOCKER_PASSWORD` ✓
- [ ] `VERCEL_TOKEN` ✓
- [ ] `VERCEL_ORG_ID` ✓
- [ ] `VERCEL_PROJECT_ID` ✓

### Visual Check

Your secrets page should look like this:

```
Repository secrets (7)

DOCKER_PASSWORD          Updated 1 minute ago
DOCKER_USERNAME          Updated 2 minutes ago
VERCEL_ORG_ID           Updated 3 minutes ago
VERCEL_PROJECT_ID       Updated 3 minutes ago
VERCEL_TOKEN            Updated 4 minutes ago
VITE_SUPABASE_ANON_KEY  Updated 5 minutes ago
VITE_SUPABASE_URL       Updated 5 minutes ago
```

---

## 🧪 Test Your Setup

### Step 1: Enable GitHub Actions

1. Go to https://github.com/esteban572/first-responder-connect/actions
2. If you see a message about workflows, click **I understand my workflows, go ahead and enable them**

### Step 2: Trigger a Test Run

```bash
# Navigate to your project
cd /Users/estebanibarra/Documents/first-responder-connect

# Create an empty commit to trigger the pipeline
git commit --allow-empty -m "ci: Test GitHub Actions pipeline"

# Push to GitHub
git push origin main
```

### Step 3: Watch It Run

1. Go to https://github.com/esteban572/first-responder-connect/actions
2. You should see a new workflow run starting
3. Click on it to watch the progress
4. All jobs should turn green ✅ in 5-8 minutes

### Expected Results

You should see these workflows running:

- ✅ **App CI/CD Pipeline** - Building, testing, deploying
- ✅ **Code Quality & Security** - Scanning for issues

If all jobs are green, your setup is complete! 🎉

---

## 🚨 Troubleshooting

### Problem: "Secret not found" error

**Solution:**
1. Check secret name matches exactly (case-sensitive)
2. No extra spaces in the value
3. Secret is added to repository (not organization)
4. Try re-adding the secret

### Problem: Docker push fails

**Error:** `unauthorized: authentication required`

**Solution:**
1. Verify `DOCKER_USERNAME` is exactly: `esteban572`
2. Regenerate Docker Hub token (make sure it has Write permissions)
3. Create the repository on Docker Hub first:
   - Go to https://hub.docker.com
   - Click **Create Repository**
   - Name: `first-responder-connect`
   - Visibility: Public or Private
   - Click **Create**

### Problem: Vercel deployment fails

**Error:** `Invalid token` or `Project not found`

**Solution:**
1. Regenerate Vercel token
2. Run `vercel link` again to get fresh IDs
3. Make sure project exists in Vercel dashboard
4. Check token hasn't expired

### Problem: Supabase connection fails

**Error:** `Invalid API key`

**Solution:**
1. Verify URL format: `https://xxx.supabase.co` (no trailing slash)
2. Copy anon key again (make sure it's the **anon public** key, not service_role)
3. Check project is not paused in Supabase
4. Verify you copied the entire key (it's very long)

### Problem: Workflows not running

**Solution:**
1. Check if Actions are enabled (Settings → Actions → General)
2. Verify workflow files are in `.github/workflows/`
3. Check YAML syntax is valid
4. Look for error messages in Actions tab

---

## 🔒 Security Best Practices

### ✅ Do's

- ✅ Use access tokens, not passwords
- ✅ Set token expiration dates
- ✅ Use least-privilege permissions
- ✅ Rotate tokens every 90 days
- ✅ Review secret access logs regularly

### ❌ Don'ts

- ❌ Never commit secrets to code
- ❌ Don't share secrets in PR comments
- ❌ Don't use the same token for multiple projects
- ❌ Don't give tokens more permissions than needed
- ❌ Don't disable secret scanning

---

## 📋 Quick Copy-Paste Checklist

Use this checklist while adding secrets:

```
□ Open GitHub repo settings
□ Navigate to Secrets and variables → Actions
□ Add VITE_SUPABASE_URL
□ Add VITE_SUPABASE_ANON_KEY
□ Add DOCKER_USERNAME
□ Add DOCKER_PASSWORD
□ Add VERCEL_TOKEN
□ Add VERCEL_ORG_ID
□ Add VERCEL_PROJECT_ID
□ Verify all 7 secrets are added
□ Enable GitHub Actions
□ Push test commit
□ Watch workflow run
□ Confirm all jobs pass ✅
```

---

## 🎯 What Happens After Setup

### Immediate Benefits

1. **Every time you push code:**
   - Automatic testing
   - Security scanning
   - Code quality checks
   - Build validation
   - Feedback in < 5 minutes

2. **Every Monday:**
   - Dependency updates
   - Security scans
   - Automated PRs from Dependabot

3. **Every Pull Request:**
   - Automatic validation
   - Size labeling
   - Summary comments
   - Required checks

4. **On Main Branch:**
   - Automatic staging deployment
   - Docker image build
   - Health checks

---

## 📞 Need Help?

### Resources

- **Quick Start Guide:** `docs/CI_CD_QUICK_START.md`
- **Complete Guide:** `docs/CI_CD_COMPLETE_GUIDE.md`
- **Visual Overview:** `docs/CI_CD_VISUAL_OVERVIEW.md`

### Common Questions

**Q: Do I need all 7 secrets?**  
A: Yes, all 7 are required for the full pipeline to work.

**Q: Can I use my Docker Hub password instead of a token?**  
A: No, you must use an access token for security reasons.

**Q: What if I don't have a Vercel account?**  
A: Sign up for free at https://vercel.com - it takes 2 minutes.

**Q: How often do I need to update these secrets?**  
A: Recommended every 90 days, or when you rotate credentials.

**Q: Are my secrets safe?**  
A: Yes! GitHub encrypts all secrets and never exposes them in logs.

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ All 7 secrets show in GitHub settings
2. ✅ Workflows run without "secret not found" errors
3. ✅ Docker images push to Docker Hub successfully
4. ✅ Vercel deployments complete
5. ✅ All jobs show green checkmarks

---

## 🚀 After Configuration

Once all secrets are configured:

1. **Enable Branch Protection:**
   - Settings → Branches → Add rule
   - Branch name: `main`
   - Enable: Require status checks to pass

2. **Set Up Notifications (Optional):**
   - Settings → Notifications
   - Enable email notifications for failed workflows

3. **Review First Run:**
   - Go to Actions tab
   - Watch your first workflow run
   - Verify all jobs pass

4. **Start Developing:**
   - Your pipeline is now active!
   - Every push triggers automatic checks
   - Focus on building features

---

## 📊 Expected Timeline

| Task | Time |
|------|------|
| Get Supabase keys | 2 min |
| Create Docker Hub token | 2 min |
| Create Vercel token | 2 min |
| Get Vercel IDs | 3 min |
| Add all secrets to GitHub | 5 min |
| Test pipeline | 1 min |
| **Total** | **15 min** |

---

## 🎓 Pro Tips

1. **Save tokens securely:** Use a password manager to store your tokens
2. **Document expiration dates:** Set calendar reminders to rotate tokens
3. **Test in staging first:** Always test changes in staging before production
4. **Monitor usage:** Check GitHub Actions usage in Settings → Billing
5. **Review logs:** Check workflow logs regularly for issues

---

## 📝 Notes

- Secrets are encrypted and never exposed in logs
- You can update secrets anytime without breaking workflows
- Deleting a secret will cause workflows to fail
- Secrets are available to all workflows in the repository
- You can't view secret values after adding them (only update/delete)

---

**Created:** January 23, 2026  
**Last Updated:** January 23, 2026  
**Status:** Ready to use  
**Estimated Setup Time:** 15 minutes

---

## ✨ You're Almost Done!

After adding these 7 secrets, your CI/CD pipeline will be fully operational. Every push will automatically:

- ✅ Build and test your code
- ✅ Scan for security issues
- ✅ Deploy to staging
- ✅ Give you feedback in < 5 minutes

**Ready to configure? Let's go! 🚀**
