import { supabase } from './supabase';
import { Comment, CommentCreate, CommentReaction } from '@/types/post';

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string): Promise<Comment[]> {
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all comments for the post
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
    return [];
  }

  if (!commentsData || commentsData.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
  const commentIds = commentsData.map(c => c.id);

  // Fetch profiles for these users
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  }

  // Create a map of user_id to profile
  const profilesMap = new Map(
    (profilesData || []).map(profile => [profile.id, profile])
  );

  // Fetch current user's reactions if logged in
  let userReactionsMap = new Map<string, 'like' | 'dislike'>();
  if (user) {
    const { data: userReactions } = await supabase
      .from('comment_reactions')
      .select('comment_id, type')
      .eq('user_id', user.id)
      .in('comment_id', commentIds);

    if (userReactions) {
      userReactions.forEach(r => {
        userReactionsMap.set(r.comment_id, r.type);
      });
    }
  }

  // Add author info and user reaction to comments
  const commentsWithAuthors = commentsData.map((comment: any) => ({
    ...comment,
    likes_count: comment.likes_count || 0,
    dislikes_count: comment.dislikes_count || 0,
    author: profilesMap.get(comment.user_id) || null,
    userReaction: userReactionsMap.get(comment.id) || null,
  }));

  // Organize into tree structure (top-level comments with replies)
  const topLevelComments: Comment[] = [];
  const repliesMap = new Map<string, Comment[]>();

  commentsWithAuthors.forEach((comment: Comment) => {
    if (comment.parent_id) {
      const replies = repliesMap.get(comment.parent_id) || [];
      replies.push(comment);
      repliesMap.set(comment.parent_id, replies);
    } else {
      topLevelComments.push(comment);
    }
  });

  // Attach replies to their parent comments
  topLevelComments.forEach(comment => {
    comment.replies = repliesMap.get(comment.id) || [];
  });

  return topLevelComments;
}

/**
 * Create a new comment
 */
export async function createComment(commentData: CommentCreate): Promise<Comment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: commentData.post_id,
      user_id: user.id,
      parent_id: commentData.parent_id || null,
      content: commentData.content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  // Increment comments count on the post
  await supabase.rpc('increment_comments_count', { p_post_id: commentData.post_id });

  // Fetch author profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .single();

  return {
    ...data,
    author: profile || null,
    replies: [],
  };
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string, postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }

  // Decrement comments count on the post
  await supabase.rpc('decrement_comments_count', { p_post_id: postId });

  return true;
}

/**
 * React to a comment (like or dislike)
 */
export async function reactToComment(
  commentId: string,
  type: 'like' | 'dislike'
): Promise<{ success: boolean; newLikesCount: number; newDislikesCount: number; userReaction: 'like' | 'dislike' | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if user already has a reaction
  const { data: existingReaction } = await supabase
    .from('comment_reactions')
    .select('id, type')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .single();

  let newLikesCount = 0;
  let newDislikesCount = 0;
  let userReaction: 'like' | 'dislike' | null = null;

  if (existingReaction) {
    if (existingReaction.type === type) {
      // Same reaction - remove it (toggle off)
      await supabase
        .from('comment_reactions')
        .delete()
        .eq('id', existingReaction.id);

      // Decrement the count
      if (type === 'like') {
        await supabase.rpc('decrement_comment_likes', { p_comment_id: commentId });
      } else {
        await supabase.rpc('decrement_comment_dislikes', { p_comment_id: commentId });
      }
      userReaction = null;
    } else {
      // Different reaction - update it
      await supabase
        .from('comment_reactions')
        .update({ type })
        .eq('id', existingReaction.id);

      // Update both counts
      if (type === 'like') {
        await supabase.rpc('increment_comment_likes', { p_comment_id: commentId });
        await supabase.rpc('decrement_comment_dislikes', { p_comment_id: commentId });
      } else {
        await supabase.rpc('decrement_comment_likes', { p_comment_id: commentId });
        await supabase.rpc('increment_comment_dislikes', { p_comment_id: commentId });
      }
      userReaction = type;
    }
  } else {
    // No existing reaction - create new one
    await supabase
      .from('comment_reactions')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        type,
      });

    // Increment the count
    if (type === 'like') {
      await supabase.rpc('increment_comment_likes', { p_comment_id: commentId });
    } else {
      await supabase.rpc('increment_comment_dislikes', { p_comment_id: commentId });
    }
    userReaction = type;
  }

  // Fetch updated counts
  const { data: comment } = await supabase
    .from('comments')
    .select('likes_count, dislikes_count')
    .eq('id', commentId)
    .single();

  return {
    success: true,
    newLikesCount: comment?.likes_count || 0,
    newDislikesCount: comment?.dislikes_count || 0,
    userReaction,
  };
}

/**
 * Get all reactions for a comment (to show who liked/disliked)
 */
export async function getCommentReactions(commentId: string): Promise<{
  likes: CommentReaction[];
  dislikes: CommentReaction[];
}> {
  const { data, error } = await supabase
    .from('comment_reactions')
    .select('id, comment_id, user_id, type, created_at')
    .eq('comment_id', commentId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching reactions:', error);
    return { likes: [], dislikes: [] };
  }

  // Get user profiles
  const userIds = [...new Set(data.map(r => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profilesMap = new Map(
    (profiles || []).map(p => [p.id, p])
  );

  const reactionsWithUsers = data.map(r => ({
    ...r,
    user: profilesMap.get(r.user_id),
  }));

  return {
    likes: reactionsWithUsers.filter(r => r.type === 'like'),
    dislikes: reactionsWithUsers.filter(r => r.type === 'dislike'),
  };
}

/**
 * Search users for mention autocomplete
 */
export async function searchUsersForMention(query: string): Promise<{
  id: string;
  full_name: string;
  avatar_url?: string;
}[]> {
  if (!query || query.length < 1) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .ilike('full_name', `%${query}%`)
    .limit(5);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data || [];
}

/**
 * Create notifications for mentioned users in a comment
 */
export async function createMentionNotifications(
  content: string,
  commenterId: string,
  commenterName: string,
  postId: string
): Promise<void> {
  // Extract mentioned user IDs from content (format: @[User Name](userId))
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: { name: string; userId: string }[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({ name: match[1], userId: match[2] });
  }

  // Create notifications for each mentioned user (except the commenter)
  for (const mention of mentions) {
    if (mention.userId !== commenterId) {
      await supabase.from('notifications').insert({
        user_id: mention.userId,
        type: 'comment',
        title: `${commenterName} mentioned you in a comment`,
        description: content.substring(0, 100),
        related_user_id: commenterId,
        related_post_id: postId,
      });
    }
  }
}
