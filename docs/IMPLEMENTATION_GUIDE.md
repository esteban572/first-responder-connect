# Implementation Guide
## Paranet - First Responder Professional Network

**Version:** 1.0  
**Last Updated:** January 23, 2026

---

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Development Workflow](#2-development-workflow)
3. [Adding New Features](#3-adding-new-features)
4. [Database Changes](#4-database-changes)
5. [Testing](#5-testing)
6. [Deployment](#6-deployment)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Getting Started

### 1.1 Prerequisites

- **Node.js**: 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm**: 9+ (comes with Node.js)
- **Git**: Latest version
- **Supabase Account**: Free tier works
- **Code Editor**: VS Code recommended

### 1.2 Initial Setup

**1. Clone the repository**
```bash
git clone https://github.com/esteban572/first-responder-connect.git
cd first-responder-connect
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**4. Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### 1.3 Supabase Setup

**1. Create a Supabase project**
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Note your Project URL and anon key

**2. Run database migrations**
- Open Supabase SQL Editor
- Copy contents of `DATABASE_SCHEMA.sql`
- Execute the script

**3. Set up storage buckets**
- Create buckets: `profile-media`, `post-images`, `credential-files`
- Configure RLS policies (see `STORAGE_SETUP.md`)

**4. Configure authentication**
- Enable Google OAuth provider
- Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`

---

## 2. Development Workflow

### 2.1 Branch Strategy

```
main (production)
  ↓
develop (staging)
  ↓
feature/feature-name (your work)
```

**Creating a feature branch:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-notifications
```

### 2.2 Code Style

**TypeScript**
- Use TypeScript for all new files
- Define types in `src/types/`
- Avoid `any` type

**React Components**
- Use functional components with hooks
- Extract reusable logic to custom hooks
- Keep components small and focused

**Naming Conventions**
- Components: PascalCase (`UserProfile.tsx`)
- Files: camelCase (`userService.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Functions: camelCase (`getUserProfile`)

**File Organization**
```
src/
├── components/
│   └── feature/
│       ├── FeatureComponent.tsx
│       └── FeatureSubComponent.tsx
├── lib/
│   └── featureService.ts
├── types/
│   └── feature.ts
└── pages/
    └── FeaturePage.tsx
```

### 2.3 Commit Messages

Follow conventional commits:
```
feat: Add user notification system
fix: Resolve post image upload issue
refactor: Simplify group member queries
docs: Update API documentation
test: Add tests for credential service
chore: Update dependencies
```

### 2.4 Pull Request Process

**1. Create PR**
```bash
git push origin feature/add-notifications
```
Then create PR on GitHub

**2. PR Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Tested in browser

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

**3. Code Review**
- At least one approval required
- Address all comments
- Ensure CI passes

**4. Merge**
- Squash and merge to develop
- Delete feature branch

---

## 3. Adding New Features

### 3.1 Feature Development Checklist

- [ ] Define requirements
- [ ] Design database schema (if needed)
- [ ] Create types
- [ ] Implement service layer
- [ ] Create UI components
- [ ] Add to routing
- [ ] Write tests
- [ ] Update documentation

### 3.2 Example: Adding a New Feature

**Scenario:** Add a "Bookmarks" feature to save posts

**Step 1: Database Schema**

Create migration file: `supabase/migrations/20260123_add_bookmarks.sql`
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- RLS Policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);
```

**Step 2: Create Types**

`src/types/bookmark.ts`
```typescript
export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}
```

**Step 3: Create Service**

`src/lib/bookmarkService.ts`
```typescript
import { supabase } from './supabase';
import { Bookmark } from '@/types/bookmark';

export const bookmarkService = {
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addBookmark(postId: string): Promise<Bookmark> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ user_id: user.id, post_id: postId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeBookmark(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);
    
    if (error) throw error;
  },

  async isBookmarked(postId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();
    
    return !!data;
  }
};
```

**Step 4: Create UI Component**

`src/components/feed/BookmarkButton.tsx`
```typescript
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bookmarkService } from '@/lib/bookmarkService';
import { useToast } from '@/hooks/use-toast';

interface BookmarkButtonProps {
  postId: string;
}

export const BookmarkButton = ({ postId }: BookmarkButtonProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isBookmarked } = useQuery({
    queryKey: ['bookmark', postId],
    queryFn: () => bookmarkService.isBookmarked(postId),
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(postId);
      } else {
        await bookmarkService.addBookmark(postId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmark', postId]);
      queryClient.invalidateQueries(['bookmarks']);
      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Post bookmarked',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update bookmark',
        variant: 'destructive',
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleBookmark.mutate()}
    >
      <Bookmark className={isBookmarked ? 'fill-current' : ''} />
    </Button>
  );
};
```

**Step 5: Add to PostCard**

`src/components/feed/PostCard.tsx`
```typescript
import { BookmarkButton } from './BookmarkButton';

// Inside PostCard component
<div className="flex items-center gap-2">
  <LikeButton postId={post.id} />
  <CommentButton postId={post.id} />
  <BookmarkButton postId={post.id} />
</div>
```

**Step 6: Create Bookmarks Page**

`src/pages/Bookmarks.tsx`
```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { bookmarkService } from '@/lib/bookmarkService';
import { PostCard } from '@/components/feed/PostCard';

export const Bookmarks = () => {
  const { user } = useAuth();

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => bookmarkService.getBookmarks(user.id),
    enabled: !!user,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Saved Posts</h1>
      {bookmarks?.map((bookmark) => (
        <PostCard key={bookmark.id} postId={bookmark.post_id} />
      ))}
    </div>
  );
};
```

**Step 7: Add Route**

`src/App.tsx`
```typescript
import { Bookmarks } from './pages/Bookmarks';

// Inside Routes
<Route element={<ProtectedRoute />}>
  <Route path="/bookmarks" element={<Bookmarks />} />
</Route>
```

**Step 8: Add to Navigation**

`src/components/layout/DesktopSidebar.tsx`
```typescript
<NavLink to="/bookmarks" icon={Bookmark}>
  Bookmarks
</NavLink>
```

**Step 9: Write Tests**

`src/lib/bookmarkService.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { bookmarkService } from './bookmarkService';

describe('bookmarkService', () => {
  it('should add bookmark', async () => {
    const bookmark = await bookmarkService.addBookmark('post-id');
    expect(bookmark).toBeDefined();
    expect(bookmark.post_id).toBe('post-id');
  });

  it('should remove bookmark', async () => {
    await expect(
      bookmarkService.removeBookmark('post-id')
    ).resolves.not.toThrow();
  });
});
```

**Step 10: Update Documentation**

Add to `API_DOCUMENTATION.md`:
```markdown
## Bookmarks

### Get User Bookmarks
\`\`\`typescript
const bookmarks = await bookmarkService.getBookmarks(userId);
\`\`\`

### Add Bookmark
\`\`\`typescript
await bookmarkService.addBookmark(postId);
\`\`\`
```

---

## 4. Database Changes

### 4.1 Creating Migrations

**1. Create migration file**
```bash
# Format: YYYYMMDD_description.sql
touch supabase/migrations/20260123_add_feature.sql
```

**2. Write migration**
```sql
-- Add new table
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- columns
);

-- Add RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "policy_name"
  ON new_table FOR SELECT
  USING (true);

-- Add indexes
CREATE INDEX idx_new_table_column ON new_table(column);
```

**3. Test migration**
- Run in Supabase SQL Editor
- Verify tables created
- Test RLS policies

**4. Commit migration**
```bash
git add supabase/migrations/20260123_add_feature.sql
git commit -m "feat: Add database migration for new feature"
```

### 4.2 Modifying Existing Tables

**Adding a column:**
```sql
ALTER TABLE posts ADD COLUMN is_pinned BOOLEAN DEFAULT false;
```

**Modifying a column:**
```sql
ALTER TABLE posts ALTER COLUMN content TYPE TEXT;
```

**Adding an index:**
```sql
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned) WHERE is_pinned = true;
```

### 4.3 RLS Best Practices

**Always enable RLS:**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**Common policy patterns:**
```sql
-- Public read
CREATE POLICY "Anyone can view"
  ON table_name FOR SELECT
  USING (true);

-- Own records only
CREATE POLICY "Users can manage their own records"
  ON table_name FOR ALL
  USING (auth.uid() = user_id);

-- Organization members
CREATE POLICY "Organization members can view"
  ON table_name FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

---

## 5. Testing

### 5.1 Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test src/lib/postService.test.ts
```

### 5.2 Writing Unit Tests

**Service test example:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { postService } from './postService';

describe('postService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a post', async () => {
    const postData = {
      content: 'Test post',
      image_url: null,
      location: null,
    };

    const post = await postService.createPost(postData);
    
    expect(post).toBeDefined();
    expect(post.content).toBe('Test post');
    expect(post.likes_count).toBe(0);
  });

  it('should get posts', async () => {
    const posts = await postService.getPosts();
    
    expect(Array.isArray(posts)).toBe(true);
  });
});
```

### 5.3 Writing Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PostCard } from './PostCard';

describe('PostCard', () => {
  it('should render post content', () => {
    const post = {
      id: '1',
      content: 'Test post',
      user_id: 'user-1',
      likes_count: 5,
      comments_count: 2,
    };

    render(<PostCard post={post} />);
    
    expect(screen.getByText('Test post')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // likes
  });

  it('should handle like button click', async () => {
    const post = { /* ... */ };
    
    render(<PostCard post={post} />);
    
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    // Assert mutation was called
  });
});
```

### 5.4 Test Coverage

```bash
# Generate coverage report
npm run test -- --coverage
```

Target: 80% coverage for critical paths

---

## 6. Deployment

### 6.1 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Build succeeds locally

### 6.2 Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

### 6.3 Deploying to Vercel

**Automatic deployment (recommended):**
1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Check deployment status in Vercel dashboard

**Manual deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 6.4 Environment Variables in Vercel

1. Go to Vercel dashboard
2. Select project
3. Settings → Environment Variables
4. Add all variables from `.env`
5. Redeploy

### 6.5 Post-Deployment Verification

- [ ] App loads successfully
- [ ] Authentication works
- [ ] Database queries work
- [ ] File uploads work
- [ ] No console errors
- [ ] Check error logs

---

## 7. Troubleshooting

### 7.1 Common Issues

**Issue: "Supabase client not initialized"**
```typescript
// Solution: Check environment variables
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Issue: "Row Level Security policy violation"**
```sql
-- Solution: Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Temporarily disable RLS for testing (DON'T DO IN PRODUCTION)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

**Issue: "File upload fails"**
- Check storage bucket exists
- Verify RLS policies on storage
- Check file size limits
- Verify CORS settings

**Issue: "Build fails with TypeScript errors"**
```bash
# Run type checking
npm run typecheck

# Fix errors one by one
# Use `// @ts-ignore` sparingly
```

### 7.2 Debugging Tips

**Enable verbose logging:**
```typescript
// In development
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

**Check Supabase logs:**
1. Go to Supabase dashboard
2. Logs → API Logs
3. Filter by error level

**Use React DevTools:**
- Install React DevTools extension
- Inspect component state
- Check React Query cache

**Network debugging:**
- Open browser DevTools
- Network tab
- Filter by "supabase"
- Check request/response

### 7.3 Performance Issues

**Slow queries:**
```sql
-- Add indexes
CREATE INDEX idx_table_column ON table(column);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM table WHERE condition;
```

**Large bundle size:**
```bash
# Analyze bundle
npm run build -- --analyze

# Use code splitting
const Component = lazy(() => import('./Component'));
```

**Slow page loads:**
- Enable lazy loading for images
- Use React.memo for expensive components
- Implement virtual scrolling
- Optimize database queries

---

## 8. Best Practices

### 8.1 Code Quality

- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript strictly
- Follow DRY principle

### 8.2 Security

- Never commit secrets
- Always use RLS
- Validate user input
- Sanitize HTML output
- Use HTTPS only

### 8.3 Performance

- Lazy load components
- Optimize images
- Use React Query caching
- Minimize re-renders
- Profile with React DevTools

### 8.4 Accessibility

- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast

---

## 9. Resources

### 9.1 Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)

### 9.2 Tools
- [VS Code](https://code.visualstudio.com)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Supabase Studio](https://supabase.com/docs/guides/platform/studio)

### 9.3 Community
- [GitHub Discussions](https://github.com/esteban572/first-responder-connect/discussions)
- [Supabase Discord](https://discord.supabase.com)
- [React Discord](https://discord.gg/react)

---

**Document Control**
- **Created:** January 23, 2026
- **Last Modified:** January 23, 2026
- **Owner:** Esteban Ibarra
