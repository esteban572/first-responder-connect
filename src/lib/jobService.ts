import { supabase } from './supabase';
import { Job, JobCreate, JobUpdate } from '@/types/job';

/**
 * Get all active jobs (for public job board)
 */
export async function getActiveJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('urgent', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active jobs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all jobs (for admin management)
 */
export async function getAllJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single job by ID
 */
export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return null;
  }

  return data;
}

/**
 * Create a new job
 */
export async function createJob(job: JobCreate): Promise<Job | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      ...job,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating job:', error);
    return null;
  }

  return data;
}

/**
 * Update a job
 */
export async function updateJob(id: string, updates: JobUpdate): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating job:', error);
    return null;
  }

  return data;
}

/**
 * Toggle job active status
 */
export async function toggleJobActive(id: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling job:', error);
    return false;
  }

  return true;
}

/**
 * Toggle job urgent status
 */
export async function toggleJobUrgent(id: string, urgent: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .update({ urgent, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling job urgent:', error);
    return false;
  }

  return true;
}

/**
 * Delete a job
 */
export async function deleteJob(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting job:', error);
    return false;
  }

  return true;
}
