# Admin & Organization Workflows - First Responder Connect

Admin moderation workflows and organization/agency management processes.

**Last Updated:** January 24, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Admin Workflows](#admin-workflows)
2. [Content Moderation](#content-moderation)
3. [User Management](#user-management)
4. [Organization Workflows](#organization-workflows)
5. [Subscription Management](#subscription-management)
6. [Analytics & Reporting](#analytics--reporting)

---

## Admin Workflows

### 1.1 Admin Dashboard Access Flow

```mermaid
flowchart TD
    A[User navigates to /admin] --> B{User authenticated?}
    B -->|No| C[Redirect to login]
    B -->|Yes| D{Check user role}
    D --> E{Is admin?}
    E -->|No| F[Show 403 Forbidden]
    E -->|Yes| G[Load admin dashboard]
    G --> H[Fetch dashboard stats]
    H --> I[Reported content count]
    I --> J[Active users count]
    J --> K[Recent activity]
    K --> L[Display dashboard]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style E fill:#fff3e0
    style C fill:#ffcdd2
    style F fill:#ffcdd2
    style L fill:#c8e6c9
```

**Admin Check Implementation:**
```typescript
// middleware/adminCheck.ts
export async function checkAdminAccess(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  return profile?.role === 'admin';
}

// Component usage
function AdminDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAdminAccess(user.id).then(result => {
      setIsAdmin(result);
      setLoading(false);
    });
  }, [user]);
  
  if (loading) return <LoadingSpinner />;
  if (!isAdmin) return <Navigate to="/feed" />;
  
  return <AdminDashboardContent />;
}
```

---

## Content Moderation

### 2.1 Report Content Flow

```mermaid
flowchart TD
    A[User sees inappropriate content] --> B[Click 'Report' button]
    B --> C[Open report modal]
    C --> D[Select report reason]
    D --> E[Spam/Harassment/Violence/Other]
    E --> F{Add details?}
    F -->|Yes| G[User enters description]
    F -->|No| H[Skip details]
    G --> H
    H --> I[Click 'Submit Report']
    I --> J{Validation passes?}
    J -->|No| K[Show validation error]
    J -->|Yes| L[Insert into reports table]
    L --> M{Insert success?}
    M -->|No| N[Show database error]
    M -->|Yes| O[Create admin notification]
    O --> P[Show success message]
    P --> Q[Close modal]
    Q --> R{Auto-flag content?}
    R -->|Yes| S[Hide content pending review]
    R -->|No| T[Keep content visible]
    S --> U[End]
    T --> U
    
    style A fill:#e1f5ff
    style F fill:#fff3e0
    style J fill:#fff3e0
    style M fill:#fff3e0
    style R fill:#fff3e0
    style K fill:#ffcdd2
    style N fill:#ffcdd2
    style U fill:#c8e6c9
```

**Report Schema:**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id),
  content_type TEXT CHECK (content_type IN ('post', 'comment', 'user', 'message')),
  content_id UUID NOT NULL,
  reason TEXT CHECK (reason IN ('spam', 'harassment', 'violence', 'inappropriate', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
```

---

### 2.2 Review Reported Content Flow

```mermaid
flowchart TD
    A[Admin opens moderation queue] --> B[Load pending reports]
    B --> C[Sort by priority/date]
    C --> D[Display report list]
    D --> E[Admin clicks report]
    E --> F[Load full report details]
    F --> G[Show reported content]
    G --> H[Show reporter info]
    H --> I[Show content author info]
    I --> J{Admin decision?}
    J -->|Dismiss| K[Mark as dismissed]
    J -->|Remove Content| L[Delete content]
    J -->|Warn User| M[Send warning]
    J -->|Ban User| N[Ban user account]
    
    K --> O[Add resolution notes]
    L --> P[Update content status]
    M --> Q[Create notification]
    N --> R[Update user status]
    
    O --> S[Update report status]
    P --> S
    Q --> S
    R --> S
    
    S --> T{Notify reporter?}
    T -->|Yes| U[Send resolution notification]
    T -->|No| V[End]
    U --> V
    
    style A fill:#e1f5ff
    style J fill:#fff3e0
    style T fill:#fff3e0
    style V fill:#c8e6c9
```

**Moderation Actions:**
```typescript
// lib/moderationService.ts
export async function moderateContent(
  reportId: string,
  action: 'dismiss' | 'remove' | 'warn' | 'ban',
  notes: string,
  adminId: string
) {
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();
    
  switch (action) {
    case 'dismiss':
      await supabase
        .from('reports')
        .update({
          status: 'dismissed',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', reportId);
      break;
      
    case 'remove':
      // Delete the content
      await supabase
        .from(report.content_type + 's')
        .delete()
        .eq('id', report.content_id);
        
      // Update report
      await supabase
        .from('reports')
        .update({
          status: 'resolved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', reportId);
      break;
      
    case 'warn':
      // Send warning notification
      await supabase
        .from('notifications')
        .insert({
          user_id: report.content_author_id,
          type: 'warning',
          title: 'Content Warning',
          message: notes
        });
        
      // Update report
      await supabase
        .from('reports')
        .update({
          status: 'resolved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', reportId);
      break;
      
    case 'ban':
      // Ban user
      await supabase
        .from('profiles')
        .update({
          status: 'banned',
          banned_at: new Date().toISOString(),
          ban_reason: notes
        })
        .eq('id', report.content_author_id);
        
      // Update report
      await supabase
        .from('reports')
        .update({
          status: 'resolved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', reportId);
      break;
  }
}
```

---

### 2.3 Auto-Moderation Flow

```mermaid
flowchart TD
    A[Content submitted] --> B[Run content filters]
    B --> C{Contains profanity?}
    C -->|Yes| D[Flag for review]
    C -->|No| E{Contains spam patterns?}
    E -->|Yes| D
    E -->|No| F{Contains banned words?}
    F -->|Yes| D
    F -->|No| G{User has violations?}
    G -->|Yes| H{Violation count > 3?}
    G -->|No| I[Publish content]
    H -->|Yes| J[Auto-reject content]
    H -->|No| D
    D --> K[Add to moderation queue]
    K --> L[Notify admins]
    J --> M[Notify user]
    I --> N[End]
    L --> N
    M --> N
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#fff3e0
    style H fill:#fff3e0
    style J fill:#ffcdd2
    style I fill:#c8e6c9
    style N fill:#c8e6c9
```

**Content Filter Implementation:**
```typescript
// lib/contentFilter.ts
const PROFANITY_LIST = ['word1', 'word2', /* ... */];
const SPAM_PATTERNS = [
  /buy now/gi,
  /click here/gi,
  /limited time/gi,
  /* ... */
];

export function checkContent(content: string): {
  safe: boolean;
  flags: string[];
} {
  const flags: string[] = [];
  
  // Check profanity
  const lowerContent = content.toLowerCase();
  for (const word of PROFANITY_LIST) {
    if (lowerContent.includes(word)) {
      flags.push('profanity');
      break;
    }
  }
  
  // Check spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      flags.push('spam');
      break;
    }
  }
  
  // Check excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 20) {
    flags.push('excessive_caps');
  }
  
  // Check excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) {
    flags.push('excessive_links');
  }
  
  return {
    safe: flags.length === 0,
    flags
  };
}
```

---

## User Management

### 3.1 User Search & Management Flow

```mermaid
flowchart TD
    A[Admin opens user management] --> B[Load user list]
    B --> C{Apply filters?}
    C -->|Yes| D[Enter search criteria]
    C -->|No| E[Show all users]
    D --> F[Name/Email/Role/Status]
    F --> G[Execute search query]
    G --> H{Results found?}
    H -->|No| I[Show 'No users found']
    H -->|Yes| E
    E --> J[Display user table]
    J --> K[Admin clicks user]
    K --> L[Open user details modal]
    L --> M[Show user profile]
    M --> N[Show activity stats]
    N --> O[Show violation history]
    O --> P{Admin action?}
    P -->|Edit Role| Q[Update user role]
    P -->|Ban User| R[Ban user]
    P -->|Delete User| S[Delete user]
    P -->|Reset Password| T[Send reset email]
    P -->|Close| U[End]
    Q --> U
    R --> U
    S --> U
    T --> U
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style H fill:#fff3e0
    style P fill:#fff3e0
    style I fill:#fff9c4
    style U fill:#c8e6c9
```

**User Management Query:**
```typescript
// Admin user search
async function searchUsers(filters: UserFilters) {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      posts:posts(count),
      connections:connections(count),
      reports:reports(count)
    `)
    .order('created_at', { ascending: false });
    
  if (filters.search) {
    query = query.or(`
      full_name.ilike.%${filters.search}%,
      email.ilike.%${filters.search}%
    `);
  }
  
  if (filters.role) {
    query = query.eq('role', filters.role);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  const { data: users } = await query;
  return users;
}
```

---

## Organization Workflows

### 4.1 Create Organization Flow

```mermaid
flowchart TD
    A[User clicks 'Create Agency'] --> B{User authenticated?}
    B -->|No| C[Redirect to login]
    B -->|Yes| D[Open organization form]
    D --> E[Enter organization details]
    E --> F[Name, Type, Location]
    F --> G{Upload logo?}
    G -->|Yes| H[Select image file]
    G -->|No| M[Use default logo]
    H --> I{File valid?}
    I -->|No| J[Show error]
    I -->|Yes| K[Upload to storage]
    K --> L{Upload success?}
    L -->|No| J
    L -->|Yes| M
    M --> N[Select subscription plan]
    N --> O[Free/Pro/Enterprise]
    O --> P[Click 'Create Organization']
    P --> Q{Validation passes?}
    Q -->|No| R[Show validation errors]
    Q -->|Yes| S[Insert into organizations]
    S --> T{Insert success?}
    T -->|No| U[Show database error]
    T -->|Yes| V[Add user as owner]
    V --> W[Insert into organization_members]
    W --> X{Insert success?}
    X -->|No| U
    X -->|Yes| Y[Show success message]
    Y --> Z[Redirect to /agency/:id]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style G fill:#fff3e0
    style I fill:#fff3e0
    style L fill:#fff3e0
    style Q fill:#fff3e0
    style T fill:#fff3e0
    style X fill:#fff3e0
    style J fill:#ffcdd2
    style R fill:#ffcdd2
    style U fill:#ffcdd2
    style Z fill:#c8e6c9
```

**Organization Schema:**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('fire', 'ems', 'police', 'dispatch', 'other')),
  location TEXT,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active',
  member_limit INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

---

### 4.2 Invite Member to Organization Flow

```mermaid
flowchart TD
    A[Owner/Admin clicks 'Invite Member'] --> B{Check permissions}
    B -->|Not authorized| C[Show permission error]
    B -->|Authorized| D{Check member limit}
    D -->|Limit reached| E[Show upgrade prompt]
    D -->|Under limit| F[Open invite modal]
    F --> G{Invite method?}
    G -->|Email| H[Enter email address]
    G -->|Link| I[Generate invite link]
    H --> J[Select member role]
    I --> K[Copy link to clipboard]
    J --> L[Click 'Send Invite']
    L --> M{Email valid?}
    M -->|No| N[Show validation error]
    M -->|Yes| O[Insert into organization_invites]
    O --> P{Insert success?}
    P -->|No| Q[Show database error]
    P -->|Yes| R[Send invite email]
    R --> S{Email sent?}
    S -->|No| T[Show email error]
    S -->|Yes| U[Show success message]
    K --> V[Show success message]
    U --> W[End]
    V --> W
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style D fill:#fff3e0
    style G fill:#fff3e0
    style M fill:#fff3e0
    style P fill:#fff3e0
    style S fill:#fff3e0
    style C fill:#ffcdd2
    style E fill:#fff9c4
    style N fill:#ffcdd2
    style Q fill:#ffcdd2
    style T fill:#ffcdd2
    style W fill:#c8e6c9
```

**Invite Implementation:**
```typescript
// lib/organizationService.ts
export async function inviteMember(
  organizationId: string,
  email: string,
  role: 'admin' | 'member' | 'viewer',
  invitedBy: string
) {
  // 1. Check if user already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
    
  // 2. Create invite
  const { data: invite, error } = await supabase
    .from('organization_invites')
    .insert({
      organization_id: organizationId,
      email: email,
      role: role,
      invited_by: invitedBy,
      token: generateInviteToken(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // 3. Send email
  await sendInviteEmail({
    to: email,
    organizationName: organization.name,
    inviterName: inviter.full_name,
    inviteLink: `${APP_URL}/invite/${invite.token}`,
    role: role
  });
  
  return invite;
}
```

---

### 4.3 Accept Organization Invite Flow

```mermaid
flowchart TD
    A[User clicks invite link] --> B[Load invite page]
    B --> C{User authenticated?}
    C -->|No| D[Redirect to login]
    C -->|Yes| E[Fetch invite details]
    E --> F{Invite valid?}
    F -->|No| G[Show 'Invite expired/invalid']
    F -->|Yes| H[Show organization info]
    H --> I[Show role being offered]
    I --> J{User action?}
    J -->|Accept| K[Insert into organization_members]
    J -->|Decline| L[Delete invite]
    K --> M{Insert success?}
    M -->|No| N[Show error]
    M -->|Yes| O[Delete invite]
    O --> P[Create notification for inviter]
    P --> Q[Show success message]
    Q --> R[Redirect to /agency/:id]
    L --> S[Show 'Invite declined']
    S --> T[Redirect to /feed]
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style F fill:#fff3e0
    style J fill:#fff3e0
    style M fill:#fff3e0
    style D fill:#fff9c4
    style G fill:#ffcdd2
    style N fill:#ffcdd2
    style R fill:#c8e6c9
    style T fill:#c8e6c9
```

---

### 4.4 Manage Organization Members Flow

```mermaid
flowchart TD
    A[Owner/Admin views members] --> B[Load member list]
    B --> C[Display members with roles]
    C --> D[Admin clicks member]
    D --> E[Open member actions menu]
    E --> F{Admin action?}
    F -->|Change Role| G[Select new role]
    F -->|Remove Member| H[Confirm removal]
    F -->|Cancel| I[Close menu]
    
    G --> J{Validate role change}
    J -->|Invalid| K[Show error: Can't demote last owner]
    J -->|Valid| L[Update member role]
    L --> M{Update success?}
    M -->|No| N[Show database error]
    M -->|Yes| O[Show success message]
    O --> P[Refresh member list]
    
    H --> Q[Show confirmation dialog]
    Q --> R{User confirms?}
    R -->|No| I
    R -->|Yes| S[Delete from organization_members]
    S --> T{Delete success?}
    T -->|No| N
    T -->|Yes| U[Create notification for removed user]
    U --> O
    
    I --> V[End]
    P --> V
    
    style A fill:#e1f5ff
    style F fill:#fff3e0
    style J fill:#fff3e0
    style M fill:#fff3e0
    style R fill:#fff3e0
    style T fill:#fff3e0
    style K fill:#ffcdd2
    style N fill:#ffcdd2
    style V fill:#c8e6c9
```

**Role Validation:**
```typescript
// Prevent removing last owner
async function canRemoveMember(
  organizationId: string,
  memberId: string
): Promise<boolean> {
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('id', memberId)
    .single();
    
  if (member.role === 'owner') {
    // Check if there are other owners
    const { count } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('role', 'owner');
      
    return count > 1;
  }
  
  return true;
}
```

---

## Subscription Management

### 5.1 Upgrade Subscription Flow

```mermaid
flowchart TD
    A[Owner clicks 'Upgrade'] --> B[Show pricing plans]
    B --> C[Compare features]
    C --> D[Select plan]
    D --> E{Plan selected?}
    E -->|Free| F[Show 'Already on Free']
    E -->|Pro| G[Show Pro features]
    E -->|Enterprise| H[Show Enterprise features]
    G --> I[Click 'Upgrade to Pro']
    H --> J[Click 'Contact Sales']
    I --> K[Redirect to Stripe Checkout]
    K --> L[User enters payment info]
    L --> M{Payment success?}
    M -->|No| N[Show payment error]
    M -->|Yes| O[Stripe webhook triggered]
    O --> P[Update subscription_plan]
    P --> Q[Update member_limit]
    Q --> R[Create notification]
    R --> S[Redirect to success page]
    J --> T[Open contact form]
    T --> U[Send inquiry to sales]
    
    style A fill:#e1f5ff
    style E fill:#fff3e0
    style M fill:#fff3e0
    style N fill:#ffcdd2
    style S fill:#c8e6c9
    style U fill:#c8e6c9
```

**Stripe Integration:**
```typescript
// lib/stripeService.ts
export async function createCheckoutSession(
  organizationId: string,
  plan: 'pro' | 'enterprise'
) {
  const priceIds = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
  };
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceIds[plan],
      quantity: 1
    }],
    success_url: `${APP_URL}/agency/${organizationId}?success=true`,
    cancel_url: `${APP_URL}/agency/${organizationId}/billing`,
    metadata: {
      organization_id: organizationId,
      plan: plan
    }
  });
  
  return session.url;
}

// Webhook handler
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await supabase
        .from('organizations')
        .update({
          subscription_plan: session.metadata.plan,
          subscription_status: 'active',
          member_limit: session.metadata.plan === 'pro' ? 50 : 999
        })
        .eq('id', session.metadata.organization_id);
      break;
      
    case 'customer.subscription.deleted':
      // Downgrade to free
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from('organizations')
        .update({
          subscription_plan: 'free',
          subscription_status: 'canceled',
          member_limit: 10
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
  }
}
```

---

## Analytics & Reporting

### 6.1 Admin Analytics Dashboard Flow

```mermaid
flowchart TD
    A[Admin opens analytics] --> B[Select date range]
    B --> C[Select metrics]
    C --> D[User Growth/Engagement/Content]
    D --> E[Fetch analytics data]
    E --> F[Query database]
    F --> G[Aggregate statistics]
    G --> H[Calculate trends]
    H --> I[Generate charts]
    I --> J[Display dashboard]
    J --> K{Export data?}
    K -->|Yes| L[Generate CSV/PDF]
    K -->|No| M[End]
    L --> N[Download file]
    N --> M
    
    style A fill:#e1f5ff
    style K fill:#fff3e0
    style M fill:#c8e6c9
```

**Analytics Queries:**
```typescript
// Get user growth stats
async function getUserGrowthStats(startDate: Date, endDate: Date) {
  const { data } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
    
  // Group by day
  const dailySignups = data.reduce((acc, profile) => {
    const date = new Date(profile.created_at).toDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  
  return dailySignups;
}

// Get engagement stats
async function getEngagementStats() {
  const { data: posts } = await supabase
    .from('posts')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
  const { data: comments } = await supabase
    .from('post_comments')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
  return {
    totalPosts: posts.length,
    totalComments: comments.length,
    avgPostsPerDay: posts.length / 30,
    avgCommentsPerDay: comments.length / 30
  };
}
```

---

## Summary

This admin and organization workflow documentation covers:

✅ **Admin Access** - Dashboard access control  
✅ **Content Moderation** - Report handling, review process, auto-moderation  
✅ **User Management** - Search, edit, ban, delete users  
✅ **Organizations** - Create, invite, manage members  
✅ **Subscriptions** - Upgrade, payment, webhooks  
✅ **Analytics** - Dashboard stats, reporting

**Related Documentation:**
- [Workflows](./WORKFLOWS.md) - User-facing workflows
- [Technical Workflows](./TECHNICAL_WORKFLOWS.md) - Technical processes
- [Architecture](./ARCHITECTURE.md) - System architecture
