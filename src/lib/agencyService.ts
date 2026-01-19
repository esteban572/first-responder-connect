import { supabase } from './supabase';
import {
  Agency,
  AgencyCreate,
  AgencyReview,
  AgencyReviewCreate,
  AgencyReviewUpdate,
} from '@/types/agency';

/**
 * Get agencies with optional filters and stats
 */
export async function getAgencies(filters?: {
  state?: string;
  agency_type?: string;
  service_area?: string;
  search?: string;
  min_rating?: number;
}): Promise<Agency[]> {
  // Use the agency_stats view for computed averages
  let query = supabase
    .from('agency_stats')
    .select('*')
    .order('review_count', { ascending: false });

  if (filters?.state) {
    query = query.eq('state', filters.state);
  }

  if (filters?.agency_type) {
    query = query.eq('agency_type', filters.agency_type);
  }

  if (filters?.service_area) {
    query = query.eq('service_area', filters.service_area);
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters?.min_rating) {
    query = query.gte('avg_overall', filters.min_rating);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching agencies:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single agency by ID with stats
 */
export async function getAgency(id: string): Promise<Agency | null> {
  const { data, error } = await supabase
    .from('agency_stats')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching agency:', error);
    return null;
  }

  return data;
}

/**
 * Create a new agency
 */
export async function createAgency(agency: AgencyCreate): Promise<Agency | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('agencies')
    .insert({
      ...agency,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating agency:', error);
    return null;
  }

  return data;
}

/**
 * Search agencies by name (for autocomplete)
 */
export async function searchAgencies(query: string): Promise<Agency[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from('agencies')
    .select('id, name, city, state')
    .ilike('name', `%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching agencies:', error);
    return [];
  }

  return data || [];
}

/**
 * Get reviews for an agency (anonymous - no user_id exposed)
 */
export async function getAgencyReviews(agencyId: string): Promise<AgencyReview[]> {
  const { data: { user } } = await supabase.auth.getUser();

  // Select reviews without exposing user_id to other users
  const { data, error } = await supabase
    .from('agency_reviews')
    .select(`
      id,
      agency_id,
      rating_overall,
      rating_culture,
      rating_compensation,
      rating_worklife,
      rating_equipment,
      rating_training,
      rating_management,
      title,
      pros,
      cons,
      review_text,
      advice_to_management,
      employment_status,
      job_title,
      years_at_agency,
      would_recommend,
      is_approved,
      helpful_count,
      created_at,
      updated_at,
      user_id
    `)
    .eq('agency_id', agencyId)
    .eq('is_approved', true)
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agency reviews:', error);
    return [];
  }

  // Mark user's own review and check helpful votes
  let reviews = (data || []).map(review => ({
    ...review,
    is_own_review: user ? review.user_id === user.id : false,
    user_id: undefined, // Remove user_id from response for anonymity
  }));

  // Check helpful votes
  if (user && reviews.length > 0) {
    const { data: helpfulVotes } = await supabase
      .from('agency_review_helpful')
      .select('review_id')
      .eq('user_id', user.id)
      .in('review_id', reviews.map(r => r.id));

    const helpfulSet = new Set((helpfulVotes || []).map(v => v.review_id));
    reviews = reviews.map(review => ({
      ...review,
      user_voted_helpful: helpfulSet.has(review.id),
    }));
  }

  return reviews;
}

/**
 * Create an agency review (anonymous)
 */
export async function createAgencyReview(review: AgencyReviewCreate): Promise<AgencyReview | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('agency_reviews')
    .insert({
      ...review,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating agency review:', error);
    return null;
  }

  // Return without user_id for anonymity
  return { ...data, user_id: undefined };
}

/**
 * Update an agency review
 */
export async function updateAgencyReview(id: string, updates: AgencyReviewUpdate): Promise<AgencyReview | null> {
  const { data, error } = await supabase
    .from('agency_reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating agency review:', error);
    return null;
  }

  return { ...data, user_id: undefined };
}

/**
 * Delete an agency review
 */
export async function deleteAgencyReview(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('agency_reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting agency review:', error);
    return false;
  }

  return true;
}

/**
 * Toggle helpful vote on a review
 */
export async function toggleAgencyReviewHelpful(reviewId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if already voted
  const { data: existing } = await supabase
    .from('agency_review_helpful')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Remove vote
    const { error } = await supabase
      .from('agency_review_helpful')
      .delete()
      .eq('id', existing.id);

    return !error;
  } else {
    // Add vote
    const { error } = await supabase
      .from('agency_review_helpful')
      .insert({
        review_id: reviewId,
        user_id: user.id,
      });

    return !error;
  }
}

/**
 * Check if user has reviewed an agency
 */
export async function hasUserReviewedAgency(agencyId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('agency_reviews')
    .select('id')
    .eq('agency_id', agencyId)
    .eq('user_id', user.id)
    .single();

  return !!data;
}

/**
 * Get user's review for an agency
 */
export async function getUserReviewForAgency(agencyId: string): Promise<AgencyReview | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('agency_reviews')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return { ...data, is_own_review: true };
}

/**
 * Get agencies for job board filter (with ratings)
 */
export async function getAgenciesForJobFilter(minRating?: number): Promise<{ id: string; name: string; avg_overall: number }[]> {
  let query = supabase
    .from('agency_stats')
    .select('id, name, avg_overall')
    .gt('review_count', 0)
    .order('name', { ascending: true });

  if (minRating) {
    query = query.gte('avg_overall', minRating);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching agencies for filter:', error);
    return [];
  }

  return data || [];
}

/**
 * Get rating distribution for an agency
 */
export async function getAgencyRatingDistribution(agencyId: string): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from('agency_reviews')
    .select('rating_overall')
    .eq('agency_id', agencyId)
    .eq('is_approved', true);

  if (error) {
    console.error('Error fetching rating distribution:', error);
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (data || []).forEach(r => {
    distribution[r.rating_overall] = (distribution[r.rating_overall] || 0) + 1;
  });

  return distribution;
}
