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
  OrganizationReview,
  OrganizationReviewCreate,
} from '@/types/organization';

// ============================================
// ORGANIZATION CRUD
// ============================================

export async function createOrganization(data: OrganizationCreate): Promise<Organization | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user');
    return null;
  }

  console.log('Creating organization with:', { ...data, owner_id: user.id });

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url || null,
      primary_color: data.primary_color || '#f97316',
      secondary_color: data.secondary_color || '#1e3a5f',
      owner_id: user.id,
      // Agency fields
      city: data.city || null,
      state: data.state || null,
      agency_type: data.agency_type || null,
      service_area: data.service_area || null,
      website_url: data.website_url || null,
      employee_count: data.employee_count || null,
      is_public: data.is_public ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating organization:', error.message, error.details, error.hint);
    return null;
  }

  console.log('Organization created:', org);
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

// Create a direct invite for a specific user (by user ID)
export async function createDirectInvite(
  orgId: string,
  userId: string,
  role: OrgRole = 'member'
): Promise<OrganizationInvite | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get the target user's email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.email) {
    console.error('Error fetching user profile:', profileError);
    return null;
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .single();

  if (existingMember) {
    console.error('User is already a member of this organization');
    return null;
  }

  // Check if there's already a pending invite for this user
  const { data: existingInvite } = await supabase
    .from('organization_invites')
    .select('id')
    .eq('organization_id', orgId)
    .eq('email', profile.email.toLowerCase())
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existingInvite) {
    console.error('User already has a pending invite');
    return null;
  }

  const { data: invite, error } = await supabase
    .from('organization_invites')
    .insert({
      organization_id: orgId,
      email: profile.email.toLowerCase(),
      user_id: userId,
      role: role === 'owner' ? 'admin' : role, // Can't invite as owner
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating direct invite:', error);
    return null;
  }

  return invite;
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

// ============================================
// PUBLIC AGENCIES (Organizations with reviews)
// ============================================

export async function getPublicAgencies(options?: {
  state?: string;
  agency_type?: string;
  service_area?: string;
  search?: string;
  min_rating?: number;
}): Promise<Organization[]> {
  let query = supabase
    .from('organizations')
    .select('*')
    .eq('is_public', true)
    .order('name', { ascending: true });

  if (options?.state) {
    query = query.eq('state', options.state);
  }

  if (options?.agency_type) {
    query = query.eq('agency_type', options.agency_type);
  }

  if (options?.service_area) {
    query = query.eq('service_area', options.service_area);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,city.ilike.%${options.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching public agencies:', error);
    return [];
  }

  // Fetch review stats for each organization
  if (data && data.length > 0) {
    const orgIds = data.map(o => o.id);
    const { data: stats } = await supabase
      .from('organization_reviews')
      .select('organization_id, rating_overall, would_recommend')
      .in('organization_id', orgIds)
      .eq('is_approved', true);

    if (stats) {
      // Calculate stats per organization
      const statsMap = new Map<string, {
        count: number;
        totalRating: number;
        recommendCount: number;
      }>();

      stats.forEach(review => {
        const existing = statsMap.get(review.organization_id) || {
          count: 0,
          totalRating: 0,
          recommendCount: 0,
        };
        existing.count++;
        existing.totalRating += review.rating_overall;
        if (review.would_recommend) existing.recommendCount++;
        statsMap.set(review.organization_id, existing);
      });

      data.forEach(org => {
        const orgStats = statsMap.get(org.id);
        if (orgStats) {
          org.review_count = orgStats.count;
          org.avg_overall = Math.round((orgStats.totalRating / orgStats.count) * 10) / 10;
          org.recommend_percent = Math.round((orgStats.recommendCount / orgStats.count) * 100);
        } else {
          org.review_count = 0;
        }
      });
    }
  }

  // Filter by min rating if specified
  if (options?.min_rating && data) {
    return data.filter(org => (org.avg_overall || 0) >= options.min_rating!);
  }

  return data || [];
}

export async function getPublicAgency(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching agency:', error);
    return null;
  }

  // Fetch review stats
  const { data: stats } = await supabase
    .from('organization_reviews')
    .select('rating_overall, rating_culture, rating_compensation, rating_worklife, rating_equipment, rating_training, rating_management, would_recommend')
    .eq('organization_id', id)
    .eq('is_approved', true);

  if (stats && stats.length > 0) {
    data.review_count = stats.length;
    data.avg_overall = Math.round((stats.reduce((sum, r) => sum + r.rating_overall, 0) / stats.length) * 10) / 10;
    data.avg_culture = Math.round((stats.reduce((sum, r) => sum + (r.rating_culture || 0), 0) / stats.filter(r => r.rating_culture).length) * 10) / 10 || undefined;
    data.avg_compensation = Math.round((stats.reduce((sum, r) => sum + (r.rating_compensation || 0), 0) / stats.filter(r => r.rating_compensation).length) * 10) / 10 || undefined;
    data.avg_worklife = Math.round((stats.reduce((sum, r) => sum + (r.rating_worklife || 0), 0) / stats.filter(r => r.rating_worklife).length) * 10) / 10 || undefined;
    data.avg_equipment = Math.round((stats.reduce((sum, r) => sum + (r.rating_equipment || 0), 0) / stats.filter(r => r.rating_equipment).length) * 10) / 10 || undefined;
    data.avg_training = Math.round((stats.reduce((sum, r) => sum + (r.rating_training || 0), 0) / stats.filter(r => r.rating_training).length) * 10) / 10 || undefined;
    data.avg_management = Math.round((stats.reduce((sum, r) => sum + (r.rating_management || 0), 0) / stats.filter(r => r.rating_management).length) * 10) / 10 || undefined;
    data.recommend_percent = Math.round((stats.filter(r => r.would_recommend).length / stats.length) * 100);
  }

  return data;
}

// ============================================
// ORGANIZATION REVIEWS
// ============================================

export async function getOrganizationReviews(orgId: string): Promise<OrganizationReview[]> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('organization_reviews')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  // Check which reviews the user has voted helpful on
  if (user && data && data.length > 0) {
    const reviewIds = data.map(r => r.id);
    const { data: helpfulVotes } = await supabase
      .from('organization_review_helpful')
      .select('review_id')
      .eq('user_id', user.id)
      .in('review_id', reviewIds);

    const votedSet = new Set(helpfulVotes?.map(v => v.review_id) || []);

    data.forEach(review => {
      review.user_voted_helpful = votedSet.has(review.id);
      review.is_own_review = review.user_id === user.id;
    });
  }

  return data || [];
}

export async function createOrganizationReview(
  data: OrganizationReviewCreate
): Promise<OrganizationReview | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: review, error } = await supabase
    .from('organization_reviews')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return null;
  }

  return review;
}

export async function updateOrganizationReview(
  id: string,
  data: Partial<OrganizationReviewCreate>
): Promise<OrganizationReview | null> {
  const { data: review, error } = await supabase
    .from('organization_reviews')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    return null;
  }

  return review;
}

export async function deleteOrganizationReview(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('organization_reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting review:', error);
    return false;
  }

  return true;
}

export async function toggleReviewHelpful(reviewId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if already voted
  const { data: existing } = await supabase
    .from('organization_review_helpful')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Remove vote
    const { error } = await supabase
      .from('organization_review_helpful')
      .delete()
      .eq('id', existing.id);

    return !error;
  } else {
    // Add vote
    const { error } = await supabase
      .from('organization_review_helpful')
      .insert({
        review_id: reviewId,
        user_id: user.id,
      });

    return !error;
  }
}

export async function hasUserReviewedOrganization(orgId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('organization_reviews')
    .select('id')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single();

  return !!data;
}

export async function getUserReviewForOrganization(orgId: string): Promise<OrganizationReview | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('organization_reviews')
    .select('*')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
}

export async function getOrganizationRatingDistribution(orgId: string): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from('organization_reviews')
    .select('rating_overall')
    .eq('organization_id', orgId)
    .eq('is_approved', true);

  if (error || !data) return {};

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach(review => {
    const rating = review.rating_overall;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });

  return distribution;
}
