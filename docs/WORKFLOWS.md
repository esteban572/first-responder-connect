# Workflow Documentation - First Responder Connect

Complete workflow diagrams and process flows for all features in the Paranet platform.

**Last Updated:** January 24, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [User Workflows](#user-workflows)
3. [Technical Workflows](#technical-workflows)
4. [Admin Workflows](#admin-workflows)
5. [Organization Workflows](#organization-workflows)
6. [Error Handling](#error-handling)
7. [State Management](#state-management)

---

## Overview

This document provides comprehensive workflow diagrams for all features in the First Responder Connect platform. Each workflow includes:

- **Visual flowcharts** using Mermaid diagrams
- **Step-by-step process descriptions**
- **Technical implementation details**
- **Error handling scenarios**
- **Success/failure paths**

### Diagram Legend

```mermaid
graph LR
    A[Start/Action] --> B{Decision Point}
    B -->|Yes| C[Process]
    B -->|No| D[Alternative Path]
    C --> E((End))
    D --> E
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style E fill:#c8e6c9
```

**Colors:**
- 🔵 Blue: Start/User Actions
- 🟡 Yellow: Decision Points
- 🟣 Purple: System Processes
- 🟢 Green: Success/End States
- 🔴 Red: Error States

---

## User Workflows

### 1. Authentication & Onboarding

#### 1.1 User Sign Up Flow

```mermaid
flowchart TD
    A[User visits site] --> B{Authenticated?}
    B -->|Yes| C[Redirect to /feed]
    B -->|No| D[Show landing page]
    D --> E[Click 'Sign in with Google']
    E --> F[Redirect to Google OAuth]
    F --> G{Google Auth Success?}
    G -->|No| H[Show error message]
    G -->|Yes| I[Redirect to /auth/callback]
    I --> J[Supabase creates session]
    J --> K{Profile exists?}
    K -->|Yes| L[Redirect to /feed]
    K -->|No| M[Trigger: handle_new_user]
    M --> N[Create profile record]
    N --> O[Set default values]
    O --> P[Redirect to /profile/edit]
    P --> Q[User completes profile]
    Q --> R[Upload profile photo]
    R --> S[Save profile]
    S --> T[Redirect to /feed]
    
    style A fill:#e1f5ff
    style G fill:#fff3e0
    style K fill:#fff3e0
    style H fill:#ffcdd2
    style T fill:#c8e6c9
```

**Steps:**

1. **Landing Page** - User arrives at site
2. **Authentication Check** - Check if user has active session
3. **Google OAuth** - Redirect to Google for authentication
4. **Callback Handling** - Process OAuth callback
5. **Session Creation** - Supabase creates user session
6. **Profile Check** - Check if profile exists in database
7. **Profile Creation** - Trigger creates new profile (if needed)
8. **Profile Completion** - User fills out profile details
9. **Photo Upload** - User uploads profile photo to storage
10. **Redirect to Feed** - User enters main application

**Technical Details:**
- **Auth Provider:** Supabase Auth with Google OAuth
- **Trigger:** `handle_new_user()` on `auth.users` insert
- **Storage:** Profile photos in `profile-media` bucket
- **RLS:** User can only edit their own profile

---

#### 1.2 Profile Completion Flow

```mermaid
flowchart TD
    A[New user redirected to /profile/edit] --> B[Load profile form]
    B --> C[User enters basic info]
    C --> D[Name, Role, Location]
    D --> E[User writes bio]
    E --> F{Upload photo?}
    F -->|Yes| G[Select image file]
    F -->|No| M[Use default avatar]
    G --> H{File valid?}
    H -->|No| I[Show error: file type/size]
    H -->|Yes| J[Upload to Supabase Storage]
    J --> K{Upload success?}
    K -->|No| L[Show upload error]
    K -->|Yes| M[Update profile.avatar_url]
    M --> N[Click 'Save Profile']
    N --> O{Validation passes?}
    O -->|No| P[Show validation errors]
    O -->|Yes| Q[Update profiles table]
    Q --> R{Update success?}
    R -->|No| S[Show database error]
    R -->|Yes| T[Show success message]
    T --> U[Redirect to /feed]
    
    style A fill:#e1f5ff
    style F fill:#fff3e0
    style H fill:#fff3e0
    style K fill:#fff3e0
    style O fill:#fff3e0
    style R fill:#fff3e0
    style I fill:#ffcdd2
    style L fill:#ffcdd2
    style P fill:#ffcdd2
    style S fill:#ffcdd2
    style U fill:#c8e6c9
```

**Validation Rules:**
- Name: Required, 2-100 characters
- Role: Required, must be valid role enum
- Location: Optional, max 200 characters
- Bio: Optional, max 500 characters
- Avatar: Max 5MB, image types only (jpg, png, webp)

---

### 2. Social Feed Workflows

#### 2.1 Create Post Flow

```mermaid
flowchart TD
    A[User clicks 'Create Post'] --> B[Open post composer]
    B --> C[User types content]
    C --> D{Add image?}
    D -->|Yes| E[Select image file]
    D -->|No| K[Skip to location]
    E --> F{Image valid?}
    F -->|No| G[Show error: file type/size]
    F -->|Yes| H[Preview image]
    H --> I[Upload to post-images bucket]
    I --> J{Upload success?}
    J -->|No| G
    J -->|Yes| K{Add location?}
    K -->|Yes| L[User enters location]
    K -->|No| M[Skip location]
    L --> M
    M --> N[Click 'Post']
    N --> O{Content validation?}
    O -->|No| P[Show validation error]
    O -->|Yes| Q[Insert into posts table]
    Q --> R{Insert success?}
    R -->|No| S[Show database error]
    R -->|Yes| T[Broadcast to realtime]
    T --> U[Show success message]
    U --> V[Clear composer]
    V --> W[Show post in feed]
    
    style A fill:#e1f5ff
    style D fill:#fff3e0
    style F fill:#fff3e0
    style J fill:#fff3e0
    style K fill:#fff3e0
    style O fill:#fff3e0
    style R fill:#fff3e0
    style G fill:#ffcdd2
    style P fill:#ffcdd2
    style S fill:#ffcdd2
    style W fill:#c8e6c9
```

**Technical Implementation:**

```typescript
// Post creation service
async function createPost(data: CreatePostData) {
  // 1. Validate content
  if (!data.content || data.content.length > 5000) {
    throw new Error('Invalid content length');
  }
  
  // 2. Upload image if provided
  let imageUrl = null;
  if (data.image) {
    imageUrl = await uploadPostImage(data.image);
  }
  
  // 3. Insert post
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: currentUser.id,
      content: data.content,
      image_url: imageUrl,
      location: data.location,
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // 4. Broadcast to realtime subscribers
  return post;
}
```

**Validation Rules:**
- Content: Required, 1-5000 characters
- Image: Optional, max 10MB, image types only
- Location: Optional, max 200 characters

---

#### 2.2 Like Post Flow

```mermaid
flowchart TD
    A[User clicks like button] --> B{Already liked?}
    B -->|Yes| C[Unlike: DELETE from post_likes]
    B -->|No| D[Like: INSERT into post_likes]
    C --> E{Delete success?}
    D --> F{Insert success?}
    E -->|No| G[Show error]
    E -->|Yes| H[Update UI: remove like]
    F -->|No| G
    F -->|Yes| I[Update UI: add like]
    H --> J[Decrement like count]
    I --> K[Increment like count]
    J --> L[Update button state]
    K --> L
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#ffcdd2
    style L fill:#c8e6c9
```

**Optimistic UI Update:**
```typescript
async function toggleLike(postId: string) {
  const isLiked = checkIfLiked(postId);
  
  // Optimistic update
  updateUIImmediately(!isLiked);
  
  try {
    if (isLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .match({ post_id: postId, user_id: currentUser.id });
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: currentUser.id });
    }
  } catch (error) {
    // Revert on error
    updateUIImmediately(isLiked);
    showError('Failed to update like');
  }
}
```

---

#### 2.3 Comment on Post Flow

```mermaid
flowchart TD
    A[User clicks 'Comment'] --> B[Open comment input]
    B --> C[User types comment]
    C --> D[Click 'Post Comment']
    D --> E{Content valid?}
    E -->|No| F[Show validation error]
    E -->|Yes| G[Insert into post_comments]
    G --> H{Insert success?}
    H -->|No| I[Show database error]
    H -->|Yes| J[Broadcast to realtime]
    J --> K[Update comment count]
    K --> L[Show comment in list]
    L --> M[Clear input]
    M --> N{Notify post author?}
    N -->|Yes| O[Create notification]
    N -->|No| P[End]
    O --> P
    
    style A fill:#e1f5ff
    style E fill:#fff3e0
    style H fill:#fff3e0
    style N fill:#fff3e0
    style F fill:#ffcdd2
    style I fill:#ffcdd2
    style P fill:#c8e6c9
```

**Notification Logic:**
- Create notification if commenter ≠ post author
- Notification type: `comment`
- Links to post with comment highlighted

---

### 3. Connection Workflows

#### 3.1 Send Connection Request Flow

```mermaid
flowchart TD
    A[User views profile] --> B{Already connected?}
    B -->|Yes| C[Show 'Connected' badge]
    B -->|No| D{Request pending?}
    D -->|Yes| E[Show 'Request Sent']
    D -->|No| F[Show 'Connect' button]
    F --> G[User clicks 'Connect']
    G --> H[Insert into connections table]
    H --> I{Insert success?}
    I -->|No| J[Show error]
    I -->|Yes| K[Update button to 'Pending']
    K --> L[Create notification for recipient]
    L --> M{Notification created?}
    M -->|No| N[Log error but continue]
    M -->|Yes| O[End]
    N --> O
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style D fill:#fff3e0
    style I fill:#fff3e0
    style M fill:#fff3e0
    style J fill:#ffcdd2
    style O fill:#c8e6c9
```

**Database Schema:**
```sql
-- connections table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);
```

---

#### 3.2 Accept/Reject Connection Request Flow

```mermaid
flowchart TD
    A[User receives notification] --> B[Click notification]
    B --> C[Navigate to connections page]
    C --> D[View pending requests]
    D --> E{User action?}
    E -->|Accept| F[Update status to 'accepted']
    E -->|Reject| G[Update status to 'rejected']
    F --> H{Update success?}
    G --> I{Update success?}
    H -->|No| J[Show error]
    I -->|No| J
    H -->|Yes| K[Create notification for requester]
    I -->|Yes| L[Remove from pending list]
    K --> M[Add to connections list]
    M --> N[Show success message]
    L --> O[Show success message]
    N --> P[End]
    O --> P
    
    style A fill:#e1f5ff
    style E fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#fff3e0
    style J fill:#ffcdd2
    style P fill:#c8e6c9
```

**Mutual Connection Check:**
```typescript
async function getMutualConnections(userId: string, otherUserId: string) {
  const { data } = await supabase.rpc('get_mutual_connections', {
    user_id_1: userId,
    user_id_2: otherUserId
  });
  return data;
}
```

---

### 4. Direct Messaging Workflows

#### 4.1 Start Conversation Flow

```mermaid
flowchart TD
    A[User clicks 'Message' on profile] --> B{Conversation exists?}
    B -->|Yes| C[Load existing conversation]
    B -->|No| D[Create new conversation]
    D --> E[Insert into conversations table]
    E --> F{Insert success?}
    F -->|No| G[Show error]
    F -->|Yes| H[Add both users as participants]
    H --> I{Participants added?}
    I -->|No| G
    I -->|Yes| C
    C --> J[Navigate to /messages/:id]
    J --> K[Load message history]
    K --> L[Subscribe to realtime updates]
    L --> M[Show message input]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style F fill:#fff3e0
    style I fill:#fff3e0
    style G fill:#ffcdd2
    style M fill:#c8e6c9
```

---

#### 4.2 Send Message Flow

```mermaid
flowchart TD
    A[User types message] --> B[Click 'Send' or press Enter]
    B --> C{Content valid?}
    C -->|No| D[Show validation error]
    C -->|Yes| E[Insert into messages table]
    E --> F{Insert success?}
    F -->|No| G[Show error]
    F -->|Yes| H[Broadcast via realtime]
    H --> I[Update conversation.last_message_at]
    I --> J[Show message in chat]
    J --> K[Clear input]
    K --> L{Recipient online?}
    L -->|No| M[Create push notification]
    L -->|Yes| N[End]
    M --> N
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style F fill:#fff3e0
    style L fill:#fff3e0
    style D fill:#ffcdd2
    style G fill:#ffcdd2
    style N fill:#c8e6c9
```

**Realtime Subscription:**
```typescript
// Subscribe to new messages
const subscription = supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    addMessageToUI(payload.new);
  })
  .subscribe();
```

---

#### 4.3 Read Receipt Flow

```mermaid
flowchart TD
    A[User opens conversation] --> B[Load unread messages]
    B --> C{Has unread messages?}
    C -->|No| D[End]
    C -->|Yes| E[Mark messages as read]
    E --> F[Update messages.read_at]
    F --> G{Update success?}
    G -->|No| H[Log error]
    G -->|Yes| I[Broadcast read status]
    I --> J[Update sender's UI]
    J --> K[Show read checkmarks]
    K --> D
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style G fill:#fff3e0
    style H fill:#ffcdd2
    style D fill:#c8e6c9
```

---

### 5. Job Board Workflows

#### 5.1 Browse Jobs Flow

```mermaid
flowchart TD
    A[User navigates to /jobs] --> B[Load jobs list]
    B --> C{Apply filters?}
    C -->|Yes| D[Select filters]
    C -->|No| E[Show all jobs]
    D --> F[Location filter]
    F --> G[Role filter]
    G --> H[Salary range filter]
    H --> I[Apply filters]
    I --> J[Query jobs with filters]
    J --> K{Results found?}
    K -->|No| L[Show 'No jobs found']
    K -->|Yes| E
    E --> M[Display job cards]
    M --> N[User clicks job card]
    N --> O[Navigate to /jobs/:id]
    O --> P[Load job details]
    P --> Q[Show full description]
    Q --> R[Show 'Apply' button]
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style K fill:#fff3e0
    style L fill:#fff9c4
    style R fill:#c8e6c9
```

**Filter Query:**
```typescript
let query = supabase
  .from('jobs')
  .select('*, organization:organizations(name, logo_url)')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

if (filters.location) {
  query = query.ilike('location', `%${filters.location}%`);
}
if (filters.role) {
  query = query.eq('role', filters.role);
}
if (filters.minSalary) {
  query = query.gte('salary_min', filters.minSalary);
}

const { data: jobs } = await query;
```

---

#### 5.2 Apply to Job Flow

```mermaid
flowchart TD
    A[User clicks 'Apply'] --> B{User authenticated?}
    B -->|No| C[Redirect to login]
    B -->|Yes| D{Already applied?}
    D -->|Yes| E[Show 'Already Applied']
    D -->|No| F[Open application modal]
    F --> G[Show resume upload]
    G --> H{Upload resume?}
    H -->|Yes| I[Select PDF file]
    H -->|No| M[Use profile resume]
    I --> J{File valid?}
    J -->|No| K[Show error: PDF only, max 5MB]
    J -->|Yes| L[Upload to storage]
    L --> M
    M --> N[User adds cover letter]
    N --> O[Click 'Submit Application']
    O --> P{Validation passes?}
    P -->|No| Q[Show validation errors]
    P -->|Yes| R[Insert into job_applications]
    R --> S{Insert success?}
    S -->|No| T[Show database error]
    S -->|Yes| U[Create notification for employer]
    U --> V[Show success message]
    V --> W[Update button to 'Applied']
    W --> X[Close modal]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style D fill:#fff3e0
    style H fill:#fff3e0
    style J fill:#fff3e0
    style P fill:#fff3e0
    style S fill:#fff3e0
    style K fill:#ffcdd2
    style Q fill:#ffcdd2
    style T fill:#ffcdd2
    style X fill:#c8e6c9
```

**Application Data:**
```typescript
interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  resume_url: string;
  cover_letter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
}
```

---

### 6. Credential Management Workflows

#### 6.1 Add Credential Flow

```mermaid
flowchart TD
    A[User navigates to /credentials] --> B[Click 'Add Credential']
    B --> C[Open credential form]
    C --> D[Select credential type]
    D --> E[Enter credential details]
    E --> F[Name, Issuing Organization]
    F --> G[Issue Date, Expiration Date]
    G --> H{Upload certificate?}
    H -->|Yes| I[Select file]
    H -->|No| N[Skip upload]
    I --> J{File valid?}
    J -->|No| K[Show error: PDF/image, max 5MB]
    J -->|Yes| L[Upload to credential-files bucket]
    L --> M{Upload success?}
    M -->|No| K
    M -->|Yes| N
    N --> O[Click 'Save Credential']
    O --> P{Validation passes?}
    P -->|No| Q[Show validation errors]
    P -->|Yes| R[Insert into credentials table]
    R --> S{Insert success?}
    S -->|No| T[Show database error]
    S -->|Yes| U[Show success message]
    U --> V[Add to credentials list]
    V --> W{Expiration date set?}
    W -->|Yes| X[Schedule expiration reminder]
    W -->|No| Y[End]
    X --> Y
    
    style A fill:#e1f5ff
    style H fill:#fff3e0
    style J fill:#fff3e0
    style M fill:#fff3e0
    style P fill:#fff3e0
    style S fill:#fff3e0
    style W fill:#fff3e0
    style K fill:#ffcdd2
    style Q fill:#ffcdd2
    style T fill:#ffcdd2
    style Y fill:#c8e6c9
```

**Expiration Reminder Logic:**
```typescript
// Check for expiring credentials (run daily)
async function checkExpiringCredentials() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const { data: expiring } = await supabase
    .from('credentials')
    .select('*, user:profiles(email, full_name)')
    .lte('expiration_date', thirtyDaysFromNow.toISOString())
    .gte('expiration_date', new Date().toISOString())
    .is('reminder_sent', false);
    
  for (const credential of expiring) {
    await sendExpirationEmail(credential);
    await supabase
      .from('credentials')
      .update({ reminder_sent: true })
      .eq('id', credential.id);
  }
}
```

---

#### 6.2 Share Credential Showcase Flow

```mermaid
flowchart TD
    A[User navigates to /credentials] --> B[Click 'Share Showcase']
    B --> C[Generate unique showcase URL]
    C --> D[/showcase/:userId]
    D --> E[Copy URL to clipboard]
    E --> F[Show success message]
    F --> G{User shares URL?}
    G -->|Yes| H[Recipient opens URL]
    G -->|No| I[End]
    H --> J[Load public showcase page]
    J --> K[Query user's public credentials]
    K --> L{Credentials found?}
    L -->|No| M[Show 'No credentials']
    L -->|Yes| N[Display credential cards]
    N --> O[Show user info header]
    O --> P[Show credential details]
    P --> Q{Certificate available?}
    Q -->|Yes| R[Show 'View Certificate' button]
    Q -->|No| S[End]
    R --> S
    I --> S
    
    style A fill:#e1f5ff
    style G fill:#fff3e0
    style L fill:#fff3e0
    style Q fill:#fff3e0
    style S fill:#c8e6c9
```

**Public Showcase Query:**
```typescript
// Only show credentials marked as public
const { data: credentials } = await supabase
  .from('credentials')
  .select('*')
  .eq('user_id', userId)
  .eq('is_public', true)
  .order('issue_date', { ascending: false });
```

---

## Summary

This workflow documentation covers the main user-facing features. Each workflow includes:

✅ Visual flowchart with decision points  
✅ Step-by-step process description  
✅ Technical implementation details  
✅ Error handling scenarios  
✅ Database queries and code examples

**Next Sections:**
- Technical Workflows (authentication, data flow, API)
- Admin Workflows (moderation, user management)
- Organization Workflows (agency management, subscriptions)
- Error Handling (comprehensive error scenarios)
- State Management (React context, caching)

---

**Related Documentation:**
- [Architecture](./ARCHITECTURE.md) - Technical architecture
- [API Documentation](./API_DOCUMENTATION.md) - API reference
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Development guide
