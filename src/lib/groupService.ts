// Group Service Layer
// Handles CRUD operations for public and private groups

import { supabase } from '@/lib/supabase';
import {
  Group,
  GroupCreate,
  GroupUpdate,
  GroupMember,
  GroupInvite,
  GroupInviteCreate,
  GroupMemberRole,
} from '@/types/group';

// ============================================
// GROUP CRUD
// ============================================

export async function createGroup(data: GroupCreate): Promise<Group | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user');
    return null;
  }

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      cover_image_url: data.cover_image_url || null,
      visibility: data.visibility || 'public',
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    return null;
  }

  return group;
}

export async function getGroup(id: string): Promise<Group | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching group:', error);
    return null;
  }

  // Fetch owner info
  if (data?.owner_id) {
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', data.owner_id)
      .single();

    if (ownerData) {
      data.owner = ownerData;
    }
  }

  // Fetch current user's membership if authenticated
  if (user && data) {
    const { data: membership } = await supabase
      .from('group_members')
      .select('role, status, joined_at')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single();

    if (membership) {
      data.membership = membership;
    }
  }

  return data;
}

export async function getGroupBySlug(slug: string): Promise<Group | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching group by slug:', error);
    return null;
  }

  // Fetch owner info
  if (data?.owner_id) {
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', data.owner_id)
      .single();

    if (ownerData) {
      data.owner = ownerData;
    }
  }

  // Fetch current user's membership if authenticated
  if (user && data) {
    const { data: membership } = await supabase
      .from('group_members')
      .select('role, status, joined_at')
      .eq('group_id', data.id)
      .eq('user_id', user.id)
      .single();

    if (membership) {
      data.membership = membership;
    }
  }

  return data;
}

export async function updateGroup(id: string, data: GroupUpdate): Promise<Group | null> {
  const { data: group, error } = await supabase
    .from('groups')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating group:', error);
    return null;
  }

  return group;
}

export async function deleteGroup(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting group:', error);
    return false;
  }

  return true;
}

// Check if slug is available
export async function isGroupSlugAvailable(slug: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('groups')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug);

  if (error) {
    console.error('Error checking slug:', error);
    return true; // Assume available on error
  }

  return (count || 0) === 0;
}

// ============================================
// GROUP LISTING
// ============================================

export async function getPublicGroups(options?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Group[]> {
  let query = supabase
    .from('groups')
    .select('*')
    .eq('visibility', 'public')
    .order('member_count', { ascending: false });

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching public groups:', error);
    return [];
  }

  // Fetch owners for all groups
  if (data && data.length > 0) {
    const ownerIds = [...new Set(data.map(g => g.owner_id))];
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', ownerIds);

    if (owners) {
      const ownerMap = new Map(owners.map(o => [o.id, o]));
      data.forEach(group => {
        group.owner = ownerMap.get(group.owner_id) || undefined;
      });
    }
  }

  return data || [];
}

export async function getUserGroups(): Promise<Group[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      role,
      status,
      joined_at,
      groups (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }

  // Transform data and add membership info
  const groups = data?.map((m: any) => ({
    ...m.groups,
    membership: {
      role: m.role,
      status: m.status,
      joined_at: m.joined_at,
    },
  })).filter(Boolean) || [];

  // Fetch owners for all groups
  if (groups.length > 0) {
    const ownerIds = [...new Set(groups.map(g => g.owner_id))];
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', ownerIds);

    if (owners) {
      const ownerMap = new Map(owners.map(o => [o.id, o]));
      groups.forEach(group => {
        group.owner = ownerMap.get(group.owner_id) || undefined;
      });
    }
  }

  return groups;
}

// ============================================
// GROUP MEMBERSHIP
// ============================================

export async function joinGroup(groupId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if group is public
  const { data: group } = await supabase
    .from('groups')
    .select('visibility')
    .eq('id', groupId)
    .single();

  if (!group || group.visibility !== 'public') {
    console.error('Cannot join non-public group directly');
    return false;
  }

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member',
      status: 'active',
    });

  if (error) {
    console.error('Error joining group:', error);
    return false;
  }

  return true;
}

export async function requestToJoin(groupId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member',
      status: 'pending',
    });

  if (error) {
    console.error('Error requesting to join group:', error);
    return false;
  }

  return true;
}

export async function leaveGroup(groupId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Can't leave if you're the owner
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  if (membership?.role === 'owner') {
    console.error('Owner cannot leave group. Transfer ownership or delete the group.');
    return false;
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error leaving group:', error);
    return false;
  }

  return true;
}

// ============================================
// GROUP MEMBERS MANAGEMENT
// ============================================

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      user:profiles!user_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('group_id', groupId)
    .eq('status', 'active')
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching group members:', error);
    return [];
  }

  return data || [];
}

export async function getPendingMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      user:profiles!user_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending members:', error);
    return [];
  }

  return data || [];
}

export async function approveMember(groupId: string, memberId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_members')
    .update({ status: 'active' })
    .eq('group_id', groupId)
    .eq('id', memberId);

  if (error) {
    console.error('Error approving member:', error);
    return false;
  }

  return true;
}

export async function updateMemberRole(
  groupId: string,
  memberId: string,
  role: GroupMemberRole
): Promise<boolean> {
  // Can't change to owner role this way
  if (role === 'owner') {
    console.error('Cannot assign owner role directly');
    return false;
  }

  const { error } = await supabase
    .from('group_members')
    .update({ role })
    .eq('group_id', groupId)
    .eq('id', memberId);

  if (error) {
    console.error('Error updating member role:', error);
    return false;
  }

  return true;
}

export async function removeMember(groupId: string, memberId: string): Promise<boolean> {
  // Check if trying to remove owner
  const { data: member } = await supabase
    .from('group_members')
    .select('role')
    .eq('id', memberId)
    .single();

  if (member?.role === 'owner') {
    console.error('Cannot remove group owner');
    return false;
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('id', memberId);

  if (error) {
    console.error('Error removing member:', error);
    return false;
  }

  return true;
}

export async function banMember(groupId: string, memberId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_members')
    .update({ status: 'banned' })
    .eq('group_id', groupId)
    .eq('id', memberId);

  if (error) {
    console.error('Error banning member:', error);
    return false;
  }

  return true;
}

// ============================================
// GROUP INVITES
// ============================================

export async function inviteToGroup(
  groupId: string,
  data: GroupInviteCreate
): Promise<GroupInvite | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: invite, error } = await supabase
    .from('group_invites')
    .insert({
      group_id: groupId,
      user_id: data.user_id || null,
      email: data.email?.toLowerCase() || null,
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating group invite:', error);
    return null;
  }

  return invite;
}

export async function getGroupInvites(groupId: string): Promise<GroupInvite[]> {
  const { data, error } = await supabase
    .from('group_invites')
    .select('*')
    .eq('group_id', groupId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching group invites:', error);
    return [];
  }

  return data || [];
}

export async function getInviteByToken(token: string): Promise<GroupInvite | null> {
  const { data, error } = await supabase
    .from('group_invites')
    .select(`
      *,
      group:groups (
        id,
        name,
        cover_image_url
      )
    `)
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    console.error('Error fetching invite:', error);
    return null;
  }

  return data;
}

export async function acceptGroupInvite(token: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get the invite
  const { data: invite, error: inviteError } = await supabase
    .from('group_invites')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (inviteError || !invite) {
    console.error('Error fetching invite:', inviteError);
    return false;
  }

  // Add user to group
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: invite.group_id,
      user_id: user.id,
      role: 'member',
      status: 'active',
    });

  if (memberError) {
    console.error('Error adding member:', memberError);
    return false;
  }

  // Mark invite as accepted
  await supabase
    .from('group_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  return true;
}

export async function cancelGroupInvite(inviteId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_invites')
    .delete()
    .eq('id', inviteId);

  if (error) {
    console.error('Error canceling invite:', error);
    return false;
  }

  return true;
}

// ============================================
// USER PENDING INVITES
// ============================================

export async function getUserPendingInvites(): Promise<GroupInvite[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('group_invites')
    .select(`
      *,
      group:groups (
        id,
        name,
        cover_image_url
      ),
      inviter:profiles!invited_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user invites:', error);
    return [];
  }

  return data || [];
}
