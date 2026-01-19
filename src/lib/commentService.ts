import { supabase } from './supabase';
import { Comment, CommentCreate } from '@/types/post';

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string): Promise<Comment[]> {
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

  // Add author info to comments
  const commentsWithAuthors = commentsData.map((comment: any) => ({
    ...comment,
    author: profilesMap.get(comment.user_id) || null,
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
