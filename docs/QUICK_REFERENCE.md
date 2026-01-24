# Quick Reference Guide
## Paranet - First Responder Professional Network

**Last Updated:** January 23, 2026

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/esteban572/first-responder-connect.git
cd first-responder-connect
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

---

## 📝 Common Commands

### Development
```bash
npm run dev              # Start dev server (localhost:8080)
npm run build            # Build for production
npm run preview          # Preview production build
```

### Testing
```bash
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run e2e              # E2E tests
npm run e2e:ui           # E2E with UI
```

### Code Quality
```bash
npm run lint             # Lint code
npm run typecheck        # Type check
npm run ci               # Full CI check
```

### Deployment
```bash
vercel                   # Deploy preview
vercel --prod            # Deploy production
vercel logs              # View logs
```

---

## 🗂️ Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # shadcn/ui components
│   ├── feed/      # Feed components
│   ├── groups/    # Group components
│   └── ...
├── lib/           # Services & utilities
├── pages/         # Page components
├── types/         # TypeScript types
└── contexts/      # React contexts
```

---

## 🔑 Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional
VITE_DAILY_API_KEY=your-daily-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🗄️ Database

### Common Queries

**Get posts:**
```typescript
const { data } = await supabase
  .from('posts')
  .select('*, profiles(*)')
  .order('created_at', { ascending: false });
```

**Create post:**
```typescript
const { data } = await supabase
  .from('posts')
  .insert({ user_id, content, image_url })
  .select()
  .single();
```

**Get user profile:**
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

---

## 🧪 Testing

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should load page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Paranet/);
});
```

---

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: Add new feature"

# Push and create PR
git push origin feature/my-feature
```

### Commit Message Format
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 🚢 Deployment

### Automatic (Recommended)
```bash
# Push to main triggers deployment
git push origin main
```

### Manual
```bash
vercel --prod
```

---

## 📊 Monitoring

### Vercel
- Dashboard: https://vercel.com/dashboard
- Logs: `vercel logs`
- Analytics: Vercel Dashboard → Analytics

### Supabase
- Dashboard: https://supabase.com/dashboard
- Logs: Dashboard → Logs
- Database: Dashboard → Database

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check for errors
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

### Tests Fail
```bash
# Run tests
npm run test

# Check specific test
npm run test -- path/to/test.ts
```

### Database Issues
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Check table exists
SELECT * FROM posts LIMIT 1;
```

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| [PRD](./PRD.md) | Product requirements |
| [Architecture](./ARCHITECTURE.md) | Technical details |
| [API Docs](./API_DOCUMENTATION.md) | API reference |
| [Implementation](./IMPLEMENTATION_GUIDE.md) | Dev guide |
| [Deployment](./DEPLOYMENT_GUIDE.md) | Deploy guide |
| [CI/CD](./CI_CD_SETUP.md) | CI/CD setup |

---

## 🔗 Useful Links

- **GitHub**: https://github.com/esteban572/first-responder-connect
- **Supabase**: https://supabase.com/dashboard
- **Vercel**: https://vercel.com/dashboard
- **React Docs**: https://react.dev
- **Supabase Docs**: https://supabase.com/docs
- **Playwright Docs**: https://playwright.dev

---

## 🆘 Quick Fixes

### Clear Cache
```bash
rm -rf node_modules package-lock.json
npm install
```

### Reset Database
```sql
-- In Supabase SQL Editor
-- Run DATABASE_SCHEMA.sql
```

### Reset Vercel
```bash
vercel --force
```

---

## 📞 Support

- **GitHub Issues**: Create issue in repository
- **Supabase Discord**: https://discord.supabase.com
- **Vercel Support**: support@vercel.com

---

**Quick Tips:**
- Always run `npm run ci` before pushing
- Use `npm run test:watch` during development
- Check GitHub Actions after pushing
- Monitor Vercel deployments
- Review Supabase logs for errors

---

**Document Control**
- **Created:** January 23, 2026
- **Owner:** Esteban Ibarra
