# CI/CD Quick Start Guide (15 Minutes)

Get your First Responder Connect CI/CD pipeline up and running in 15 minutes.

## 📋 Prerequisites

- GitHub repository access
- Docker Hub account (free)
- Vercel account (free)
- 15 minutes of your time

## 🚀 Quick Setup (3 Steps)

### Step 1: Configure GitHub Secrets (5 minutes)

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Required Secrets

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

DOCKER_USERNAME=esteban572
DOCKER_PASSWORD=your-docker-hub-token

VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

#### Optional Secrets (for advanced features)

```
SNYK_TOKEN=your-snyk-token
STAGING_SUPABASE_URL=your-staging-url
STAGING_SUPABASE_ANON_KEY=your-staging-key
PROD_SUPABASE_URL=your-prod-url
PROD_SUPABASE_ANON_KEY=your-prod-key
```

### Step 2: Enable GitHub Actions (2 minutes)

1. Go to repository → Actions tab
2. Click "I understand my workflows, go ahead and enable them"
3. Done! ✅

### Step 3: Push Code (1 minute)

```bash
git add .
git commit -m "ci: Add GitHub Actions CI/CD pipeline"
git push origin main
```

## ✅ Verification (2 minutes)

1. Go to Actions tab in GitHub
2. You should see workflows running
3. Wait for all checks to complete (3-5 minutes)
4. All should be green ✅

## 🎉 You're Done!

Your CI/CD pipeline is now active! Every push will:

- ✅ Run tests automatically
- ✅ Check code quality
- ✅ Scan for security issues
- ✅ Build Docker image
- ✅ Deploy to staging (on main branch)

## 🔧 How to Get Secrets

### Docker Hub Token

1. Go to https://hub.docker.com
2. Account Settings → Security → New Access Token
3. Copy the token

### Vercel Token

1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy the token

### Vercel Org ID & Project ID

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
cd first-responder-connect
vercel link

# Get IDs from .vercel/project.json
cat .vercel/project.json
```

### Supabase Keys

1. Go to your Supabase project
2. Settings → API
3. Copy Project URL and anon/public key

## 📚 Next Steps

- Read the [Complete Pipeline Guide](./CI_CD_COMPLETE_GUIDE.md)
- Set up [deployment environments](./DEPLOYMENT_GUIDE.md)
- Configure [notifications](./NOTIFICATIONS_GUIDE.md)

## 🆘 Troubleshooting

### Workflows not running?

- Check if Actions are enabled in repository settings
- Verify workflow files are in `.github/workflows/`
- Check branch protection rules

### Build failing?

- Verify all secrets are set correctly
- Check workflow logs for specific errors
- Ensure dependencies are up to date

### Docker push failing?

- Verify Docker Hub credentials
- Check if repository exists on Docker Hub
- Ensure you have push permissions

## 💡 Pro Tips

1. **Use branch protection** - Require PR checks to pass before merging
2. **Enable auto-merge** - Let Dependabot PRs merge automatically
3. **Set up notifications** - Get Slack/Discord alerts for failures
4. **Monitor costs** - GitHub Actions has 2,000 free minutes/month

---

**Setup Time:** ~15 minutes  
**Maintenance:** Minimal (automated updates)  
**Cost:** Free (within GitHub limits)
