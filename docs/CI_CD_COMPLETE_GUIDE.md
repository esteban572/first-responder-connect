# Complete CI/CD Pipeline Guide

Comprehensive guide to the First Responder Connect CI/CD pipeline.

## 📖 Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Automation Features](#automation-features)
4. [Configuration](#configuration)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The First Responder Connect CI/CD pipeline provides:

- ✅ Automated testing on every commit
- ✅ Code quality and security scanning
- ✅ Automatic deployment to staging
- ✅ Manual production deployment with approval
- ✅ Dependency updates every week
- ✅ Fast feedback (< 5 minutes)

### Pipeline Architecture

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────┐                    ┌──────────────┐
│   App CI     │                    │Code Quality  │
│              │                    │              │
│ • Build      │                    │ • Security   │
│ • Type Check │                    │ • Secrets    │
│ • Lint       │                    │ • CodeQL     │
│ • Tests      │                    │ • Docker     │
└──────┬───────┘                    └──────────────┘
       │
       ▼
┌──────────────┐
│Docker Build  │
│ & Push       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Deploy Staging│
│ (Automatic)  │
└──────────────┘
```

---

## Workflows

### 1. App CI/CD Pipeline (`app-ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### 1.1 Validate Build
- Installs dependencies
- Builds the application
- Uploads build artifacts
- **Duration:** ~2 minutes

#### 1.2 TypeScript Type Check
- Runs TypeScript compiler
- Checks for type errors
- Fails if any type errors found
- **Duration:** ~1 minute

#### 1.3 Lint Code
- Runs ESLint
- Checks code style
- Enforces coding standards
- **Duration:** ~30 seconds

#### 1.4 Security Vulnerability Scan
- Runs `npm audit`
- Scans with Snyk (if configured)
- Reports high-severity issues
- **Duration:** ~1 minute

#### 1.5 Run Tests
- Executes test suite
- Generates coverage report
- **Duration:** ~1-2 minutes

#### 1.6 Build & Push Docker Image
- Only runs on `main` branch
- Builds Docker image
- Pushes to Docker Hub
- Tags with branch name and SHA
- **Duration:** ~3-4 minutes

#### 1.7 Pipeline Summary
- Aggregates all job results
- Posts summary to GitHub
- **Duration:** ~10 seconds

**Total Duration:** ~5-8 minutes

---

### 2. Code Quality & Security (`code-quality.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Weekly schedule (Monday 9 AM UTC)
- Manual trigger

**Jobs:**

#### 2.1 Security Vulnerability Scan
- Runs `npm audit`
- Generates audit report
- Uploads report as artifact
- **Severity Threshold:** Moderate

#### 2.2 Secret Scanning
- Uses TruffleHog
- Scans entire codebase
- Detects hardcoded secrets
- Checks commit history

#### 2.3 Dependency Review
- Only on pull requests
- Reviews new dependencies
- Checks for license issues
- Blocks GPL-3.0, AGPL-3.0

#### 2.4 CodeQL Analysis
- Advanced security scanning
- Detects code vulnerabilities
- Finds security patterns
- Uploads to GitHub Security

#### 2.5 Docker Image Scan
- Scans Docker images with Trivy
- Detects OS vulnerabilities
- Checks for CVEs
- Reports critical/high issues

**Schedule:** Weekly on Mondays

---

### 3. PR Checks (`pr-checks.yml`)

**Triggers:**
- Pull request opened/edited/synchronized

**Jobs:**

#### 3.1 Validate PR Title
- Enforces semantic PR titles
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- Example: `feat: Add user profile page`

#### 3.2 Add Size Label
- Calculates PR size
- Labels: `size/XS`, `size/S`, `size/M`, `size/L`, `size/XL`
- Based on lines changed:
  - XS: < 10 lines
  - S: < 50 lines
  - M: < 200 lines
  - L: < 500 lines
  - XL: 500+ lines

#### 3.3 Quick Checks
- Fast build validation
- Checks for console.log statements
- **Duration:** ~2 minutes

#### 3.4 Post Summary Comment
- Posts automated comment on PR
- Shows all check results
- Updates on each push

---

### 4. Deployment (`deploy.yml`)

**Triggers:**
- Push to `main` (automatic staging)
- Manual workflow dispatch

**Environments:**

#### Staging (Automatic)
- Deploys on every push to `main`
- Uses staging Supabase instance
- Runs health checks
- No approval required

#### Production (Manual)
- Requires manual trigger
- Requires approval from maintainers
- Runs full test suite first
- Uses production Supabase instance
- Runs comprehensive health checks
- Sends deployment notifications

#### Rollback (Manual)
- Deploys previous version
- Emergency use only
- Requires approval

**Deployment Flow:**

```
Push to main
     ↓
Build & Test
     ↓
Deploy to Staging (automatic)
     ↓
Health Check
     ↓
✅ Staging Ready
     ↓
Manual Trigger for Production
     ↓
Approval Required
     ↓
Deploy to Production
     ↓
Health Check
     ↓
✅ Production Live
```

---

### 5. Release (`release.yml`)

**Triggers:**
- Push tag matching `v*.*.*`
- Manual workflow dispatch

**Jobs:**

#### 5.1 Create GitHub Release
- Generates changelog automatically
- Creates release notes
- Publishes GitHub release
- Tags version

#### 5.2 Tag Docker Image
- Builds Docker image
- Tags with version number
- Tags as `latest`
- Pushes to Docker Hub

#### 5.3 Create Deployment Issue
- Creates tracking issue
- Includes deployment checklist
- Assigns to team
- Links to release notes

**Example Release:**

```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Workflow automatically:
# 1. Creates GitHub release
# 2. Generates changelog
# 3. Builds Docker image
# 4. Creates deployment issue
```

---

## Automation Features

### Dependabot

**Configuration:** `.github/dependabot.yml`

**Features:**
- Updates npm dependencies weekly (Mondays)
- Updates GitHub Actions weekly
- Groups related updates
- Auto-assigns to you
- Labels PRs as `dependencies`

**Dependency Groups:**
- `patch-updates` - All patch version updates
- `react` - React ecosystem updates
- `radix-ui` - Radix UI components
- `dev-dependencies` - Development dependencies

**Schedule:** Every Monday at 9 AM UTC

### PR Templates

**Location:** `.github/PULL_REQUEST_TEMPLATE/`

**Includes:**
- Description section
- Type of change checklist
- Testing instructions
- Deployment notes
- Review checklist

### Issue Templates

**Location:** `.github/ISSUE_TEMPLATE/`

**Templates:**
1. **Bug Report** - Structured bug reporting
2. **Feature Request** - Feature suggestions

---

## Configuration

### Required GitHub Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard → Settings → API |
| `DOCKER_USERNAME` | Docker Hub username | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub token | Docker Hub → Account Settings → Security |
| `VERCEL_TOKEN` | Vercel deployment token | Vercel → Account → Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `vercel link` locally |
| `VERCEL_PROJECT_ID` | Vercel project ID | Run `vercel link` locally |

### Optional Secrets

| Secret Name | Description |
|-------------|-------------|
| `SNYK_TOKEN` | Snyk security scanning |
| `STAGING_SUPABASE_URL` | Staging environment URL |
| `STAGING_SUPABASE_ANON_KEY` | Staging environment key |
| `PROD_SUPABASE_URL` | Production environment URL |
| `PROD_SUPABASE_ANON_KEY` | Production environment key |

### Branch Protection Rules

Recommended settings for `main` branch:

1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Required checks:
     - Validate Build
     - TypeScript Type Check
     - Lint Code
     - Run Tests

---

## Best Practices

### 1. Commit Messages

Use conventional commits:

```
feat: Add user authentication
fix: Resolve login redirect issue
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify message service
perf: Optimize image loading
test: Add profile component tests
build: Update dependencies
ci: Improve workflow performance
chore: Update .gitignore
```

### 2. Pull Requests

- Keep PRs small (< 500 lines)
- Write descriptive titles
- Fill out PR template completely
- Link related issues
- Request reviews from team members

### 3. Testing

- Write tests for new features
- Maintain > 80% code coverage
- Test edge cases
- Include integration tests

### 4. Security

- Never commit secrets
- Use environment variables
- Review dependency updates
- Monitor security alerts
- Keep dependencies updated

### 5. Deployment

- Always deploy to staging first
- Run smoke tests after deployment
- Monitor error rates
- Have rollback plan ready
- Communicate deployments to team

---

## Troubleshooting

### Workflow Not Running

**Problem:** Workflow doesn't trigger on push

**Solutions:**
1. Check if Actions are enabled (Settings → Actions)
2. Verify workflow file syntax (use YAML validator)
3. Check branch name matches trigger
4. Review workflow permissions

### Build Failing

**Problem:** Build fails in CI but works locally

**Solutions:**
1. Check environment variables are set
2. Verify Node.js version matches
3. Clear npm cache: `npm ci` instead of `npm install`
4. Check for OS-specific dependencies

### Docker Build Failing

**Problem:** Docker image build fails

**Solutions:**
1. Test Dockerfile locally: `docker build -t test .`
2. Check build args are passed correctly
3. Verify base image is accessible
4. Review .dockerignore file

### Deployment Failing

**Problem:** Vercel deployment fails

**Solutions:**
1. Verify Vercel token is valid
2. Check project ID and org ID
3. Ensure build succeeds locally
4. Review Vercel deployment logs

### Tests Failing in CI

**Problem:** Tests pass locally but fail in CI

**Solutions:**
1. Check for environment-specific code
2. Verify test database is configured
3. Check for timing issues (add waits)
4. Review CI logs for specific errors

---

## Monitoring & Metrics

### GitHub Actions Usage

View usage: Settings → Billing → Actions

**Free tier limits:**
- 2,000 minutes/month for private repos
- Unlimited for public repos

**Typical usage:**
- ~5-8 minutes per push
- ~40-60 minutes per day (active development)
- ~800-1,200 minutes per month

### Success Metrics

Track these metrics:

1. **Build Success Rate** - Target: > 95%
2. **Average Build Time** - Target: < 5 minutes
3. **Time to Deploy** - Target: < 10 minutes
4. **Failed Deployments** - Target: < 5%
5. **Security Issues Found** - Track and resolve

---

## Advanced Features

### Custom Workflows

Create custom workflows for:
- Performance testing
- E2E testing
- Database migrations
- Backup and restore
- Monitoring and alerts

### Workflow Dispatch

Trigger workflows manually:

```bash
# Using GitHub CLI
gh workflow run deploy.yml -f environment=production

# Or via GitHub UI
Actions → Select workflow → Run workflow
```

### Caching

Optimize build times with caching:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Matrix Builds

Test across multiple versions:

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

---

## Security Considerations

### Secrets Management

- ✅ Use GitHub Secrets for sensitive data
- ✅ Never log secrets in workflows
- ✅ Rotate tokens regularly
- ✅ Use least-privilege access
- ✅ Enable secret scanning

### Dependency Security

- ✅ Review Dependabot PRs promptly
- ✅ Monitor security advisories
- ✅ Use `npm audit` regularly
- ✅ Pin critical dependencies
- ✅ Scan Docker images

### Code Security

- ✅ Enable CodeQL scanning
- ✅ Review security alerts
- ✅ Use TruffleHog for secrets
- ✅ Implement SAST tools
- ✅ Regular security audits

---

## Cost Optimization

### Reduce Action Minutes

1. **Use caching** - Cache dependencies
2. **Conditional jobs** - Skip unnecessary jobs
3. **Optimize builds** - Use faster build tools
4. **Parallel jobs** - Run jobs concurrently
5. **Self-hosted runners** - For high-volume projects

### Example Optimizations

```yaml
# Cache dependencies
- uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}

# Conditional execution
if: github.event_name == 'push' && github.ref == 'refs/heads/main'

# Parallel jobs
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
```

---

## Integration with Other Tools

### Slack Notifications

Add to workflow:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Discord Notifications

```yaml
- name: Discord Notification
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

### Sentry Error Tracking

```yaml
- name: Create Sentry Release
  uses: getsentry/action-release@v1
  with:
    environment: production
```

---

## Workflow Examples

### Example 1: Feature Development

```bash
# 1. Create feature branch
git checkout -b feat/user-profiles

# 2. Make changes
# ... code changes ...

# 3. Commit with conventional commit
git commit -m "feat: Add user profile page"

# 4. Push to GitHub
git push origin feat/user-profiles

# 5. Create PR
# GitHub Actions automatically:
# - Validates PR title ✅
# - Adds size label ✅
# - Runs quick checks ✅
# - Posts summary comment ✅

# 6. Merge PR
# GitHub Actions automatically:
# - Runs full CI pipeline ✅
# - Builds Docker image ✅
# - Deploys to staging ✅
```

### Example 2: Production Deployment

```bash
# 1. Ensure main branch is stable
git checkout main
git pull origin main

# 2. Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 3. GitHub Actions automatically:
# - Creates GitHub release ✅
# - Generates changelog ✅
# - Tags Docker image ✅
# - Creates deployment issue ✅

# 4. Manual production deployment
# Go to Actions → Deploy → Run workflow
# Select "production" environment
# Click "Run workflow"

# 5. Approve deployment
# Review deployment issue
# Approve in GitHub UI

# 6. Monitor deployment
# Check health checks
# Monitor error rates
# Verify critical features
```

### Example 3: Hotfix

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix the bug
# ... code changes ...

# 3. Commit and push
git commit -m "fix: Resolve critical authentication bug"
git push origin hotfix/critical-bug

# 4. Create PR to main
# CI runs automatically

# 5. After merge, deploy immediately
# Go to Actions → Deploy → Run workflow
# Select "production"
# Approve and deploy

# 6. Create hotfix release
git tag -a v1.0.1 -m "Hotfix: Authentication bug"
git push origin v1.0.1
```

---

## Maintenance

### Weekly Tasks

- [ ] Review Dependabot PRs
- [ ] Check security scan results
- [ ] Monitor workflow success rates
- [ ] Review failed builds

### Monthly Tasks

- [ ] Audit GitHub Actions usage
- [ ] Review and update workflows
- [ ] Check for workflow optimizations
- [ ] Update documentation

### Quarterly Tasks

- [ ] Security audit
- [ ] Dependency cleanup
- [ ] Workflow performance review
- [ ] Team training on new features

---

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Vercel Documentation](https://vercel.com/docs)

### Tools
- [Act](https://github.com/nektos/act) - Run Actions locally
- [actionlint](https://github.com/rhysd/actionlint) - Lint workflow files
- [GitHub CLI](https://cli.github.com/) - Manage workflows from terminal

### Community
- [GitHub Actions Community](https://github.community/c/code-to-cloud/github-actions)
- [Awesome Actions](https://github.com/sdras/awesome-actions)

---

**Last Updated:** January 23, 2026  
**Version:** 1.0  
**Maintained by:** Esteban Ibarra
