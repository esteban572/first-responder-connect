# CI/CD Setup Guide
## Paranet - First Responder Professional Network

**Version:** 1.0  
**Last Updated:** January 23, 2026

---

## Overview

This project uses **GitHub Actions** for continuous integration and continuous deployment (CI/CD). The pipeline automatically runs tests, builds the application, and deploys to Vercel on every push to main/develop branches.

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Push/PR                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions Trigger                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  CI Pipeline     │                  │  E2E Pipeline    │
│  (.github/       │                  │  (.github/       │
│   workflows/     │                  │   workflows/     │
│   ci.yml)        │                  │   e2e.yml)       │
└──────────────────┘                  └──────────────────┘
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│ 1. Code Quality  │                  │ 1. E2E Tests     │
│    - ESLint      │                  │    - Playwright  │
│    - TypeScript  │                  │                  │
└──────────────────┘                  │ 2. Visual Tests  │
        ↓                             │    - Screenshots │
┌──────────────────┐                  │                  │
│ 2. Unit Tests    │                  │ 3. Performance   │
│    - Vitest      │                  │    - Lighthouse  │
│    - Coverage    │                  │                  │
└──────────────────┘                  └──────────────────┘
        ↓
┌──────────────────┐
│ 3. Build         │
│    - Vite build  │
│    - Size check  │
└──────────────────┘
        ↓
┌──────────────────┐
│ 4. Security      │
│    - npm audit   │
│    - Snyk scan   │
└──────────────────┘
        ↓
┌──────────────────┐
│ 5. Deploy        │
│    - Vercel      │
│    (main only)   │
└──────────────────┘
        ↓
┌──────────────────┐
│ 6. Notify        │
│    - Slack       │
│    (optional)    │
└──────────────────┘
```

---

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Job 1: Code Quality
- Runs ESLint
- Runs TypeScript type checking
- Fails if there are type errors
- Continues on ESLint warnings

#### Job 2: Unit Tests
- Runs Vitest unit tests
- Generates coverage report
- Uploads coverage to Codecov (optional)

#### Job 3: Build
- Builds production bundle
- Checks build size
- Uploads build artifacts
- Requires Quality and Test jobs to pass

#### Job 4: Security Scan
- Runs `npm audit`
- Runs Snyk security scan (optional)
- Continues on moderate vulnerabilities

#### Job 5: Deploy
- Deploys to Vercel
- Only runs on `main` branch pushes
- Requires Build job to pass

#### Job 6: Notify
- Sends Slack notification (optional)
- Runs after deployment
- Reports success/failure

### 2. E2E Testing Pipeline (`e2e.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Daily at 2 AM UTC (scheduled)

**Jobs:**

#### Job 1: E2E Tests
- Installs Playwright browsers
- Builds application
- Starts preview server
- Runs Playwright tests
- Uploads test reports and videos

#### Job 2: Visual Regression
- Runs visual regression tests
- Compares screenshots
- Uploads visual diffs on failure

#### Job 3: Lighthouse Audit
- Runs Lighthouse performance audit
- Checks Core Web Vitals
- Uploads performance reports

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
# Install Playwright
npm install -D @playwright/test

# Install coverage tools
npm install -D @vitest/coverage-v8

# Install wait-on for server startup
npm install -D wait-on
```

### Step 2: Configure GitHub Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions**

Add the following secrets:

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Optional
SNYK_TOKEN=your-snyk-token
SLACK_WEBHOOK_URL=your-slack-webhook
CODECOV_TOKEN=your-codecov-token

# E2E Testing
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password
```

### Step 3: Get Vercel Credentials

**Vercel Token:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Tokens
3. Create new token
4. Copy and add to GitHub secrets

**Vercel Org ID & Project ID:**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Get IDs
cat .vercel/project.json
```

### Step 4: Enable Workflows

Workflows are automatically enabled when you push the `.github/workflows/` directory to your repository.

```bash
git add .github/workflows/
git commit -m "feat: Add CI/CD pipelines"
git push origin main
```

### Step 5: Verify Setup

1. Go to **GitHub → Actions** tab
2. You should see workflows running
3. Check that all jobs pass
4. Verify deployment to Vercel

---

## Running Tests Locally

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install --with-deps

# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui

# Run E2E tests in headed mode (see browser)
npm run e2e:headed

# Debug E2E tests
npm run e2e:debug

# View test report
npm run e2e:report
```

### Type Checking

```bash
# Run TypeScript compiler
npm run typecheck
```

### Linting

```bash
# Run ESLint
npm run lint
```

### Full CI Check

```bash
# Run all checks (like CI does)
npm run ci
```

---

## Workflow Configuration

### Customizing Triggers

Edit `.github/workflows/ci.yml`:

```yaml
on:
  push:
    branches: [main, develop, staging]  # Add more branches
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight
```

### Customizing Jobs

**Skip a job:**
```yaml
jobs:
  security:
    if: false  # Disable this job
```

**Add a job:**
```yaml
jobs:
  custom-job:
    name: Custom Job
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Custom step"
```

### Environment-Specific Deployments

```yaml
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  steps:
    - uses: amondnet/vercel-action@v25
      with:
        vercel-args: '--env=staging'

deploy-production:
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: amondnet/vercel-action@v25
      with:
        vercel-args: '--prod'
```

---

## Monitoring & Debugging

### View Workflow Runs

1. Go to **GitHub → Actions** tab
2. Click on a workflow run
3. View logs for each job
4. Download artifacts

### Common Issues

**Issue: Workflow not triggering**
- Check branch name matches trigger
- Verify workflow file is in `.github/workflows/`
- Check workflow syntax with GitHub Actions validator

**Issue: Tests failing in CI but passing locally**
- Check environment variables
- Verify Node version matches
- Check for timing issues in tests
- Review CI logs for specific errors

**Issue: Deployment failing**
- Verify Vercel credentials
- Check environment variables in Vercel
- Review Vercel deployment logs
- Ensure build succeeds locally

**Issue: Slow CI runs**
- Use caching for dependencies
- Run jobs in parallel
- Reduce test timeout
- Optimize build process

### Debugging Tips

**Enable debug logging:**
```yaml
- name: Debug step
  run: |
    echo "Debug info"
    env
  env:
    ACTIONS_STEP_DEBUG: true
```

**SSH into runner (for debugging):**
```yaml
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
  if: failure()
```

---

## Performance Optimization

### Caching Dependencies

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # Caches node_modules
```

### Parallel Jobs

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20]
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
```

### Conditional Steps

```yaml
- name: Upload coverage
  if: success()  # Only run if previous steps succeeded
  uses: codecov/codecov-action@v4
```

---

## Security Best Practices

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use environment-specific secrets

### Dependency Security

```yaml
- name: Audit dependencies
  run: npm audit --audit-level=high
  
- name: Check for vulnerabilities
  uses: snyk/actions/node@master
```

### Code Scanning

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  
- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
```

---

## Advanced Features

### Matrix Builds

Test across multiple Node versions:

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

### Conditional Deployments

Deploy only on specific conditions:

```yaml
deploy:
  if: |
    github.ref == 'refs/heads/main' &&
    github.event_name == 'push' &&
    !contains(github.event.head_commit.message, '[skip ci]')
```

### Slack Notifications

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Artifact Management

```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build
    path: dist/
    retention-days: 7

- name: Download artifacts
  uses: actions/download-artifact@v4
  with:
    name: build
```

---

## Troubleshooting Guide

### Workflow Fails on Type Check

```bash
# Run locally to see errors
npm run typecheck

# Fix TypeScript errors
# Then commit and push
```

### Tests Pass Locally but Fail in CI

```bash
# Check for environment differences
# - Node version
# - Environment variables
# - Timing issues

# Run tests in CI mode locally
CI=true npm run test
```

### Build Fails in CI

```bash
# Check build logs
# Common issues:
# - Missing environment variables
# - Import errors
# - Type errors

# Build locally
npm run build
```

### Deployment Fails

```bash
# Check Vercel logs
vercel logs

# Verify environment variables
vercel env ls

# Test deployment locally
vercel --prod
```

---

## Maintenance

### Updating Dependencies

```bash
# Update GitHub Actions
# Edit .github/workflows/*.yml
# Update action versions (e.g., @v4 → @v5)

# Update npm dependencies
npm update

# Check for outdated packages
npm outdated
```

### Monitoring Workflow Health

- Review failed workflows weekly
- Update dependencies monthly
- Rotate secrets quarterly
- Review and optimize slow jobs

---

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Vercel CLI Docs](https://vercel.com/docs/cli)

### Tools
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Workflow Syntax Validator](https://rhysd.github.io/actionlint/)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

## Support

**Issues:**
- Create issue in GitHub repository
- Tag with `ci/cd` label

**Questions:**
- GitHub Discussions
- Team Slack channel

---

**Document Control**
- **Created:** January 23, 2026
- **Last Modified:** January 23, 2026
- **Owner:** Esteban Ibarra
