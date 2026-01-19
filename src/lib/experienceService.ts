import { supabase } from './supabase';
import { Experience, ExperienceCreate, ExperienceUpdate } from '@/types/experience';

/**
 * Get all experiences for the current user
 */
export async function getMyExperiences(): Promise<Experience[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('user_id', user.id)
    .order('is_current', { ascending: false })
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }

  return data || [];
}

/**
 * Get public experiences for a user (for viewing other profiles)
 */
export async function getUserPublicExperiences(userId: string): Promise<Experience[]> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('is_current', { ascending: false })
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching user experiences:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new experience
 */
export async function createExperience(experienceData: ExperienceCreate): Promise<Experience | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('experiences')
    .insert({
      user_id: user.id,
      ...experienceData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating experience:', error);
    throw new Error(`Failed to create experience: ${error.message}`);
  }

  return data;
}

/**
 * Update an experience
 */
export async function updateExperience(experienceData: ExperienceUpdate): Promise<Experience | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { id, ...updateData } = experienceData;

  const { data, error } = await supabase
    .from('experiences')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating experience:', error);
    throw new Error(`Failed to update experience: ${error.message}`);
  }

  return data;
}

/**
 * Delete an experience
 */
export async function deleteExperience(experienceId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', experienceId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting experience:', error);
    return false;
  }

  return true;
}

/**
 * Toggle visibility of an experience
 */
export async function toggleExperienceVisibility(experienceId: string, isPublic: boolean): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('experiences')
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('id', experienceId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error toggling experience visibility:', error);
    return false;
  }

  return true;
}

/**
 * Set all experiences visibility at once
 */
export async function setAllExperiencesVisibility(isPublic: boolean): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('experiences')
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error setting experiences visibility:', error);
    return false;
  }

  return true;
}
