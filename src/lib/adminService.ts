import { supabase } from './supabase';
import { Post } from '@/types/post';

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalActiveAnnouncements: number;
  newUsersToday: number;
  newPostsToday: number;
}

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return data?.is_admin === true;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  // Get total users count
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get total posts count
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  // Get active announcements count
  const { count: totalActiveAnnouncements } = await supabase
    .from('announcements')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get new users today
  const { count: newUsersToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayIso);

  // Get new posts today
  const { count: newPostsToday } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayIso);

  return {
    totalUsers: totalUsers || 0,
    totalPosts: totalPosts || 0,
    totalActiveAnnouncements: totalActiveAnnouncements || 0,
    newUsersToday: newUsersToday || 0,
    newPostsToday: newPostsToday || 0,
  };
}

/**
 * Get all posts for admin management with search capability
 */
export async function getAllPosts(search?: string): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_user_id_fkey(id, full_name, role, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('content', `%${search}%`);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Update a post (admin)
 */
export async function updatePost(id: string, content: string): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating post:', error);
    return false;
  }

  return true;
}

/**
 * Delete a post (admin)
 */
export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }

  return true;
}

/**
 * Get all users for admin management
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url, is_admin, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}
