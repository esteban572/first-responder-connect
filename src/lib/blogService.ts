import { supabase } from './supabase';
import { BlogPost, BlogPostCreate, BlogPostUpdate, BlogComment, BlogCommentCreate, SavedArticle } from '@/types/blog';

// ============ BLOG POSTS ============

/**
 * Get published blog posts
 */
export async function getPublishedPosts(category?: string): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles!blog_posts_created_by_fkey(id, full_name, avatar_url, role)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all blog posts (admin)
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles!blog_posts_created_by_fkey(id, full_name, avatar_url, role)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all blog posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles!blog_posts_created_by_fkey(id, full_name, avatar_url, role)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  if (!data) return null;

  // Get user's reaction if logged in
  let userReaction: 'like' | 'dislike' | null = null;
  let isSaved = false;

  if (user) {
    const { data: reaction } = await supabase
      .from('blog_reactions')
      .select('type')
      .eq('blog_post_id', data.id)
      .eq('user_id', user.id)
      .single();

    userReaction = reaction?.type || null;

    const { data: saved } = await supabase
      .from('saved_articles')
      .select('id')
      .eq('blog_post_id', data.id)
      .eq('user_id', user.id)
      .single();

    isSaved = !!saved;
  }

  // Increment view count
  await supabase
    .from('blog_posts')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', data.id);

  return { ...data, userReaction, isSaved };
}

/**
 * Get blog post by ID (admin)
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

/**
 * Create blog post
 */
export async function createPost(post: BlogPostCreate): Promise<BlogPost | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const slug = post.slug || generateSlug(post.title);

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...post,
      slug,
      tags: post.tags || [],
      created_by: user.id,
      published_at: post.is_published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    return null;
  }

  return data;
}

/**
 * Update blog post
 */
export async function updatePost(id: string, updates: BlogPostUpdate): Promise<BlogPost | null> {
  const updateData: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // If publishing for first time, set published_at
  if (updates.is_published) {
    const existing = await getPostById(id);
    if (existing && !existing.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog post:', error);
    return null;
  }

  return data;
}

/**
 * Delete blog post
 */
export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }

  return true;
}

/**
 * Toggle publish status
 */
export async function togglePublish(id: string, isPublished: boolean): Promise<boolean> {
  const updates: any = {
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };

  if (isPublished) {
    const existing = await getPostById(id);
    if (existing && !existing.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error toggling publish:', error);
    return false;
  }

  return true;
}

// ============ REACTIONS ============

/**
 * React to blog post (like/dislike)
 */
export async function reactToPost(postId: string, type: 'like' | 'dislike'): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check existing reaction
  const { data: existing } = await supabase
    .from('blog_reactions')
    .select('id, type')
    .eq('blog_post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    if (existing.type === type) {
      // Remove reaction
      await supabase.from('blog_reactions').delete().eq('id', existing.id);
      // Update count
      const countField = type === 'like' ? 'likes_count' : 'dislikes_count';
      await supabase.rpc('decrement_blog_count', { post_id: postId, count_field: countField });
    } else {
      // Change reaction
      await supabase.from('blog_reactions').update({ type }).eq('id', existing.id);
      // Update counts
      const oldField = existing.type === 'like' ? 'likes_count' : 'dislikes_count';
      const newField = type === 'like' ? 'likes_count' : 'dislikes_count';
      await supabase.rpc('decrement_blog_count', { post_id: postId, count_field: oldField });
      await supabase.rpc('increment_blog_count', { post_id: postId, count_field: newField });
    }
  } else {
    // Add new reaction
    await supabase.from('blog_reactions').insert({
      blog_post_id: postId,
      user_id: user.id,
      type,
    });
    // Update count
    const countField = type === 'like' ? 'likes_count' : 'dislikes_count';
    await supabase.rpc('increment_blog_count', { post_id: postId, count_field: countField });
  }

  return true;
}

// ============ COMMENTS ============

/**
 * Get comments for a blog post
 */
export async function getComments(postId: string): Promise<BlogComment[]> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('blog_comments')
    .select(`
      *,
      author:profiles!blog_comments_user_id_fkey(id, full_name, avatar_url, role)
    `)
    .eq('blog_post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  if (!data) return [];

  // Get replies
  const { data: replies } = await supabase
    .from('blog_comments')
    .select(`
      *,
      author:profiles!blog_comments_user_id_fkey(id, full_name, avatar_url, role)
    `)
    .eq('blog_post_id', postId)
    .not('parent_id', 'is', null)
    .order('created_at', { ascending: true });

  // Get user reactions if logged in
  let userReactions: Record<string, 'like' | 'dislike'> = {};
  if (user) {
    const allCommentIds = [...data.map(c => c.id), ...(replies?.map(r => r.id) || [])];
    const { data: reactions } = await supabase
      .from('blog_comment_reactions')
      .select('blog_comment_id, type')
      .eq('user_id', user.id)
      .in('blog_comment_id', allCommentIds);

    if (reactions) {
      userReactions = Object.fromEntries(reactions.map(r => [r.blog_comment_id, r.type]));
    }
  }

  // Build comment tree
  const repliesMap = new Map<string, BlogComment[]>();
  replies?.forEach((reply) => {
    const parentReplies = repliesMap.get(reply.parent_id!) || [];
    parentReplies.push({ ...reply, userReaction: userReactions[reply.id] || null });
    repliesMap.set(reply.parent_id!, parentReplies);
  });

  return data.map((comment) => ({
    ...comment,
    userReaction: userReactions[comment.id] || null,
    replies: repliesMap.get(comment.id) || [],
  }));
}

/**
 * Create comment
 */
export async function createComment(comment: BlogCommentCreate): Promise<BlogComment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('blog_comments')
    .insert({
      ...comment,
      user_id: user.id,
    })
    .select(`
      *,
      author:profiles!blog_comments_user_id_fkey(id, full_name, avatar_url, role)
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }

  // Update comment count
  await supabase.rpc('increment_blog_count', { post_id: comment.blog_post_id, count_field: 'comments_count' });

  return data;
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string, postId: string): Promise<boolean> {
  const { error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }

  // Update comment count
  await supabase.rpc('decrement_blog_count', { post_id: postId, count_field: 'comments_count' });

  return true;
}

/**
 * React to comment
 */
export async function reactToComment(commentId: string, type: 'like' | 'dislike'): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing } = await supabase
    .from('blog_comment_reactions')
    .select('id, type')
    .eq('blog_comment_id', commentId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    if (existing.type === type) {
      await supabase.from('blog_comment_reactions').delete().eq('id', existing.id);
      const countField = type === 'like' ? 'likes_count' : 'dislikes_count';
      await supabase.from('blog_comments').update({
        [countField]: supabase.rpc('decrement', { x: 1 })
      }).eq('id', commentId);
    } else {
      await supabase.from('blog_comment_reactions').update({ type }).eq('id', existing.id);
    }
  } else {
    await supabase.from('blog_comment_reactions').insert({
      blog_comment_id: commentId,
      user_id: user.id,
      type,
    });
    const countField = type === 'like' ? 'likes_count' : 'dislikes_count';
    await supabase.from('blog_comments').update({
      [countField]: supabase.rpc('increment', { x: 1 })
    }).eq('id', commentId);
  }

  return true;
}

// ============ SAVED ARTICLES ============

/**
 * Toggle save article
 */
export async function toggleSaveArticle(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing } = await supabase
    .from('saved_articles')
    .select('id')
    .eq('blog_post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    await supabase.from('saved_articles').delete().eq('id', existing.id);
  } else {
    await supabase.from('saved_articles').insert({
      blog_post_id: postId,
      user_id: user.id,
    });
  }

  return true;
}

/**
 * Get saved articles
 */
export async function getSavedArticles(): Promise<SavedArticle[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('saved_articles')
    .select(`
      *,
      blog_post:blog_posts(
        *,
        author:profiles!blog_posts_created_by_fkey(id, full_name, avatar_url, role)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved articles:', error);
    return [];
  }

  return data || [];
}

// ============ HELPERS ============

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}
