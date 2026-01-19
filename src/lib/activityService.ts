import { supabase } from './supabase';

export interface Activity {
  id: string;
  user_id: string;
  type: 'connection' | 'post' | 'like' | 'comment';
  description: string;
  related_user_id?: string;
  related_post_id?: string;
  created_at: string;
  related_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

/**
 * Get activities for a user's profile (visible to others)
 */
export async function getUserActivities(userId: string, limit: number = 10): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Get related user profiles
  const relatedUserIds = data
    .filter(a => a.related_user_id)
    .map(a => a.related_user_id);

  if (relatedUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', relatedUserIds);

    const profilesMap = new Map(
      (profiles || []).map(p => [p.id, p])
    );

    return data.map(activity => ({
      ...activity,
      related_user: activity.related_user_id
        ? profilesMap.get(activity.related_user_id)
        : undefined,
    }));
  }

  return data;
}

/**
 * Create an activity entry
 */
export async function createActivity(
  type: Activity['type'],
  description: string,
  relatedUserId?: string,
  relatedPostId?: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('activities')
    .insert({
      user_id: user.id,
      type,
      description,
      related_user_id: relatedUserId || null,
      related_post_id: relatedPostId || null,
    });

  if (error) {
    console.error('Error creating activity:', error);
    return false;
  }

  return true;
}
