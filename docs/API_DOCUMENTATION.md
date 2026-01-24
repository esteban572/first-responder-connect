# API Documentation
## Paranet - First Responder Professional Network

**Version:** 1.0  
**Last Updated:** January 23, 2026

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [Users & Profiles](#2-users--profiles)
3. [Posts & Feed](#3-posts--feed)
4. [Connections](#4-connections)
5. [Messages](#5-messages)
6. [Organizations](#6-organizations)
7. [Groups](#7-groups)
8. [Jobs](#8-jobs)
9. [Credentials](#9-credentials)
10. [Events](#10-events)
11. [Blog](#11-blog)
12. [Video Meetings](#12-video-meetings)
13. [Storage](#13-storage)

---

## 1. Authentication

### 1.1 Sign In with Google

```typescript
import { supabase } from '@/lib/supabase';

const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
};
```

### 1.2 Sign Out

```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
};
```

### 1.3 Get Current User

```typescript
const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return user;
};
```

### 1.4 Get Session

```typescript
const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return session;
};
```

---

## 2. Users & Profiles

### 2.1 Get User Profile

**Endpoint:** `profiles` table  
**Method:** SELECT  
**Auth:** Public (read), Authenticated (write own)

```typescript
const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return data;
};
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "Firefighter",
  "location": "Los Angeles, CA",
  "bio": "10 years experience...",
  "avatar_url": "https://...",
  "cover_image_url": "https://...",
  "credentials": ["EMT-B", "Firefighter I"],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-23T00:00:00Z"
}
```

### 2.2 Update Profile

```typescript
const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return data;
};
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "role": "Firefighter/Paramedic",
  "location": "Los Angeles, CA",
  "bio": "Updated bio..."
}
```

### 2.3 Search Users

```typescript
const searchUsers = async (query: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, location, avatar_url')
    .or(`full_name.ilike.%${query}%,role.ilike.%${query}%,location.ilike.%${query}%`)
    .limit(20);
  
  return data;
};
```

### 2.4 Get User Media

```typescript
const getUserMedia = async (userId: string) => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return data;
};
```

---

## 3. Posts & Feed

### 3.1 Get Feed Posts

```typescript
const getPosts = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  return data;
};
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "content": "Great training session today!",
    "image_url": "https://...",
    "location": "Los Angeles Fire Station 27",
    "likes_count": 15,
    "comments_count": 3,
    "created_at": "2026-01-23T10:00:00Z",
    "profiles": {
      "id": "uuid",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "role": "Firefighter"
    }
  }
]
```

### 3.2 Create Post

```typescript
const createPost = async (postData: {
  content: string;
  image_url?: string;
  location?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      ...postData,
      likes_count: 0,
      comments_count: 0
    })
    .select()
    .single();
  
  return data;
};
```

**Request Body:**
```json
{
  "content": "Great training session today!",
  "image_url": "https://...",
  "location": "Los Angeles Fire Station 27"
}
```

### 3.3 Like Post

```typescript
const likePost = async (postId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Insert like
  const { error: likeError } = await supabase
    .from('post_likes')
    .insert({ post_id: postId, user_id: user.id });
  
  // Increment count
  await supabase.rpc('increment_post_likes', { post_id: postId });
};
```

### 3.4 Unlike Post

```typescript
const unlikePost = async (postId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Delete like
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);
  
  // Decrement count
  await supabase.rpc('decrement_post_likes', { post_id: postId });
};
```

### 3.5 Get Post Comments

```typescript
const getComments = async (postId: string) => {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  return data;
};
```

### 3.6 Add Comment

```typescript
const addComment = async (postId: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content
    })
    .select()
    .single();
  
  return data;
};
```

---

## 4. Connections

### 4.1 Get User Connections

```typescript
const getConnections = async (userId: string) => {
  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      connected_profile:connected_user_id (
        id,
        full_name,
        avatar_url,
        role,
        location
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted');
  
  return data;
};
```

### 4.2 Send Connection Request

```typescript
const sendConnectionRequest = async (targetUserId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('connections')
    .insert({
      user_id: user.id,
      connected_user_id: targetUserId,
      status: 'pending'
    })
    .select()
    .single();
  
  return data;
};
```

### 4.3 Accept Connection Request

```typescript
const acceptConnection = async (connectionId: string) => {
  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .select()
    .single();
  
  return data;
};
```

### 4.4 Get Pending Requests

```typescript
const getPendingRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      requester:user_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('connected_user_id', user.id)
    .eq('status', 'pending');
  
  return data;
};
```

---

## 5. Messages

### 5.1 Get Conversations

```typescript
const getConversations = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant1:user1_id (id, full_name, avatar_url),
      participant2:user2_id (id, full_name, avatar_url),
      last_message:messages (content, created_at)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });
  
  return data;
};
```

### 5.2 Get Messages

```typescript
const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (id, full_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  return data;
};
```

### 5.3 Send Message

```typescript
const sendMessage = async (conversationId: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      read: false
    })
    .select()
    .single();
  
  return data;
};
```

### 5.4 Subscribe to New Messages

```typescript
const subscribeToMessages = (conversationId: string, callback: (message: any) => void) => {
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
  
  return subscription;
};
```

---

## 6. Organizations

### 6.1 Get Organization

```typescript
const getOrganization = async (orgId: string) => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();
  
  return data;
};
```

### 6.2 Create Organization

```typescript
const createOrganization = async (orgData: {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
}) => {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      ...orgData,
      subscription_tier: 'free'
    })
    .select()
    .single();
  
  return data;
};
```

### 6.3 Get Organization Members

```typescript
const getOrganizationMembers = async (orgId: string) => {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        avatar_url,
        role,
        email
      )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  
  return data;
};
```

### 6.4 Invite Member

```typescript
const inviteMember = async (orgId: string, email: string, role: string) => {
  const { data, error } = await supabase
    .from('organization_invites')
    .insert({
      organization_id: orgId,
      email,
      role,
      status: 'pending'
    })
    .select()
    .single();
  
  return data;
};
```

### 6.5 Generate Invite Link

```typescript
const generateInviteLink = async (orgId: string, role: string) => {
  const token = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('organization_invite_links')
    .insert({
      organization_id: orgId,
      token,
      role,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
    .select()
    .single();
  
  return `${window.location.origin}/invite/${token}`;
};
```

---

## 7. Groups

### 7.1 Get Groups

```typescript
const getGroups = async () => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      member_count:group_members(count)
    `)
    .order('created_at', { ascending: false });
  
  return data;
};
```

### 7.2 Create Group

```typescript
const createGroup = async (groupData: {
  name: string;
  description: string;
  is_private: boolean;
  avatar_url?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('groups')
    .insert({
      ...groupData,
      owner_id: user.id
    })
    .select()
    .single();
  
  return data;
};
```

### 7.3 Join Group

```typescript
const joinGroup = async (groupId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member'
    })
    .select()
    .single();
  
  return data;
};
```

### 7.4 Get Group Members

```typescript
const getGroupMembers = async (groupId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('group_id', groupId);
  
  return data;
};
```

---

## 8. Jobs

### 8.1 Get Jobs

```typescript
const getJobs = async (filters?: {
  location?: string;
  role?: string;
  type?: string;
}) => {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      organization:organization_id (
        id,
        name,
        logo_url
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters?.role) {
    query = query.eq('role', filters.role);
  }
  if (filters?.type) {
    query = query.eq('employment_type', filters.type);
  }
  
  const { data, error } = await query;
  return data;
};
```

### 8.2 Get Job Details

```typescript
const getJob = async (jobId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      organization:organization_id (
        id,
        name,
        logo_url,
        description
      )
    `)
    .eq('id', jobId)
    .single();
  
  return data;
};
```

### 8.3 Apply to Job

```typescript
const applyToJob = async (jobId: string, applicationData: {
  resume_url: string;
  cover_letter?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      user_id: user.id,
      ...applicationData,
      status: 'pending'
    })
    .select()
    .single();
  
  return data;
};
```

---

## 9. Credentials

### 9.1 Get User Credentials

```typescript
const getCredentials = async (userId: string) => {
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('user_id', userId)
    .order('expiration_date', { ascending: true });
  
  return data;
};
```

### 9.2 Add Credential

```typescript
const addCredential = async (credentialData: {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
  file_url?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('credentials')
    .insert({
      user_id: user.id,
      ...credentialData
    })
    .select()
    .single();
  
  return data;
};
```

### 9.3 Get Expiring Credentials

```typescript
const getExpiringCredentials = async (days = 30) => {
  const { data: { user } } = await supabase.auth.getUser();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('user_id', user.id)
    .lte('expiration_date', futureDate.toISOString())
    .gte('expiration_date', new Date().toISOString());
  
  return data;
};
```

---

## 10. Events

### 10.1 Get Events

```typescript
const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      rsvp_count:event_rsvps(count)
    `)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true });
  
  return data;
};
```

### 10.2 RSVP to Event

```typescript
const rsvpToEvent = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_id: eventId,
      user_id: user.id,
      status
    })
    .select()
    .single();
  
  return data;
};
```

---

## 11. Blog

### 11.1 Get Blog Posts

```typescript
const getBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });
  
  return data;
};
```

### 11.2 Save Article

```typescript
const saveArticle = async (articleId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('saved_articles')
    .insert({
      user_id: user.id,
      article_id: articleId
    })
    .select()
    .single();
  
  return data;
};
```

---

## 12. Video Meetings

### 12.1 Create Meeting

```typescript
const createMeeting = async (meetingData: {
  title: string;
  organization_id: string;
  scheduled_for?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const roomName = `meeting-${Date.now()}`;
  
  const { data, error } = await supabase
    .from('video_meetings')
    .insert({
      ...meetingData,
      created_by: user.id,
      room_name: roomName,
      status: 'scheduled'
    })
    .select()
    .single();
  
  return data;
};
```

### 12.2 Get Organization Meetings

```typescript
const getOrganizationMeetings = async (orgId: string) => {
  const { data, error } = await supabase
    .from('video_meetings')
    .select(`
      *,
      creator:created_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  
  return data;
};
```

---

## 13. Storage

### 13.1 Upload Profile Photo

```typescript
const uploadProfilePhoto = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('profile-media')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('profile-media')
    .getPublicUrl(fileName);
  
  return publicUrl;
};
```

### 13.2 Upload Post Image

```typescript
const uploadPostImage = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
};
```

### 13.3 Delete File

```typescript
const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};
```

---

## Error Handling

All API calls should be wrapped in try-catch blocks:

```typescript
try {
  const data = await getPosts();
  return data;
} catch (error) {
  console.error('Error fetching posts:', error);
  throw error;
}
```

Common error codes:
- `PGRST116`: No rows returned (404)
- `23505`: Unique constraint violation
- `23503`: Foreign key violation
- `42501`: Insufficient privileges (RLS)

---

## Rate Limiting

Supabase has built-in rate limiting:
- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour

---

## Best Practices

1. **Always use RLS**: Never disable Row Level Security
2. **Validate input**: Use Zod schemas for validation
3. **Handle errors**: Always catch and handle errors gracefully
4. **Optimize queries**: Select only needed columns
5. **Use indexes**: Ensure proper database indexes
6. **Cache data**: Use React Query for caching
7. **Paginate**: Use limit/offset for large datasets
8. **Subscribe wisely**: Clean up realtime subscriptions

---

**Document Control**
- **Created:** January 23, 2026
- **Last Modified:** January 23, 2026
- **Owner:** Esteban Ibarra
