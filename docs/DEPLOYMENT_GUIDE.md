# Deployment Guide
## Paranet - First Responder Professional Network

**Version:** 1.0  
**Last Updated:** January 23, 2026

---

## Table of Contents
1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Setup](#3-environment-setup)
4. [Vercel Deployment](#4-vercel-deployment)
5. [GitHub Actions Setup](#5-github-actions-setup)
6. [Database Deployment](#6-database-deployment)
7. [Monitoring & Logging](#7-monitoring--logging)
8. [Rollback Procedures](#8-rollback-procedures)

---

## 1. Overview

### 1.1 Deployment Architecture

```
GitHub Repository (main branch)
  ↓ (push trigger)
GitHub Actions CI/CD
  ↓
  ├── Lint & Type Check
  ├── Run Tests
  ├── Build Application
  └── Security Scan
  ↓ (if all pass)
Vercel Deployment
  ↓
Production (paranet.app)
```

### 1.2 Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Production | `main` | paranet.app | Live production site |
| Staging | `develop` | staging.paranet.app | Pre-production testing |
| Preview | PR branches | pr-*.vercel.app | PR previews |

---

## 2. Prerequisites

### 2.1 Required Accounts

- [x] GitHub account with repo access
- [x] Vercel account (connected to GitHub)
- [x] Supabase project (production)
- [x] Supabase project (staging) - optional but recommended
- [ ] Sentry account (error tracking) - optional
- [ ] Codecov account (coverage) - optional

### 2.2 Required Secrets

**GitHub Secrets** (Settings → Secrets and variables → Actions):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SNYK_TOKEN (optional)
SLACK_WEBHOOK_URL (optional)
TEST_USER_EMAIL (for E2E tests)
TEST_USER_PASSWORD (for E2E tests)
```

**Vercel Environment Variables**:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_DAILY_API_KEY (optional)
VITE_STRIPE_PUBLISHABLE_KEY (optional)
VITE_REVENUECAT_API_KEY (optional)
```

---

## 3. Environment Setup

### 3.1 Local Development

```bash
# Clone repository
git clone https://github.com/esteban572/first-responder-connect.git
cd first-responder-connect

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev
```

### 3.2 Environment Variables

**Development (.env)**
```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_DAILY_API_KEY=your-daily-key
```

**Production (Vercel)**
```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_DAILY_API_KEY=your-daily-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Staging (Vercel)**
```env
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
VITE_DAILY_API_KEY=your-daily-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 4. Vercel Deployment

### 4.1 Initial Setup

**1. Connect GitHub Repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

**2. Configure Project Settings**

In Vercel Dashboard:
- Project Settings → General
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

**3. Set Environment Variables**

In Vercel Dashboard:
- Project Settings → Environment Variables
- Add all required variables
- Set scope: Production, Preview, Development

### 4.2 Automatic Deployments

**Production Deployment (main branch)**
```bash
# Merge to main triggers automatic deployment
git checkout main
git merge develop
git push origin main
```

**Preview Deployment (PR)**
```bash
# Create PR triggers preview deployment
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
```

### 4.3 Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Deploy specific branch
vercel --prod --branch=main
```

### 4.4 Deployment Verification

**Post-Deployment Checklist:**
- [ ] Site loads successfully
- [ ] Authentication works
- [ ] Database queries execute
- [ ] File uploads work
- [ ] No console errors
- [ ] Check Vercel logs
- [ ] Run smoke tests

---

## 5. GitHub Actions Setup

### 5.1 Configure GitHub Secrets

**Navigate to:** Repository → Settings → Secrets and variables → Actions

**Add the following secrets:**

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Optional: Security scanning
SNYK_TOKEN=your-snyk-token

# Optional: Notifications
SLACK_WEBHOOK_URL=your-slack-webhook

# E2E Testing
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password
```

### 5.2 Get Vercel Credentials

**Vercel Token:**
```bash
# Go to Vercel Dashboard
# Settings → Tokens → Create Token
# Copy token and add to GitHub secrets
```

**Vercel Org ID & Project ID:**
```bash
# Run in project directory
vercel link

# Check .vercel/project.json
cat .vercel/project.json
```

### 5.3 Workflow Files

**CI/CD Pipeline** (`.github/workflows/ci.yml`):
- Runs on push to main/develop
- Runs on pull requests
- Jobs: Lint, Test, Build, Security, Deploy

**E2E Tests** (`.github/workflows/e2e.yml`):
- Runs on push to main/develop
- Runs daily at 2 AM UTC
- Jobs: E2E tests, Visual regression, Lighthouse

### 5.4 Monitoring Workflows

**View workflow runs:**
- GitHub → Actions tab
- Click on workflow run
- View logs for each job

**Troubleshooting failed workflows:**
```bash
# Check logs in GitHub Actions
# Common issues:
# - Missing secrets
# - Build errors
# - Test failures
# - Deployment errors
```

---

## 6. Database Deployment

### 6.1 Supabase Production Setup

**1. Create Production Project**
- Go to supabase.com
- Create new project
- Choose region (closest to users)
- Note credentials

**2. Run Migrations**
```sql
-- In Supabase SQL Editor
-- Run DATABASE_SCHEMA.sql
-- Run all migration files in order
```

**3. Set Up Storage**
```bash
# Create buckets:
# - profile-media (public)
# - post-images (public)
# - credential-files (private)

# Configure RLS policies (see STORAGE_SETUP.md)
```

**4. Configure Authentication**
```bash
# Enable Google OAuth
# Add production redirect URI
# Configure email templates
```

### 6.2 Database Migrations

**Creating a migration:**
```bash
# Create migration file
touch supabase/migrations/$(date +%Y%m%d)_description.sql

# Write migration
nano supabase/migrations/20260123_add_feature.sql

# Test in staging
# Apply to production
```

**Migration checklist:**
- [ ] Test in local/staging first
- [ ] Backup production database
- [ ] Run during low-traffic period
- [ ] Monitor for errors
- [ ] Verify data integrity
- [ ] Have rollback plan ready

### 6.3 Database Backups

**Automatic backups:**
- Supabase Pro: Daily backups (7-day retention)
- Supabase Free: Point-in-time recovery (24 hours)

**Manual backup:**
```bash
# Export database
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  > backup_$(date +%Y%m%d).sql

# Restore database
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  < backup_20260123.sql
```

---

## 7. Monitoring & Logging

### 7.1 Vercel Analytics

**Enable Analytics:**
- Vercel Dashboard → Analytics
- View metrics: Page views, unique visitors, top pages

**Performance Monitoring:**
- Real User Monitoring (RUM)
- Core Web Vitals
- Response times

### 7.2 Supabase Monitoring

**Database Logs:**
- Supabase Dashboard → Logs → Database
- Filter by error level
- Search by query

**API Logs:**
- Supabase Dashboard → Logs → API
- View request/response
- Check error rates

### 7.3 Error Tracking (Optional)

**Sentry Setup:**
```bash
# Install Sentry
npm install @sentry/react @sentry/vite-plugin

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### 7.4 Uptime Monitoring

**Recommended tools:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Setup:**
- Monitor: https://paranet.app
- Check interval: 5 minutes
- Alert on: Down, slow response

---

## 8. Rollback Procedures

### 8.1 Vercel Rollback

**Via Dashboard:**
1. Go to Vercel Dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"

**Via CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### 8.2 Database Rollback

**Restore from backup:**
```bash
# Stop application (prevent writes)
# Restore database from backup
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  < backup_20260123.sql

# Verify data
# Restart application
```

**Revert migration:**
```sql
-- Create rollback migration
-- Example: Undo adding a column
ALTER TABLE posts DROP COLUMN new_column;
```

### 8.3 Emergency Procedures

**Critical bug in production:**
1. Immediately rollback to last known good deployment
2. Investigate issue in staging
3. Fix and test thoroughly
4. Deploy fix to production

**Database corruption:**
1. Stop application
2. Restore from latest backup
3. Verify data integrity
4. Resume application
5. Post-mortem analysis

**Security breach:**
1. Immediately take site offline
2. Rotate all secrets and API keys
3. Investigate breach
4. Patch vulnerability
5. Restore from clean backup
6. Bring site back online
7. Notify users if necessary

---

## 9. Deployment Checklist

### 9.1 Pre-Deployment

- [ ] All tests passing locally
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] Backup created

### 9.2 Deployment

- [ ] Merge to main branch
- [ ] Monitor GitHub Actions
- [ ] Verify Vercel deployment
- [ ] Check deployment logs
- [ ] Run smoke tests

### 9.3 Post-Deployment

- [ ] Verify site loads
- [ ] Test critical features
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Notify team
- [ ] Update documentation

---

## 10. Troubleshooting

### 10.1 Common Issues

**Build fails on Vercel:**
```bash
# Check build logs in Vercel
# Common causes:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues

# Solution:
# Fix errors locally first
# Ensure all env vars are set
# Check Node version compatibility
```

**Database connection fails:**
```bash
# Check Supabase status
# Verify connection string
# Check RLS policies
# Review API logs
```

**Slow performance:**
```bash
# Check Vercel Analytics
# Review database queries
# Optimize images
# Enable caching
# Use CDN
```

### 10.2 Getting Help

**Resources:**
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- GitHub Actions Docs: https://docs.github.com/actions

**Support:**
- Vercel Support: support@vercel.com
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create issue in repository

---

## 11. Best Practices

### 11.1 Deployment Strategy

- Deploy during low-traffic periods
- Use feature flags for gradual rollouts
- Always have a rollback plan
- Monitor closely after deployment
- Keep deployments small and frequent

### 11.2 Security

- Never commit secrets to repository
- Rotate API keys regularly
- Use environment-specific credentials
- Enable 2FA on all accounts
- Review security logs regularly

### 11.3 Performance

- Optimize bundle size
- Use lazy loading
- Enable caching
- Compress images
- Monitor Core Web Vitals

---

**Document Control**
- **Created:** January 23, 2026
- **Last Modified:** January 23, 2026
- **Owner:** Esteban Ibarra
