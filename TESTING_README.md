# Testing Guide - First Responder Connect

**Created:** January 24, 2026  
**Purpose:** Manual testing workflow documentation and bug tracking  
**Status:** Ready for Testing

---

## 🎯 Quick Start

### 1. Start Testing Session

```bash
# Option 1: Use the automated script
bash scripts/start-testing.sh

# Option 2: Manual start
npm run dev
# Then open http://localhost:8080
```

### 2. Test Features

Follow the checklist in `TESTING_CHECKLIST.md`:
- 60+ features to test
- Organized by workflow
- Check off as you complete

### 3. Log Bugs

```bash
# Option 1: Interactive bug logger
bash scripts/log-bug.sh

# Option 2: Manual logging
# Edit TESTING_BUGS.md directly using the template
```

---

## 📁 Testing Files

### Core Files

| File | Purpose |
|------|---------|
| `TESTING_BUGS.md` | Bug tracking log |
| `TESTING_CHECKLIST.md` | Feature testing checklist (60+ items) |
| `TESTING_SESSION.md` | Session notes and statistics |
| `TESTING_README.md` | This file - testing guide |

### Helper Scripts

| Script | Purpose |
|--------|---------|
| `scripts/start-testing.sh` | Start testing environment |
| `scripts/log-bug.sh` | Interactive bug logger |

---

## 🧪 Testing Workflow

### Phase 1: Setup
1. Start dev server: `npm run dev`
2. Open browser: http://localhost:8080
3. Have testing files ready

### Phase 2: Test Features
1. Open `TESTING_CHECKLIST.md`
2. Test each feature systematically
3. Check off completed items
4. Take notes in `TESTING_SESSION.md`

### Phase 3: Log Bugs
When you find a bug:

**Option A: Quick Logger (Recommended)**
```bash
bash scripts/log-bug.sh
```
Follow the prompts to log:
- Bug title
- Severity (Critical/High/Medium/Low)
- Workflow/feature affected
- Steps to reproduce
- Expected vs actual behavior
- Console errors

**Option B: Manual Logging**
1. Open `TESTING_BUGS.md`
2. Copy the bug template
3. Fill in all details
4. Update bug count

### Phase 4: Review & Prioritize
1. Review all bugs in `TESTING_BUGS.md`
2. Prioritize by severity
3. Create GitHub issues for critical bugs
4. Plan fixes

---

## 📋 Testing Checklist Overview

### Core Features (60+ items)

1. **Authentication & User Management** (6 items)
   - Landing page, OAuth, profile creation, editing, photo upload, sign out

2. **Social Features** (7 items)
   - Feed, create posts, images, likes, comments, delete, view profiles

3. **Connections** (6 items)
   - Send requests, view pending, accept, reject, view list, mutual connections

4. **Direct Messaging** (6 items)
   - Start conversation, send/receive, read receipts, history, notifications

5. **Job Board** (7 items)
   - Browse, filter by location/role, view details, apply, upload resume, status

6. **Credentials** (6 items)
   - Add, upload certificate, edit, delete, view showcase, share URL

7. **Organizations/Agencies** (8 items)
   - Create, upload logo, invite members, generate link, accept invite, view members, change roles, remove

8. **Groups** (8 items)
   - Create public/private, join, request join, approve, post, leave

9. **Additional Features** (9 items)
   - Search, notifications, blog, events, reviews

10. **Admin Features** (5 items)
    - Dashboard, reported content, moderation, ban user, analytics

---

## 🐛 Bug Logging Template

```markdown
### Bug #X: [Short Description]
- **Severity:** Critical / High / Medium / Low
- **Workflow:** [Which workflow/feature]
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
  3. Step 3
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Console Errors:** [If any]
- **Status:** Open / In Progress / Fixed
- **Found:** YYYY-MM-DD
```

### Severity Guidelines

- **Critical:** App crashes, data loss, security issues, can't use core features
- **High:** Major feature broken, workaround exists but difficult
- **Medium:** Feature partially broken, easy workaround available
- **Low:** Minor UI issues, typos, cosmetic problems

---

## 🎨 Testing Best Practices

### 1. Systematic Approach
- Test one workflow at a time
- Complete all items in a section before moving on
- Don't skip items

### 2. Document Everything
- Take screenshots of bugs
- Copy console errors
- Note exact steps to reproduce

### 3. Test Edge Cases
- Empty inputs
- Very long inputs
- Special characters
- Multiple rapid clicks
- Network issues (offline mode)

### 4. Cross-Browser Testing
Test in multiple browsers:
- Chrome/Chromium
- Firefox
- Safari
- Edge

### 5. Responsive Testing
Test on different screen sizes:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

---

## 📊 Progress Tracking

### View Current Status

```bash
# View bug summary
grep "Total Bugs Found" TESTING_BUGS.md

# View checklist progress
grep -c "- \[x\]" TESTING_CHECKLIST.md

# View all bugs
cat TESTING_BUGS.md
```

### Update Progress

After each testing session:
1. Update `TESTING_SESSION.md` with session notes
2. Mark completed items in `TESTING_CHECKLIST.md`
3. Update bug counts in `TESTING_BUGS.md`

---

## 🚀 Testing Commands

### Start Testing
```bash
# Automated setup
bash scripts/start-testing.sh

# Manual start
npm run dev
open http://localhost:8080
```

### Log Bugs
```bash
# Interactive logger
bash scripts/log-bug.sh

# View bugs
cat TESTING_BUGS.md
```

### View Progress
```bash
# Checklist
cat TESTING_CHECKLIST.md

# Session notes
cat TESTING_SESSION.md

# Bug summary
grep "📊 Testing Summary" -A 10 TESTING_BUGS.md
```

### Stop Testing
```bash
# Stop dev server
pkill -f 'vite'

# Or use Ctrl+C in the terminal running npm run dev
```

---

## 🔍 Common Issues

### Dev Server Won't Start
```bash
# Check if port is in use
lsof -i :8080

# Kill existing process
pkill -f 'vite'

# Try again
npm run dev
```

### Can't Log In
- Check Supabase configuration
- Verify `.env` file exists
- Check Google OAuth settings
- View console for errors

### Features Not Working
- Check console for errors
- Verify database connection
- Check RLS policies
- Review network tab

---

## 📸 Screenshots

Store screenshots in: `docs/testing-screenshots/`

Naming convention:
- `bug-[number]-[description].png`
- `feature-[name]-working.png`
- `error-[description].png`

---

## 🎯 Testing Goals

### Short Term (This Session)
- [ ] Test all authentication flows
- [ ] Test core social features
- [ ] Log all critical bugs
- [ ] Document workarounds

### Medium Term (This Week)
- [ ] Complete full feature checklist
- [ ] Test all edge cases
- [ ] Cross-browser testing
- [ ] Responsive testing

### Long Term (This Month)
- [ ] Fix all critical bugs
- [ ] Fix all high priority bugs
- [ ] Performance testing
- [ ] Security testing

---

## 📞 Support

### Getting Help

1. Check console errors first
2. Review workflow documentation in `docs/WORKFLOWS.md`
3. Check technical workflows in `docs/TECHNICAL_WORKFLOWS.md`
4. Review architecture in `docs/ARCHITECTURE.md`

### Reporting Issues

For bugs that need immediate attention:
1. Log in `TESTING_BUGS.md` with severity "Critical"
2. Create GitHub issue
3. Notify team

---

## 📈 Success Metrics

### Quality Targets
- [ ] 95%+ features working
- [ ] 0 critical bugs
- [ ] < 5 high priority bugs
- [ ] All core workflows functional

### Testing Coverage
- [ ] 100% of checklist items tested
- [ ] All browsers tested
- [ ] All screen sizes tested
- [ ] Edge cases documented

---

## 🎓 Resources

### Documentation
- [Workflows](./docs/WORKFLOWS.md) - User workflow diagrams
- [Technical Workflows](./docs/TECHNICAL_WORKFLOWS.md) - Technical processes
- [Architecture](./docs/ARCHITECTURE.md) - System architecture
- [API Documentation](./docs/API_DOCUMENTATION.md) - API reference

### Tools
- Browser DevTools (F12)
- React DevTools extension
- Network tab for API calls
- Console for errors

---

**Happy Testing! 🧪**

Remember: Every bug you find makes the app better!

---

**Last Updated:** January 24, 2026  
**Next Review:** After first testing session
