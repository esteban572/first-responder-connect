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

/**
 * Get pending connection requests for the current user
 */
export async function getPendingConnectionRequests(): Promise<{
  id: string;
  user_id: string;
  created_at: string;
  user: UserProfile;
}[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get requests where someone wants to connect with current user
  const { data, error } = await supabase
    .from('connections')
    .select('id, user_id, created_at')
    .eq('connected_user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching pending requests:', error);
    return [];
  }

  // Fetch profiles for requesters
  const requesterIds = data.map(r => r.user_id);
  if (requesterIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', requesterIds);

  const profilesMap = new Map(
    (profiles || []).map(p => [p.id, p])
  );

  return data.map(request => ({
    ...request,
    user: profilesMap.get(request.user_id) as UserProfile,
  })).filter(r => r.user);
}

/**
 * Accept a connection request and create activities for both users
 */
export async function acceptConnection(connectionId: string, requesterId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Update the connection status
  const { error: updateError } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId);

  if (updateError) {
    console.error('Error accepting connection:', updateError);
    return false;
  }

  // Get both user profiles for the activity description
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', [user.id, requesterId]);

  const currentUserProfile = profiles?.find(p => p.id === user.id);
  const requesterProfile = profiles?.find(p => p.id === requesterId);

  // Create activity for the accepting user (current user)
  await supabase.from('activities').insert({
    user_id: user.id,
    type: 'connection',
    description: `Connected with ${requesterProfile?.full_name || 'a user'}`,
    related_user_id: requesterId,
  });

  // Create activity for the requester
  await supabase.from('activities').insert({
    user_id: requesterId,
    type: 'connection',
    description: `Connected with ${currentUserProfile?.full_name || 'a user'}`,
    related_user_id: user.id,
  });

  // Create notification for the requester that their request was accepted
  await supabase.from('notifications').insert({
    user_id: requesterId,
    type: 'connection',
    title: `${currentUserProfile?.full_name || 'Someone'} accepted your connection request`,
    description: 'You are now connected',
    related_user_id: user.id,
  });

  return true;
}

/**
 * Decline a connection request
 */
export async function declineConnection(connectionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId);

  if (error) {
    console.error('Error declining connection:', error);
    return false;
  }

  return true;
}

/**
 * Get connected user IDs for the current user
 */
export async function getConnectedUserIds(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get connections where current user is either the requester or the receiver
  const { data, error } = await supabase
    .from('connections')
    .select('user_id, connected_user_id')
    .eq('status', 'accepted')
    .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

  if (error || !data) {
    console.error('Error fetching connected users:', error);
    return [];
  }

  // Extract the other user's ID from each connection
  const connectedIds = data.map(conn =>
    conn.user_id === user.id ? conn.connected_user_id : conn.user_id
  );

  return connectedIds;
}

/**
 * Get connections count for a user
 */
export async function getConnectionsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);

  if (error) {
    console.error('Error getting connections count:', error);
    return 0;
  }

  return count || 0;
}
