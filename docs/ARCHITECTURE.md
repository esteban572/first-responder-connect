# Technical Architecture Guide
## Paranet - First Responder Professional Network

**Version:** 1.0  
**Last Updated:** January 23, 2026  
**Status:** Active Development

---

## 1. System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite                               │
│  ├── Components (shadcn/ui + Radix UI)                      │
│  ├── Pages (React Router v6)                                │
│  ├── State Management (React Query + Context API)           │
│  └── Styling (Tailwind CSS)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                        │
├─────────────────────────────────────────────────────────────┤
│  ├── PostgreSQL Database (with RLS)                         │
│  ├── Authentication (Google OAuth, Email)                   │
│  ├── Storage (Images, Videos, Documents)                    │
│  ├── Realtime (WebSocket subscriptions)                     │
│  └── Edge Functions (Stripe webhooks, billing)              │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│  ├── Daily.co / Jitsi (Video Meetings)                      │
│  ├── Stripe (Payment Processing)                            │
│  ├── RevenueCat (Subscription Management)                   │
│  ├── Vercel (Hosting & CDN)                                 │
│  └── Google OAuth (Authentication)                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: 
  - React Query (TanStack Query 5.83.0) for server state
  - React Context API for global state
- **Routing**: React Router v6.30.1
- **Forms**: React Hook Form 7.61.1 + Zod 3.25.76
- **Icons**: Lucide React 0.462.0

#### Backend (Supabase)
- **Database**: PostgreSQL 15
- **Authentication**: Supabase Auth (OAuth, Email)
- **Storage**: Supabase Storage (S3-compatible)
- **Realtime**: Supabase Realtime (WebSocket)
- **Edge Functions**: Deno runtime

#### External Services
- **Video**: Daily.co API / Jitsi Meet
- **Payments**: Stripe API
- **Subscriptions**: RevenueCat
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network

#### Development Tools
- **Testing**: Vitest 3.2.4 + Testing Library
- **Linting**: ESLint 9.32.0
- **Type Checking**: TypeScript
- **Package Manager**: npm

---

## 2. Frontend Architecture

### 2.1 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui base components (50+ components)
│   ├── layout/         # Layout components (Sidebar, Header, Nav)
│   ├── feed/           # Feed-related components
│   ├── profile/        # Profile components
│   ├── groups/         # Group components
│   ├── agency/         # Agency/organization components
│   ├── jobs/           # Job board components
│   ├── credentials/    # Credential management components
│   ├── messages/       # Messaging components
│   ├── events/         # Event components
│   ├── gear/           # Gear review components
│   ├── video/          # Video meeting components
│   └── admin/          # Admin dashboard components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx         # Authentication state
│   └── OrganizationContext.tsx # Organization state
├── hooks/              # Custom React hooks
│   ├── use-toast.ts            # Toast notifications
│   └── use-mobile.tsx          # Mobile detection
├── lib/                # Service layer & utilities
│   ├── supabase.ts             # Supabase client
│   ├── postService.ts          # Post CRUD operations
│   ├── userService.ts          # User operations
│   ├── mediaService.ts         # Media uploads
│   ├── organizationService.ts  # Organization management
│   ├── groupService.ts         # Group operations
│   ├── messageService.ts       # Messaging
│   ├── jobService.ts           # Job board
│   ├── credentialService.ts    # Credentials
│   ├── eventService.ts         # Events
│   ├── blogService.ts          # Blog
│   ├── videoMeetingService.ts  # Video meetings
│   ├── subscriptionService.ts  # Subscriptions
│   └── utils.ts                # Utility functions
├── pages/              # Page components (routes)
│   ├── Home.tsx
│   ├── Feed.tsx
│   ├── Profile.tsx
│   ├── Jobs.tsx
│   ├── Groups.tsx
│   ├── Messages.tsx
│   ├── admin/          # Admin dashboard pages
│   └── ...
├── types/              # TypeScript type definitions
│   ├── user.ts
│   ├── post.ts
│   ├── organization.ts
│   ├── group.ts
│   └── ...
├── test/               # Test files
│   ├── setup.ts
│   └── example.test.ts
├── App.tsx             # Main app component with routes
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### 2.2 Component Architecture

#### Component Hierarchy
```
App
├── AuthContext.Provider
│   └── OrganizationContext.Provider
│       ├── ProtectedRoute
│       │   └── AppLayout
│       │       ├── DesktopSidebar
│       │       ├── MobileNav
│       │       └── Page Content
│       └── AdminRoute
│           └── AdminLayout
│               └── Admin Pages
```

#### Component Patterns

**1. Container/Presentational Pattern**
- **Container**: Handles data fetching, state management
- **Presentational**: Receives props, renders UI

Example:
```typescript
// Container
const FeedPage = () => {
  const { data: posts } = useQuery(['posts'], fetchPosts);
  return <FeedList posts={posts} />;
};

// Presentational
const FeedList = ({ posts }) => (
  <div>{posts.map(post => <PostCard key={post.id} post={post} />)}</div>
);
```

**2. Compound Components**
- Used for complex UI like dialogs, dropdowns
- Example: `Dialog`, `DropdownMenu`, `Accordion`

**3. Render Props / Custom Hooks**
- Reusable logic extracted to hooks
- Example: `useAuth()`, `useOrganization()`, `useToast()`

### 2.3 State Management

#### Server State (React Query)
- Handles all data fetching from Supabase
- Automatic caching, refetching, and invalidation
- Optimistic updates for better UX

```typescript
// Example: Fetching posts
const { data: posts, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: () => postService.getPosts(),
  staleTime: 1000 * 60 * 5, // 5 minutes
});

// Example: Creating a post
const mutation = useMutation({
  mutationFn: postService.createPost,
  onSuccess: () => {
    queryClient.invalidateQueries(['posts']);
  },
});
```

#### Global State (Context API)
- **AuthContext**: User authentication state, login/logout
- **OrganizationContext**: Current organization, membership

```typescript
// AuthContext
const { user, signIn, signOut, isLoading } = useAuth();

// OrganizationContext
const { currentOrg, setCurrentOrg, userRole } = useOrganization();
```

#### Local State (useState)
- Component-specific state (form inputs, UI toggles)
- Ephemeral state that doesn't need to be shared

### 2.4 Routing

#### Route Structure
```typescript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Home />} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  
  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/feed" element={<Feed />} />
    <Route path="/profile/:userId" element={<UserProfile />} />
    <Route path="/jobs" element={<Jobs />} />
    <Route path="/groups" element={<Groups />} />
    <Route path="/messages" element={<Messages />} />
    {/* ... more routes */}
  </Route>
  
  {/* Admin Routes */}
  <Route element={<AdminRoute />}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/posts" element={<PostManagement />} />
    {/* ... more admin routes */}
  </Route>
</Routes>
```

#### Route Guards
- **ProtectedRoute**: Requires authentication
- **AdminRoute**: Requires admin role

---

## 3. Backend Architecture (Supabase)

### 3.1 Database Schema

#### Core Tables

**profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  credentials TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**posts**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**connections**
```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  connected_user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);
```

**organizations**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**organization_members**
```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

#### Supporting Tables
- `post_likes` - Post like tracking
- `post_comments` - Comments on posts
- `messages` - Direct messages
- `conversations` - Message threads
- `jobs` - Job postings
- `job_applications` - Job applications
- `credentials` - User certifications
- `groups` - Social groups
- `group_members` - Group membership
- `events` - Community events
- `event_rsvps` - Event attendance
- `blog_posts` - Blog articles
- `agencies` - Agency directory
- `agency_reviews` - Agency ratings
- `gear_items` - Gear catalog
- `gear_reviews` - Gear ratings
- `video_meetings` - Meeting records
- `notifications` - User notifications

### 3.2 Row Level Security (RLS)

All tables have RLS enabled with policies:

**Example: Posts Table**
```sql
-- Users can view all posts
CREATE POLICY "Users can view all posts"
  ON posts FOR SELECT
  USING (true);

-- Users can create their own posts
CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

**Example: Organization Members**
```sql
-- Members can view their organization's members
CREATE POLICY "Members can view organization members"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

### 3.3 Database Functions

**Increment/Decrement Counters**
```sql
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Auto-create Profile on Signup**
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.4 Storage Buckets

**profile-media**
- User profile photos and videos
- Public bucket
- Policies: Users can upload/delete their own files

**post-images**
- Images attached to posts
- Public bucket
- Policies: Users can upload/delete their own files

**credential-files**
- Credential document uploads
- Private bucket
- Policies: Users can only access their own files

**File Structure**
```
{bucket}/
  {user_id}/
    {timestamp}-{random}.{extension}
```

### 3.5 Realtime Subscriptions

**Messages**
```typescript
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe();
```

**Notifications**
```typescript
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle new notification
  })
  .subscribe();
```

### 3.6 Edge Functions

**stripe-webhook**
- Handles Stripe webhook events
- Updates subscription status
- Processes payments

**revenuecat-webhook**
- Handles RevenueCat webhook events
- Syncs mobile subscriptions

**billing-portal**
- Creates Stripe billing portal session
- Allows users to manage subscriptions

**create-checkout**
- Creates Stripe checkout session
- Handles subscription upgrades

---

## 4. Service Layer

### 4.1 Service Architecture

Each feature has a dedicated service module:

```typescript
// lib/postService.ts
export const postService = {
  getPosts: async () => { /* ... */ },
  createPost: async (data) => { /* ... */ },
  updatePost: async (id, data) => { /* ... */ },
  deletePost: async (id) => { /* ... */ },
  likePost: async (postId) => { /* ... */ },
  unlikePost: async (postId) => { /* ... */ },
};
```

### 4.2 Service Patterns

**Error Handling**
```typescript
try {
  const { data, error } = await supabase
    .from('posts')
    .insert(postData);
  
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Error creating post:', error);
  throw error;
}
```

**Type Safety**
```typescript
import { Post } from '@/types/post';

export const createPost = async (postData: Partial<Post>): Promise<Post> => {
  // Implementation
};
```

**Optimistic Updates**
```typescript
const mutation = useMutation({
  mutationFn: postService.likePost,
  onMutate: async (postId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['posts']);
    
    // Snapshot previous value
    const previousPosts = queryClient.getQueryData(['posts']);
    
    // Optimistically update
    queryClient.setQueryData(['posts'], (old) => 
      old.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      )
    );
    
    return { previousPosts };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['posts'], context.previousPosts);
  },
});
```

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

```
User clicks "Sign in with Google"
  ↓
Redirect to Google OAuth
  ↓
Google authenticates user
  ↓
Redirect to /auth/callback
  ↓
Supabase creates session
  ↓
Trigger: handle_new_user() creates profile
  ↓
Redirect to /feed
```

### 5.2 Authorization Levels

**Public**
- Home page
- Auth callback

**Authenticated**
- Feed, profiles, jobs, groups, messages
- All main features

**Admin**
- Admin dashboard
- Content moderation
- User management

**Organization Owner/Admin**
- Organization settings
- Member management
- Billing

### 5.3 Role-Based Access Control (RBAC)

**Organization Roles**
- **Owner**: Full access, can delete organization
- **Admin**: Manage members, settings (except billing)
- **Member**: Access organization features
- **Viewer**: Read-only access

**Group Roles**
- **Owner**: Full control
- **Admin**: Manage members, moderate content
- **Moderator**: Moderate content
- **Member**: Participate in group

---

## 6. Performance Optimization

### 6.1 Frontend Optimization

**Code Splitting**
```typescript
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
```

**Image Optimization**
- Lazy loading with `loading="lazy"`
- WebP format where supported
- Responsive images with `srcset`

**Memoization**
```typescript
const MemoizedComponent = memo(ExpensiveComponent);
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

**Virtual Scrolling**
- Infinite scroll for feeds
- Pagination for large lists

### 6.2 Backend Optimization

**Database Indexes**
```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_connections_user_id ON connections(user_id);
```

**Query Optimization**
- Select only needed columns
- Use joins instead of multiple queries
- Limit results with pagination

**Caching**
- React Query caching (5-minute stale time)
- Browser caching for static assets
- CDN caching via Vercel

---

## 7. Security

### 7.1 Security Measures

**Row Level Security (RLS)**
- All tables have RLS enabled
- Policies enforce data access rules

**Input Validation**
- Zod schemas for form validation
- Server-side validation in Edge Functions

**XSS Protection**
- React escapes output by default
- Sanitize user-generated HTML

**CSRF Protection**
- Supabase handles CSRF tokens
- SameSite cookies

**Rate Limiting**
- Supabase built-in rate limiting
- Custom rate limiting in Edge Functions

**File Upload Security**
- File type validation
- File size limits
- Virus scanning (future)

### 7.2 Data Privacy

**Personal Data**
- Encrypted at rest (Supabase)
- Encrypted in transit (HTTPS)
- User can delete account and data

**Compliance**
- GDPR-ready (data export, deletion)
- Privacy policy and terms of service

---

## 8. Deployment

### 8.1 Deployment Architecture

```
GitHub Repository
  ↓ (push to main)
Vercel Build
  ↓
  ├── Build React app
  ├── Run type checking
  ├── Run tests
  └── Deploy to Vercel Edge Network
  ↓
Production (paranet.app)
```

### 8.2 Environment Variables

**Development (.env)**
```env
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_DAILY_API_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=...
```

**Production (Vercel)**
- Same variables set in Vercel dashboard
- Secrets managed securely

### 8.3 CI/CD Pipeline

**GitHub Actions** (to be implemented)
```yaml
on: [push, pull_request]
jobs:
  test:
    - Install dependencies
    - Run linting
    - Run type checking
    - Run tests
  build:
    - Build production bundle
    - Check bundle size
  deploy:
    - Deploy to Vercel (on main branch)
```

---

## 9. Monitoring & Logging

### 9.1 Error Tracking
- Browser console errors
- Supabase error logs
- Vercel function logs

### 9.2 Analytics
- User engagement metrics
- Feature usage tracking
- Performance monitoring

### 9.3 Logging Strategy
- Client-side: Console logs (development only)
- Server-side: Supabase logs, Edge Function logs
- Error reporting: Sentry (future)

---

## 10. Testing Strategy

### 10.1 Unit Tests
- Service functions
- Utility functions
- Custom hooks

### 10.2 Component Tests
- UI components
- User interactions
- Form validation

### 10.3 Integration Tests
- API calls
- Database operations
- Authentication flows

### 10.4 E2E Tests (Future)
- Critical user flows
- Cross-browser testing
- Mobile testing

---

## 11. Scalability Considerations

### 11.1 Database Scaling
- Supabase auto-scales
- Connection pooling
- Read replicas (future)

### 11.2 Storage Scaling
- CDN for media files
- Image optimization
- Lazy loading

### 11.3 Application Scaling
- Serverless architecture (Vercel)
- Edge caching
- Code splitting

---

## 12. Future Enhancements

### 12.1 Technical Debt
- Add comprehensive test coverage
- Implement E2E tests
- Add error boundary components
- Improve accessibility

### 12.2 Performance Improvements
- Implement service workers
- Add offline support
- Optimize bundle size
- Implement virtual scrolling everywhere

### 12.3 New Features
- Mobile app (React Native)
- Push notifications
- Advanced search (Algolia)
- Real-time collaboration
- AI-powered recommendations

---

## Appendix

### A. Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.3.1 | UI framework |
| typescript | 5.8.3 | Type safety |
| vite | 5.4.19 | Build tool |
| @supabase/supabase-js | 2.90.1 | Backend client |
| @tanstack/react-query | 5.83.0 | Data fetching |
| react-router-dom | 6.30.1 | Routing |
| tailwindcss | 3.4.17 | Styling |
| zod | 3.25.76 | Validation |

### B. Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript compiler
```

### C. References
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)

---

**Document Control**
- **Created:** January 23, 2026
- **Last Modified:** January 23, 2026
- **Next Review:** February 23, 2026
- **Owner:** Esteban Ibarra
