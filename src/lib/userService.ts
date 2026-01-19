import { supabase } from './supabase';
import { UserProfile, UserProfileUpdate } from '@/types/user';

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(profile: UserProfileUpdate): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get existing profile to merge
  const existing = await getCurrentUserProfile();
  
  const profileData = {
    id: user.id,
    email: user.email || '',
    ...(existing || {}),
    ...profile,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    throw error;
  }

  return data;
}

/**
 * Search users by name, role, or location
 */
export async function searchUsers(query: string): Promise<UserProfile[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,role.ilike.%${query}%,location.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user's connections
 */
export async function getUserConnections(userId: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('connections')
    .select(`
      connected_user:profiles!connections_connected_user_id_fkey(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted');

  if (error) {
    console.error('Error fetching connections:', error);
    return [];
  }

  return data?.map((item: any) => item.connected_user).filter(Boolean) || [];
}

/**
 * Send connection request
 */
export async function sendConnectionRequest(targetUserId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('connections')
    .insert({
      user_id: user.id,
      connected_user_id: targetUserId,
      status: 'pending',
    });

  if (error) {
    console.error('Error sending connection request:', error);
    return false;
  }

  return true;
}

/**
 * Accept connection request
 */
export async function acceptConnectionRequest(connectionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId);

  if (error) {
    console.error('Error accepting connection:', error);
    return false;
  }

  return true;
}

/**
 * Check if users are connected
 */
export async function checkConnection(userId1: string, userId2: string): Promise<'connected' | 'pending' | 'none'> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'none';

  const { data, error } = await supabase
    .from('connections')
    .select('status')
    .or(`and(user_id.eq.${userId1},connected_user_id.eq.${userId2}),and(user_id.eq.${userId2},connected_user_id.eq.${userId1})`)
    .single();

  if (error || !data) return 'none';
  
  return data.status === 'accepted' ? 'connected' : 'pending';
}
