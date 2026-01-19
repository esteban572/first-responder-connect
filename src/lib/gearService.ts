import { supabase } from './supabase';
import {
  GearCategory,
  GearItem,
  GearItemCreate,
  GearReview,
  GearReviewCreate,
  GearReviewUpdate,
} from '@/types/gear';

/**
 * Get all gear categories
 */
export async function getGearCategories(): Promise<GearCategory[]> {
  const { data, error } = await supabase
    .from('gear_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching gear categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Get gear items with optional filters
 */
export async function getGearItems(filters?: {
  category_id?: string;
  brand?: string;
  search?: string;
}): Promise<GearItem[]> {
  let query = supabase
    .from('gear_items')
    .select('*')
    .eq('is_approved', true)
    .order('name', { ascending: true });

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters?.brand) {
    query = query.eq('brand', filters.brand);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching gear items:', error);
    return [];
  }

  // Get review stats for each item
  const itemsWithStats = await Promise.all(
    (data || []).map(async (item) => {
      const stats = await getGearItemStats(item.id);
      return { ...item, ...stats };
    })
  );

  return itemsWithStats;
}

/**
 * Get a single gear item by ID
 */
export async function getGearItem(id: string): Promise<GearItem | null> {
  const { data, error } = await supabase
    .from('gear_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching gear item:', error);
    return null;
  }

  const stats = await getGearItemStats(id);
  return { ...data, ...stats };
}

/**
 * Get review stats for a gear item
 */
export async function getGearItemStats(itemId: string): Promise<{ review_count: number; avg_rating: number }> {
  const { data, error } = await supabase
    .from('gear_reviews')
    .select('rating')
    .eq('gear_item_id', itemId);

  if (error || !data || data.length === 0) {
    return { review_count: 0, avg_rating: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return {
    review_count: data.length,
    avg_rating: Math.round((sum / data.length) * 10) / 10,
  };
}

/**
 * Create a new gear item
 */
export async function createGearItem(item: GearItemCreate): Promise<GearItem | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('gear_items')
    .insert({
      ...item,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating gear item:', error);
    return null;
  }

  return data;
}

/**
 * Get reviews for a gear item
 */
export async function getGearReviews(gearItemId: string): Promise<GearReview[]> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('gear_reviews')
    .select(`
      *,
      user:profiles!gear_reviews_user_id_fkey(id, full_name, avatar_url, role)
    `)
    .eq('gear_item_id', gearItemId)
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gear reviews:', error);
    return [];
  }

  // Check if current user voted helpful on each review
  if (user && data) {
    const { data: helpfulVotes } = await supabase
      .from('gear_review_helpful')
      .select('review_id')
      .eq('user_id', user.id)
      .in('review_id', data.map(r => r.id));

    const helpfulSet = new Set((helpfulVotes || []).map(v => v.review_id));
    return data.map(review => ({
      ...review,
      user_voted_helpful: helpfulSet.has(review.id),
    }));
  }

  return data || [];
}

/**
 * Create a gear review
 */
export async function createGearReview(review: GearReviewCreate): Promise<GearReview | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('gear_reviews')
    .insert({
      ...review,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating gear review:', error);
    return null;
  }

  return data;
}

/**
 * Update a gear review
 */
export async function updateGearReview(id: string, updates: GearReviewUpdate): Promise<GearReview | null> {
  const { data, error } = await supabase
    .from('gear_reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating gear review:', error);
    return null;
  }

  return data;
}

/**
 * Delete a gear review
 */
export async function deleteGearReview(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('gear_reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting gear review:', error);
    return false;
  }

  return true;
}

/**
 * Toggle helpful vote on a review
 */
export async function toggleGearReviewHelpful(reviewId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if already voted
  const { data: existing } = await supabase
    .from('gear_review_helpful')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Remove vote
    const { error } = await supabase
      .from('gear_review_helpful')
      .delete()
      .eq('id', existing.id);

    return !error;
  } else {
    // Add vote
    const { error } = await supabase
      .from('gear_review_helpful')
      .insert({
        review_id: reviewId,
        user_id: user.id,
      });

    return !error;
  }
}

/**
 * Get unique brands for filtering
 */
export async function getGearBrands(categoryId?: string): Promise<string[]> {
  let query = supabase
    .from('gear_items')
    .select('brand')
    .eq('is_approved', true)
    .not('brand', 'is', null);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  // Get unique brands
  const brands = [...new Set((data || []).map(d => d.brand).filter(Boolean))] as string[];
  return brands.sort();
}

/**
 * Check if user has reviewed an item
 */
export async function hasUserReviewedItem(gearItemId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('gear_reviews')
    .select('id')
    .eq('gear_item_id', gearItemId)
    .eq('user_id', user.id)
    .single();

  return !!data;
}

/**
 * Get user's review for an item
 */
export async function getUserReviewForItem(gearItemId: string): Promise<GearReview | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('gear_reviews')
    .select('*')
    .eq('gear_item_id', gearItemId)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
}
