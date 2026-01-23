# 🚀 Continuous Deployment (CD) Pipeline Guide

## Overview

Your First Responder Connect project has a fully automated CD pipeline that deploys to Vercel after every update for QA testing.

---

## 📋 What's Configured

### ✅ Automatic Deployments

**Every time you push to `main` branch:**
1. ✅ Code is automatically built
2. ✅ Deployed to Vercel Staging (QA environment)
3. ✅ Health checks run automatically
4. ✅ You get a deployment URL within 5 minutes

### 🎯 Deployment Environments

| Environment | Trigger | Purpose | URL |
|------------|---------|---------|-----|
| **Staging (QA)** | Automatic on push to `main` | Testing & QA | Auto-generated preview URL |
| **Production** | Manual (workflow_dispatch) | Live users | https://first-responder-connect.vercel.app |

---

## 🔄 How It Works

### Automatic QA Deployment (After Every Update)

```bash
# 1. Make your changes
git add .
git commit -m "feat: Add new feature"

# 2. Push to main
git push origin main

# 3. GitHub Actions automatically:
#    - Builds your app
#    - Deploys to Vercel staging
#    - Runs health checks
#    - Gives you a preview URL
```

**Timeline:**
- ⏱️ Build: 2-3 minutes
- ⏱️ Deploy: 1-2 minutes
- ⏱️ Health Check: 10 seconds
- **Total: ~5 minutes**

---

## 📊 Monitor Deployments

### View Workflow Runs
👉 https://github.com/esteban572/first-responder-connect/actions

You'll see:
- ✅ Green checkmark = Successful deployment
- ❌ Red X = Failed (check logs)
- 🟡 Yellow dot = In progress

### Get Deployment URL

1. Click on the workflow run
2. Click on "Deploy to Staging" job
3. Look for "Deploy to Vercel (Staging)" step
4. Copy the preview URL from the logs

---

## 🎮 Manual Production Deployment

When you're ready to deploy to production:

### Option 1: GitHub UI

1. Go to: https://github.com/esteban572/first-responder-connect/actions/workflows/deploy.yml
2. Click **Run workflow** button
3. Select **production** from dropdown
4. Click **Run workflow**
5. Wait for approval (if configured)
6. Production deploys automatically

### Option 2: Command Line

```bash
# Trigger production deployment via GitHub CLI
gh workflow run deploy.yml -f environment=production
```

---

## 🔧 Configured Secrets

Your pipeline uses these GitHub secrets (already configured):

| Secret | Purpose | Value |
|--------|---------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://ibatkglpnvqjserqfjmm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key | `eyJhbGci...` (configured) |
| `DOCKER_USERNAME` | Docker Hub username | `esteban572` |
| `DOCKER_PASSWORD` | Docker Hub token | `dckr_pat_...` (configured) |
| `VERCEL_TOKEN` | Vercel deployment token | Configured ✅ |
| `VERCEL_ORG_ID` | Vercel organization ID | `team_tRwlC8TwWzPenYLz0ir3IDOQ` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_RNFVkr3VOtGqSuSJgzlwAY4OSplP` |

---

## 🛠️ Workflow Files

Your CD pipeline consists of these workflows:

### 1. **deploy.yml** (Main CD Pipeline)
- **Location:** `.github/workflows/deploy.yml`
- **Triggers:** Push to `main`, manual workflow_dispatch
- **Jobs:**
  - `deploy-staging`: Automatic QA deployment
  - `deploy-production`: Manual production deployment
  - `rollback`: Emergency rollback

### 2. **app-ci.yml** (CI Pipeline)
- **Location:** `.github/workflows/app-ci.yml`
- **Triggers:** Pull requests, pushes
- **Purpose:** Run tests, linting, type checking

### 3. **code-quality.yml** (Quality Checks)
- **Location:** `.github/workflows/code-quality.yml`
- **Triggers:** Pull requests
- **Purpose:** Code quality and security scanning

### 4. **pr-checks.yml** (PR Validation)
- **Location:** `.github/workflows/pr-checks.yml`
- **Triggers:** Pull requests
- **Purpose:** Validate PR format and requirements

---

## 📝 Common Workflows

### Daily Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: Add new feature"

# 3. Push to GitHub
git push origin feature/new-feature

# 4. Create Pull Request
# - CI runs automatically
# - Code quality checks run
# - Review and merge

# 5. After merge to main
# - Automatic deployment to staging/QA
# - Test on staging URL
# - If good, manually deploy to production
```

### Emergency Rollback

If production has issues:

```bash
# Option 1: Via GitHub UI
# 1. Go to Actions → Deploy workflow
# 2. Run workflow → Select "rollback"
# 3. Confirm

# Option 2: Revert commit
git revert HEAD
git push origin main
# Then manually deploy to production
```

---

## 🎯 QA Testing Process

After every push to `main`:

1. **Wait for deployment** (~5 minutes)
2. **Get staging URL** from GitHub Actions logs
3. **Test your changes** on staging
4. **Verify everything works**
5. **Deploy to production** when ready

---

## 🔍 Troubleshooting

### Deployment Failed

**Check the logs:**
1. Go to Actions tab
2. Click on failed workflow
3. Click on failed job
4. Expand failed step
5. Read error message

**Common issues:**
- ❌ Build errors → Fix code and push again
- ❌ Secret not found → Check GitHub secrets
- ❌ Vercel error → Check Vercel token validity
- ❌ Health check failed → Check app startup

### Secrets Expired

If tokens expire:

1. **Vercel Token:** Regenerate at https://vercel.com/account/tokens
2. **Docker Token:** Regenerate at https://hub.docker.com/settings/security
3. Update in GitHub: Settings → Secrets → Actions → Update secret

### Deployment Stuck

If deployment hangs:

1. Cancel the workflow run
2. Check Vercel dashboard for issues
3. Re-run the workflow
4. If still stuck, check Vercel status page

---

## 📈 Best Practices

### ✅ Do's

- ✅ Always test on staging before production
- ✅ Use meaningful commit messages
- ✅ Monitor deployment logs
- ✅ Keep secrets up to date
- ✅ Review failed deployments immediately

### ❌ Don'ts

- ❌ Don't push directly to production
- ❌ Don't skip staging testing
- ❌ Don't ignore failed health checks
- ❌ Don't commit secrets to code
- ❌ Don't deploy on Fridays (unless necessary)

---

## 🔐 Security Notes

- All secrets are encrypted in GitHub
- Secrets are never exposed in logs
- Vercel deployments use secure tokens
- Database credentials are environment-specific
- Rotate tokens every 90 days

---

## 📞 Quick Reference

### Important Links

- **GitHub Repository:** https://github.com/esteban572/first-responder-connect
- **GitHub Actions:** https://github.com/esteban572/first-responder-connect/actions
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm

### Commands

```bash
# Check workflow status
gh run list --workflow=deploy.yml

# View latest deployment
gh run view

# Trigger production deployment
gh workflow run deploy.yml -f environment=production

# View deployment logs
gh run view --log
```

---

## 🎓 Understanding the Pipeline

### What Happens on Push to Main

```
Push to main
    ↓
GitHub Actions triggered
    ↓
Checkout code
    ↓
Setup Node.js
    ↓
Install dependencies (npm ci)
    ↓
Build app with Supabase credentials
    ↓
Deploy to Vercel staging
    ↓
Run health check (curl)
    ↓
✅ Success! Get preview URL
```

### What Happens on Production Deploy

```
Manual trigger (workflow_dispatch)
    ↓
Checkout code
    ↓
Setup Node.js
    ↓
Install dependencies
    ↓
Run tests (npm run test)
    ↓
Build for production
    ↓
Deploy to Vercel production
    ↓
Run health check
    ↓
Send notification
    ↓
✅ Live on production!
```

---

## 📊 Deployment Metrics

Track these metrics:

- **Deployment Frequency:** How often you deploy
- **Lead Time:** Time from commit to deployment
- **Failure Rate:** % of failed deployments
- **Recovery Time:** Time to fix failed deployments

**Goal:** 
- Deploy multiple times per day
- < 5 minutes lead time
- < 5% failure rate
- < 10 minutes recovery time

---

## 🚀 Next Steps

### Enhancements You Can Add

1. **Slack Notifications:** Get notified on deployments
2. **Automated Tests:** Run E2E tests before production
3. **Performance Monitoring:** Track deployment performance
4. **Rollback Automation:** Auto-rollback on errors
5. **Deployment Approvals:** Require approval for production

### Monitoring & Observability

Consider adding:
- Sentry for error tracking
- Vercel Analytics for performance
- Uptime monitoring (UptimeRobot, Pingdom)
- Log aggregation (Logtail, Papertrail)

---

## ✅ Summary

**Your CD Pipeline:**
- ✅ Automatic QA deployment on every push to `main`
- ✅ Manual production deployment with safety checks
- ✅ Health checks and notifications
- ✅ Rollback capability
- ✅ Fully configured and ready to use

**Every update you make:**
1. Push to `main`
2. Wait 5 minutes
3. Test on staging URL
4. Deploy to production when ready

**That's it! Your CD pipeline is live! 🎉**

---

**Last Updated:** January 23, 2026  
**Status:** ✅ Active and Configured  
**Maintainer:** Esteban Ibarra
