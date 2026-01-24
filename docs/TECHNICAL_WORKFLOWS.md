# Technical Workflows - First Responder Connect

Technical process flows, data flows, and system architecture workflows.

**Last Updated:** January 24, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Authentication & Session Management](#authentication--session-management)
2. [Data Flow Patterns](#data-flow-patterns)
3. [API Request Lifecycle](#api-request-lifecycle)
4. [Real-time Communication](#real-time-communication)
5. [File Upload & Storage](#file-upload--storage)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)

---

## Authentication & Session Management

### 1.1 Complete Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant A as App
    participant S as Supabase Auth
    participant G as Google OAuth
    participant DB as Database
    
    U->>B: Click "Sign in with Google"
    B->>A: Trigger signInWithOAuth()
    A->>S: supabase.auth.signInWithOAuth({provider: 'google'})
    S->>B: Redirect to Google
    B->>G: OAuth authorization request
    G->>U: Show consent screen
    U->>G: Approve access
    G->>B: Redirect with auth code
    B->>S: /auth/callback?code=xxx
    S->>G: Exchange code for tokens
    G->>S: Return access_token & id_token
    S->>S: Verify tokens
    S->>DB: Check if user exists
    
    alt User exists
        DB->>S: Return user data
        S->>A: Session created
    else New user
        DB->>DB: Trigger: handle_new_user()
        DB->>DB: INSERT INTO profiles
        DB->>S: Return new user data
        S->>A: Session created
    end
    
    A->>B: Set session cookie
    B->>A: Redirect to /feed
    A->>U: Show authenticated app
```

**Key Components:**

1. **OAuth Flow**
   - Provider: Google OAuth 2.0
   - Scopes: `email`, `profile`
   - Redirect URI: `{SUPABASE_URL}/auth/v1/callback`

2. **Session Management**
   - Storage: HTTP-only cookies
   - Duration: 7 days (configurable)
   - Refresh: Automatic token refresh

3. **Database Trigger**
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### 1.2 Session Refresh Flow

```mermaid
flowchart TD
    A[App loads] --> B[Check session]
    B --> C{Session exists?}
    C -->|No| D[Redirect to login]
    C -->|Yes| E{Session valid?}
    E -->|Yes| F[Continue to app]
    E -->|No| G{Refresh token valid?}
    G -->|No| D
    G -->|Yes| H[Call refreshSession]
    H --> I[Supabase refreshes tokens]
    I --> J{Refresh success?}
    J -->|No| D
    J -->|Yes| K[Update session]
    K --> F
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style E fill:#fff3e0
    style G fill:#fff3e0
    style J fill:#fff3e0
    style D fill:#ffcdd2
    style F fill:#c8e6c9
```

**Implementation:**
```typescript
// AuthContext.tsx
useEffect(() => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

### 1.3 Row Level Security (RLS) Flow

```mermaid
flowchart TD
    A[Client makes query] --> B[Supabase receives request]
    B --> C[Extract JWT from request]
    C --> D{JWT valid?}
    D -->|No| E[Return 401 Unauthorized]
    D -->|Yes| F[Parse user_id from JWT]
    F --> G[Apply RLS policies]
    G --> H{Policy allows access?}
    H -->|No| I[Return 403 Forbidden]
    H -->|Yes| J[Execute query]
    J --> K[Return filtered results]
    
    style A fill:#e1f5ff
    style D fill:#fff3e0
    style H fill:#fff3e0
    style E fill:#ffcdd2
    style I fill:#ffcdd2
    style K fill:#c8e6c9
```

**Example RLS Policies:**
```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can view posts from anyone
CREATE POLICY "Anyone can view posts"
ON posts FOR SELECT
USING (true);

-- Users can only create posts as themselves
CREATE POLICY "Users can create own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own posts
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);
```

---

## Data Flow Patterns

### 2.1 React Query Data Flow

```mermaid
flowchart TD
    A[Component mounts] --> B[useQuery hook called]
    B --> C{Data in cache?}
    C -->|Yes| D{Cache fresh?}
    C -->|No| E[Set loading state]
    D -->|Yes| F[Return cached data]
    D -->|No| E
    E --> G[Fetch from Supabase]
    G --> H{Fetch success?}
    H -->|No| I[Set error state]
    H -->|Yes| J[Update cache]
    J --> K[Return data]
    I --> L[Show error UI]
    K --> M[Render component]
    F --> M
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style D fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#ffcdd2
    style M fill:#c8e6c9
```

**Implementation:**
```typescript
// hooks/usePosts.ts
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url),
          likes:post_likes(count),
          comments:post_comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Component usage
function Feed() {
  const { data: posts, isLoading, error } = usePosts();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <PostList posts={posts} />;
}
```

---

### 2.2 Mutation Flow with Optimistic Updates

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant Q as React Query
    participant S as Supabase
    participant DB as Database
    
    U->>C: Click "Like" button
    C->>Q: useMutation.mutate()
    Q->>Q: onMutate: Update cache optimistically
    Q->>C: Render updated UI immediately
    C->>U: Show liked state
    
    Q->>S: Execute mutation
    S->>DB: INSERT INTO post_likes
    
    alt Success
        DB->>S: Success response
        S->>Q: Return success
        Q->>Q: onSuccess: Invalidate queries
        Q->>C: Refetch if needed
    else Error
        DB->>S: Error response
        S->>Q: Return error
        Q->>Q: onError: Rollback cache
        Q->>C: Revert UI
        C->>U: Show error message
    end
```

**Implementation:**
```typescript
// hooks/useToggleLike.ts
export function useToggleLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, isLiked }: ToggleLikeParams) => {
      if (isLiked) {
        return supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: currentUser.id });
      } else {
        return supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: currentUser.id });
      }
    },
    
    // Optimistic update
    onMutate: async ({ postId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);
      
      // Optimistically update cache
      queryClient.setQueryData(['posts'], (old: Post[]) => {
        return old.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !isLiked
            };
          }
          return post;
        });
      });
      
      return { previousPosts };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
      toast.error('Failed to update like');
    },
    
    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}
```

---

## API Request Lifecycle

### 3.1 Complete Request Flow

```mermaid
flowchart TD
    A[Component calls API] --> B[Supabase client intercepts]
    B --> C{Auth token exists?}
    C -->|No| D[Return 401 error]
    C -->|Yes| E[Add Authorization header]
    E --> F[Send HTTP request]
    F --> G[Supabase API Gateway]
    G --> H[Validate JWT]
    H --> I{JWT valid?}
    I -->|No| J[Return 401]
    I -->|Yes| K[Parse user context]
    K --> L[Apply RLS policies]
    L --> M[Execute SQL query]
    M --> N{Query success?}
    N -->|No| O[Return error response]
    N -->|Yes| P[Format response]
    P --> Q[Return JSON data]
    Q --> R[Client receives response]
    R --> S[Update React state]
    S --> T[Re-render component]
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style I fill:#fff3e0
    style N fill:#fff3e0
    style D fill:#ffcdd2
    style J fill:#ffcdd2
    style O fill:#ffcdd2
    style T fill:#c8e6c9
```

---

### 3.2 Error Handling Flow

```mermaid
flowchart TD
    A[API call fails] --> B{Error type?}
    B -->|Network| C[Check connectivity]
    B -->|401 Unauthorized| D[Session expired]
    B -->|403 Forbidden| E[Permission denied]
    B -->|404 Not Found| F[Resource missing]
    B -->|500 Server Error| G[Server issue]
    
    C --> H[Show offline message]
    D --> I[Redirect to login]
    E --> J[Show permission error]
    F --> K[Show not found error]
    G --> L[Show server error]
    
    H --> M{Retry?}
    J --> M
    K --> M
    L --> M
    
    M -->|Yes| N[Retry with backoff]
    M -->|No| O[Log error]
    
    N --> P{Success?}
    P -->|Yes| Q[Continue]
    P -->|No| O
    
    I --> R[Clear session]
    O --> S[Show error to user]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style M fill:#fff3e0
    style P fill:#fff3e0
    style H fill:#ffcdd2
    style I fill:#ffcdd2
    style J fill:#ffcdd2
    style K fill:#ffcdd2
    style L fill:#ffcdd2
    style Q fill:#c8e6c9
```

**Error Handler Implementation:**
```typescript
// lib/errorHandler.ts
export function handleSupabaseError(error: PostgrestError) {
  // Log to monitoring service
  console.error('Supabase error:', error);
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    '23505': 'This item already exists',
    '23503': 'Referenced item not found',
    '42501': 'You do not have permission to perform this action',
    'PGRST116': 'No rows found',
  };
  
  const message = errorMessages[error.code] || 'An unexpected error occurred';
  
  // Show toast notification
  toast.error(message);
  
  // Return structured error
  return {
    code: error.code,
    message,
    details: error.details,
    hint: error.hint,
  };
}

// Usage in component
try {
  const { data, error } = await supabase
    .from('posts')
    .insert(newPost);
    
  if (error) throw error;
  
  return data;
} catch (error) {
  handleSupabaseError(error);
}
```

---

## Real-time Communication

### 4.1 Realtime Subscription Flow

```mermaid
sequenceDiagram
    participant C as Component
    participant S as Supabase Client
    participant R as Realtime Server
    participant DB as Database
    
    C->>S: Subscribe to channel
    S->>R: WebSocket connection
    R->>R: Authenticate connection
    R->>DB: Register for changes
    
    Note over C,DB: Subscription active
    
    DB->>DB: INSERT/UPDATE/DELETE occurs
    DB->>R: Notify via pg_notify
    R->>R: Filter by RLS policies
    R->>S: Send change event
    S->>C: Trigger callback
    C->>C: Update local state
    C->>C: Re-render UI
    
    Note over C,DB: User leaves page
    
    C->>S: Unsubscribe
    S->>R: Close WebSocket
    R->>DB: Unregister listener
```

**Implementation:**
```typescript
// hooks/useRealtimePosts.ts
export function useRealtimePosts() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Subscribe to new posts
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        // Add new post to cache
        queryClient.setQueryData(['posts'], (old: Post[]) => {
          return [payload.new as Post, ...old];
        });
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        // Remove deleted post from cache
        queryClient.setQueryData(['posts'], (old: Post[]) => {
          return old.filter(post => post.id !== payload.old.id);
        });
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
}
```

---

### 4.2 Message Delivery Flow

```mermaid
flowchart TD
    A[User sends message] --> B[Insert into messages table]
    B --> C{Insert success?}
    C -->|No| D[Show error]
    C -->|Yes| E[Broadcast via realtime]
    E --> F{Recipient subscribed?}
    F -->|Yes| G[Deliver immediately]
    F -->|No| H[Store for later]
    G --> I[Show in recipient's UI]
    H --> J{Recipient online?}
    J -->|No| K[Send push notification]
    J -->|Yes| L[Wait for subscription]
    K --> M[End]
    L --> N[Deliver when subscribed]
    I --> M
    N --> M
    
    style A fill:#e1f5ff
    style C fill:#fff3e0
    style F fill:#fff3e0
    style J fill:#fff3e0
    style D fill:#ffcdd2
    style M fill:#c8e6c9
```

---

## File Upload & Storage

### 5.1 Image Upload Flow

```mermaid
flowchart TD
    A[User selects file] --> B{File validation}
    B -->|Invalid| C[Show error: type/size]
    B -->|Valid| D[Generate unique filename]
    D --> E[Create upload path]
    E --> F[Start upload to Supabase Storage]
    F --> G{Upload progress}
    G --> H[Update progress bar]
    H --> I{Upload complete?}
    I -->|No| G
    I -->|Yes| J{Upload success?}
    J -->|No| K[Show upload error]
    J -->|Yes| L[Get public URL]
    L --> M[Update database with URL]
    M --> N{DB update success?}
    N -->|No| O[Delete uploaded file]
    N -->|Yes| P[Show success]
    O --> K
    P --> Q[Display image]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style I fill:#fff3e0
    style J fill:#fff3e0
    style N fill:#fff3e0
    style C fill:#ffcdd2
    style K fill:#ffcdd2
    style Q fill:#c8e6c9
```

**Implementation:**
```typescript
// lib/uploadImage.ts
export async function uploadImage(
  file: File,
  bucket: string,
  folder: string
): Promise<string> {
  // 1. Validate file
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be an image (JPEG, PNG, or WebP)');
  }
  
  // 2. Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;
  
  // 3. Upload to storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  
  // 4. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return publicUrl;
}

// Usage in component
async function handleImageUpload(file: File) {
  try {
    setUploading(true);
    
    const imageUrl = await uploadImage(file, 'post-images', userId);
    
    // Update post with image URL
    await supabase
      .from('posts')
      .update({ image_url: imageUrl })
      .eq('id', postId);
      
    toast.success('Image uploaded successfully');
  } catch (error) {
    toast.error(error.message);
  } finally {
    setUploading(false);
  }
}
```

---

### 5.2 Storage RLS Policies

```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to post images
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');
```

---

## State Management

### 6.1 Context Provider Flow

```mermaid
flowchart TD
    A[App starts] --> B[AuthProvider wraps app]
    B --> C[Initialize auth state]
    C --> D[Check for session]
    D --> E{Session exists?}
    E -->|No| F[Set user = null]
    E -->|Yes| G[Set user from session]
    F --> H[Render children]
    G --> H
    H --> I[Child components mount]
    I --> J[useAuth hook called]
    J --> K[Access auth context]
    K --> L{User authenticated?}
    L -->|No| M[Show login UI]
    L -->|Yes| N[Show app UI]
    
    style A fill:#e1f5ff
    style E fill:#fff3e0
    style L fill:#fff3e0
    style M fill:#fff9c4
    style N fill:#c8e6c9
```

**Context Implementation:**
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## Performance Optimization

### 7.1 Query Optimization Flow

```mermaid
flowchart TD
    A[Component needs data] --> B{Data in cache?}
    B -->|Yes| C{Cache fresh?}
    B -->|No| D[Fetch from API]
    C -->|Yes| E[Return cached data]
    C -->|No| F{Background refetch?}
    F -->|Yes| G[Fetch in background]
    F -->|No| D
    D --> H[Execute query]
    H --> I{Use indexes?}
    I -->|No| J[Full table scan - SLOW]
    I -->|Yes| K[Index scan - FAST]
    J --> L[Return results]
    K --> L
    L --> M[Cache results]
    M --> N[Return to component]
    G --> O[Update cache silently]
    E --> N
    O --> N
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#fff3e0
    style F fill:#fff3e0
    style I fill:#fff3e0
    style J fill:#ffcdd2
    style K fill:#c8e6c9
    style N fill:#c8e6c9
```

**Database Indexes:**
```sql
-- Index for post queries
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Index for connections
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_connections_status ON connections(status);

-- Composite index for messages
CREATE INDEX idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Index for search
CREATE INDEX idx_profiles_search ON profiles 
USING gin(to_tsvector('english', full_name || ' ' || bio));
```

---

### 7.2 Component Rendering Optimization

```mermaid
flowchart TD
    A[Parent re-renders] --> B{Child memoized?}
    B -->|No| C[Child re-renders]
    B -->|Yes| D{Props changed?}
    D -->|Yes| C
    D -->|No| E[Skip re-render]
    C --> F{Expensive computation?}
    F -->|Yes| G{useMemo used?}
    F -->|No| H[Render normally]
    G -->|No| I[Recompute every render - SLOW]
    G -->|Yes| J[Use cached value - FAST]
    I --> H
    J --> H
    E --> K[Reuse previous render]
    H --> L[Update DOM]
    K --> L
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style D fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#fff3e0
    style I fill:#ffcdd2
    style J fill:#c8e6c9
    style L fill:#c8e6c9
```

**Optimization Techniques:**
```typescript
// 1. Memoize expensive components
const PostCard = memo(({ post }: { post: Post }) => {
  return (
    <div className="post-card">
      {/* Post content */}
    </div>
  );
});

// 2. Memoize expensive computations
function PostList({ posts }: { posts: Post[] }) {
  const sortedPosts = useMemo(() => {
    return posts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts]);
  
  return (
    <div>
      {sortedPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 3. Memoize callbacks
function Feed() {
  const handleLike = useCallback((postId: string) => {
    toggleLike(postId);
  }, []);
  
  return <PostList onLike={handleLike} />;
}

// 4. Virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualPostList({ posts }: { posts: Post[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated post height
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <PostCard post={posts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Summary

This technical workflow documentation covers:

✅ **Authentication** - Complete OAuth flow, session management, RLS  
✅ **Data Flow** - React Query patterns, optimistic updates  
✅ **API Lifecycle** - Request flow, error handling  
✅ **Real-time** - WebSocket subscriptions, message delivery  
✅ **File Upload** - Storage flow, validation, RLS policies  
✅ **State Management** - Context providers, custom hooks  
✅ **Performance** - Query optimization, rendering optimization

**Related Documentation:**
- [Workflows](./WORKFLOWS.md) - User-facing workflows
- [Architecture](./ARCHITECTURE.md) - System architecture
- [API Documentation](./API_DOCUMENTATION.md) - API reference
