import { supabase } from './supabase';
import { Post, PostCreate } from '@/types/post';
import { uploadMedia } from './mediaService';
import { getConnectedUserIds } from './userService';

/**
 * Get feed posts (own posts + posts from connections)
 */
export async function getFeedPosts(): Promise<Post[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get connected user IDs
  const connectedIds = await getConnectedUserIds();

  // Include current user's posts + connected users' posts
  const allowedUserIds = [user.id, ...connectedIds];

  // Get posts from allowed users
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .in('user_id', allowedUserIds)
    .order('created_at', { ascending: false })
    .limit(50);

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return [];
  }

  if (!postsData || postsData.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(postsData.map(post => post.user_id))];

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

  // Combine posts with author info
  return postsData.map((post: any) => ({
    ...post,
    author: profilesMap.get(post.user_id) || null,
  }));
}

/**
 * Get post by ID
 */
export async function getPost(postId: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  // Fetch author profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', data.user_id)
    .single();

  return {
    ...data,
    author: profile || null,
  };
}

/**
 * Create a new post
 */
export async function createPost(postData: PostCreate, imageFile?: File): Promise<Post | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let imageUrl: string | undefined;

  // Upload image if provided
  if (imageFile) {
    const uploadResult = await uploadMedia(imageFile, user.id);
    if (uploadResult) {
      imageUrl = uploadResult.url;
    }
  }

  // First, insert the post
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: postData.content,
      image_url: imageUrl || postData.image_url || null,
      location: postData.location || null,
      likes_count: 0,
      comments_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    // Provide more detailed error message
    const errorMessage = error.message || 'Unknown error occurred';
    const errorDetails = error.details ? ` Details: ${error.details}` : '';
    const errorHint = error.hint ? ` Hint: ${error.hint}` : '';
    throw new Error(`Failed to create post: ${errorMessage}${errorDetails}${errorHint}`);
  }

  if (!data) {
    throw new Error('Post was created but no data was returned');
  }

  // Fetch author information separately
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .single();

  return {
    ...data,
    author: profile ? {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role || '',
      avatar_url: profile.avatar_url || '',
    } : null,
  };
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get post to check ownership and get image URL
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('image_url')
    .eq('id', postId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !post) {
    console.error('Error fetching post:', fetchError);
    return false;
  }

  // Delete image from storage if exists
  if (post.image_url) {
    try {
      const url = new URL(post.image_url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf('profile-media');
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        await supabase.storage.from('profile-media').remove([filePath]);
      }
    } catch (error) {
      console.error('Error deleting post image:', error);
      // Continue to delete post even if image deletion fails
    }
  }

  // Delete post
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Error deleting post:', deleteError);
    return false;
  }

  return true;
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    // Unlike: delete the like
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error unliking post:', deleteError);
      return false;
    }

    // Decrement likes count
    await supabase.rpc('decrement_post_likes', { post_id: postId });
  } else {
    // Like: create the like
    const { error: insertError } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (insertError) {
      console.error('Error liking post:', insertError);
      return false;
    }

    // Increment likes count
    await supabase.rpc('increment_post_likes', { post_id: postId });
  }

  return true;
}

/**
 * Check if current user has liked a post
 */
export async function hasUserLikedPost(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  return !!data;
}

/**
 * Get posts by user
 */
export async function getUserPosts(userId: string, limit: number = 10): Promise<Post[]> {
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (postsError) {
    console.error('Error fetching user posts:', postsError);
    return [];
  }

  if (!postsData || postsData.length === 0) {
    return [];
  }

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', userId)
    .single();

  return postsData.map((post: any) => ({
    ...post,
    author: profile || null,
  }));
}
