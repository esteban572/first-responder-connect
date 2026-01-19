// Organization Service Layer
// Handles multi-tenant operations, members, and invites

import { supabase } from '@/lib/supabase';
import {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationInvite,
  InviteCreate,
  OrgRole,
} from '@/types/organization';

// ============================================
// ORGANIZATION CRUD
// ============================================

export async function createOrganization(data: OrganizationCreate): Promise<Organization | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      ...data,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating organization:', error);
    return null;
  }

  return org;
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data;
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching organization by slug:', error);
    return null;
  }

  return data;
}

export async function getUserOrganizations(): Promise<Organization[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organizations (*)
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching user organizations:', error);
    return [];
  }

  return data?.map((m: any) => m.organizations).filter(Boolean) || [];
}

export async function getCurrentOrganization(): Promise<Organization | null> {
  const orgs = await getUserOrganizations();
  // Return the first org (in a real app, you might store the current org in localStorage)
  return orgs[0] || null;
}

export async function updateOrganization(
  id: string,
  data: OrganizationUpdate
): Promise<Organization | null> {
  const { data: org, error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating organization:', error);
    return null;
  }

  return org;
}

export async function deleteOrganization(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting organization:', error);
    return false;
  }

  return true;
}

// Check if slug is available
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const { data, error, count } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug);

  if (error) {
    console.error('Error checking slug:', error);
    // On error, assume available to not block user - actual uniqueness is enforced by DB
    return true;
  }

  return (count || 0) === 0;
}

// ============================================
// ORGANIZATION MEMBERS
// ============================================

export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      user:profiles!user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching organization members:', error);
    return [];
  }

  return data || [];
}

export async function getMemberRole(orgId: string, userId?: string): Promise<OrgRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  const targetUserId = userId || user?.id;
  if (!targetUserId) return null;

  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', targetUserId)
    .single();

  if (error) {
    console.error('Error fetching member role:', error);
    return null;
  }

  return data?.role as OrgRole;
}

export async function updateMemberRole(
  orgId: string,
  memberId: string,
  role: OrgRole
): Promise<boolean> {
  const { error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('organization_id', orgId)
    .eq('id', memberId);

  if (error) {
    console.error('Error updating member role:', error);
    return false;
  }

  return true;
}

export async function removeMember(orgId: string, memberId: string): Promise<boolean> {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', orgId)
    .eq('id', memberId);

  if (error) {
    console.error('Error removing member:', error);
    return false;
  }

  return true;
}

export async function leaveOrganization(orgId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', orgId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error leaving organization:', error);
    return false;
  }

  return true;
}

// ============================================
// ORGANIZATION INVITES
// ============================================

export async function createInvite(
  orgId: string,
  data: InviteCreate
): Promise<OrganizationInvite | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: invite, error } = await supabase
    .from('organization_invites')
    .insert({
      organization_id: orgId,
      email: data.email.toLowerCase(),
      role: data.role || 'member',
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invite:', error);
    return null;
  }

  return invite;
}

export async function getOrganizationInvites(orgId: string): Promise<OrganizationInvite[]> {
  const { data, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('organization_id', orgId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invites:', error);
    return [];
  }

  return data || [];
}

export async function getInviteByToken(token: string): Promise<OrganizationInvite | null> {
  const { data, error } = await supabase
    .from('organization_invites')
    .select(`
      *,
      organizations (
        id,
        name,
        logo_url
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

export async function acceptInvite(token: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get the invite
  const { data: invite, error: inviteError } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (inviteError || !invite) {
    console.error('Error fetching invite:', inviteError);
    return false;
  }

  // Add user to organization
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: invite.organization_id,
      user_id: user.id,
      role: invite.role,
      invited_by: invite.invited_by,
      invited_at: invite.created_at,
    });

  if (memberError) {
    console.error('Error adding member:', memberError);
    return false;
  }

  // Mark invite as accepted
  await supabase
    .from('organization_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  return true;
}

export async function cancelInvite(inviteId: string): Promise<boolean> {
  const { error } = await supabase
    .from('organization_invites')
    .delete()
    .eq('id', inviteId);

  if (error) {
    console.error('Error canceling invite:', error);
    return false;
  }

  return true;
}

// ============================================
// SUBSCRIPTION HELPERS
// ============================================

export async function getSubscriptionStatus(orgId: string): Promise<{
  status: string;
  plan: string;
  features: string[];
} | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('subscription_status, subscription_plan, features_enabled')
    .eq('id', orgId)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return {
    status: data.subscription_status,
    plan: data.subscription_plan,
    features: data.features_enabled || [],
  };
}

export async function hasFeature(orgId: string, feature: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('org_has_feature', {
    p_org_id: orgId,
    p_feature: feature,
  });

  if (error) {
    console.error('Error checking feature:', error);
    return false;
  }

  return !!data;
}

// ============================================
// ORGANIZATION STATS
// ============================================

export async function getOrganizationStats(orgId: string): Promise<{
  memberCount: number;
  pendingInvites: number;
  meetingsThisMonth: number;
} | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get member count
  const { count: memberCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  // Get pending invites
  const { count: pendingInvites } = await supabase
    .from('organization_invites')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString());

  // Get meetings this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: meetingsThisMonth } = await supabase
    .from('video_meetings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .gte('created_at', startOfMonth.toISOString());

  return {
    memberCount: memberCount || 0,
    pendingInvites: pendingInvites || 0,
    meetingsThisMonth: meetingsThisMonth || 0,
  };
}
