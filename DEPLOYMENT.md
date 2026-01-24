# 🚀 Deployment Guide - First Responder Connect

## Overview

This project uses **Vercel** for hosting with **GitHub Actions** for continuous deployment (CD).

---

## 📦 Current Deployment

- **Project Name:** paranet-app
- **Production URL:** https://paranet-app.vercel.app
- **Preview URL:** https://paranet-dt8l45e0n-esteban-ibarras-projects-30cb10dd.vercel.app
- **Vercel Dashboard:** https://vercel.com/esteban-ibarras-projects-30cb10dd/paranet-app

### Project IDs
- **Project ID:** `prj_Fjj8iE1E9zQA5IFAkJQr5iG7kByi`
- **Org ID:** `team_tRwlC8TwWzPenYLz0ir3IDOQ`

---

## 🔄 How CD Works

### Automatic Deployments

**Every push to `main` branch:**
1. ✅ GitHub Actions triggers automatically
2. ✅ Builds your Vite app with environment variables
3. ✅ Deploys to Vercel preview environment
4. ✅ You get a preview URL in ~2-3 minutes

**On Pull Requests:**
1. ✅ Deploys a unique preview for the PR
2. ✅ Comments on PR with preview link
3. ✅ Perfect for testing before merging

### Manual Production Deployment

**To deploy to production:**
1. Go to: https://github.com/esteban572/first-responder-connect/actions
2. Click on "Deploy to Vercel" workflow
3. Click "Run workflow" button
4. Check "Deploy to production" checkbox
5. Click "Run workflow"
6. Wait ~3 minutes for production deployment

---

## ⚙️ GitHub Secrets Configuration

You need to configure these secrets in your GitHub repository:

**Go to:** Repository Settings → Secrets and variables → Actions → New repository secret

### Required Secrets

| Secret Name | Description | Where to Get It |
|------------|-------------|-----------------|
| `VERCEL_TOKEN` | Vercel authentication token | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Already known: `team_tRwlC8TwWzPenYLz0ir3IDOQ` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Already known: `prj_Fjj8iE1E9zQA5IFAkJQr5iG7kByi` |

### How to Get VERCEL_TOKEN

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: `GitHub Actions - First Responder Connect`
4. Select scope: Full Account
5. Click "Create"
6. Copy the token (you'll only see it once!)
7. Add it to GitHub Secrets as `VERCEL_TOKEN`

---

## 🔐 Environment Variables

Environment variables are managed in **Vercel Dashboard**, not in GitHub.

### Already Configured in Vercel

✅ `VITE_SUPABASE_URL` - https://ibatkglpnvqjserqfjmm.supabase.co  
✅ `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key  
✅ `VITE_REVENUECAT_API_KEY` - test_NsbPkLJgEuCyHtnPyWjHwdEFMxz

### To Add More Environment Variables

**Option 1: Via Vercel CLI**
```bash
# Add to production
echo "your-value" | vercel env add VARIABLE_NAME production

# Add to preview
echo "your-value" | vercel env add VARIABLE_NAME preview
```

**Option 2: Via Vercel Dashboard**
1. Go to https://vercel.com/esteban-ibarras-projects-30cb10dd/paranet-app/settings/environment-variables
2. Click "Add New"
3. Enter name and value
4. Select environments (Production, Preview, Development)
5. Click "Save"

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build locally
npm run build

# Preview production build
npm run preview
```

---

## 📝 Deployment Workflow

### Daily Development

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Push to main
git push origin main

# 3. GitHub Actions automatically:
#    ✅ Builds the app
#    ✅ Deploys to preview
#    ✅ Gives you a URL

# 4. Check deployment status
# Go to: https://github.com/esteban572/first-responder-connect/actions
```

### Feature Branch Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: implement my feature"

# 3. Push branch
git push origin feature/my-feature

# 4. Create Pull Request on GitHub
# GitHub Actions will deploy a preview and comment on PR

# 5. Review, test, then merge to main
# After merge, automatic preview deployment happens
```

### Production Deployment

```bash
# 1. Ensure main branch is stable and tested
# 2. Go to GitHub Actions
# 3. Manually trigger production deployment
# 4. Verify at https://paranet-app.vercel.app
```

---

## 🔍 Monitoring Deployments

### GitHub Actions
- **View all deployments:** https://github.com/esteban572/first-responder-connect/actions
- **Check logs:** Click on any workflow run → Click on "Deploy" job
- **See deployment URL:** Check the job summary

### Vercel Dashboard
- **All deployments:** https://vercel.com/esteban-ibarras-projects-30cb10dd/paranet-app
- **Analytics:** View performance, errors, and usage
- **Logs:** Real-time function logs and build logs

---

## 🚨 Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click on failed workflow
3. Click on "Deploy" job
4. Read error messages

**Common issues:**

❌ **Build errors** → Fix TypeScript/ESLint errors locally first
```bash
npm run build
npm run typecheck
npm run lint
```

❌ **Missing secrets** → Verify all GitHub secrets are set correctly

❌ **Vercel token expired** → Generate new token and update GitHub secret

❌ **Environment variables missing** → Add them in Vercel dashboard

### Preview URL Not Working

1. Check if deployment completed successfully in GitHub Actions
2. Wait 1-2 minutes for DNS propagation
3. Check Vercel dashboard for deployment status
4. Verify environment variables are set in Vercel

### Production Deployment Issues

1. Ensure you triggered production deployment (not just preview)
2. Check Vercel dashboard for production deployment status
3. Verify production environment variables are set
4. Check for any build errors in logs

---

## 📊 Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] Tested on preview deployment
- [ ] Environment variables are correct
- [ ] Database migrations applied (if any)
- [ ] No console errors in browser

---

## 🔄 Rollback

If production has issues:

**Option 1: Redeploy Previous Version (Vercel Dashboard)**
1. Go to https://vercel.com/esteban-ibarras-projects-30cb10dd/paranet-app
2. Find the last working deployment
3. Click "..." → "Promote to Production"

**Option 2: Git Revert**
```bash
# Revert the problematic commit
git revert HEAD
git push origin main

# This triggers automatic preview deployment
# Then manually deploy to production via GitHub Actions
```

---

## 📈 Best Practices

### ✅ Do's

- ✅ Test on preview before deploying to production
- ✅ Use meaningful commit messages
- ✅ Keep environment variables in Vercel, not in code
- ✅ Monitor deployment logs
- ✅ Deploy during low-traffic hours for major changes

### ❌ Don'ts

- ❌ Don't commit `.env` files
- ❌ Don't push directly to production without testing
- ❌ Don't skip the build check locally
- ❌ Don't ignore deployment failures
- ❌ Don't deploy on Fridays (unless necessary 😄)

---

## 🔗 Quick Links

- **GitHub Repository:** https://github.com/esteban572/first-responder-connect
- **GitHub Actions:** https://github.com/esteban572/first-responder-connect/actions
- **Vercel Dashboard:** https://vercel.com/esteban-ibarras-projects-30cb10dd/paranet-app
- **Production Site:** https://paranet-app.vercel.app
- **Vercel Tokens:** https://vercel.com/account/tokens
- **GitHub Secrets:** https://github.com/esteban572/first-responder-connect/settings/secrets/actions

---

## 📞 Support

**Deployment Issues:**
- Check GitHub Actions logs first
- Review Vercel deployment logs
- Verify all secrets and environment variables

**Need Help?**
- Vercel Documentation: https://vercel.com/docs
- GitHub Actions Docs: https://docs.github.com/en/actions

---

**Last Updated:** January 24, 2026  
**Status:** ✅ Active and Configured  
**Maintainer:** Esteban Ibarra
