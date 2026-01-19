import { supabase } from './supabase';
import { Application, ApplicationCreate, ApplicationUpdate } from '@/types/application';

/**
 * Submit a job application
 */
export async function submitApplication(application: ApplicationCreate): Promise<Application | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if user already applied to this job
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', application.job_id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    throw new Error('You have already applied to this job');
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...application,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting application:', error);
    return null;
  }

  return data;
}

/**
 * Get user's applications
 */
export async function getUserApplications(): Promise<Application[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(id, title, company, location)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user applications:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if user has applied to a job
 */
export async function hasApplied(jobId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', user.id)
    .single();

  return !!data;
}

/**
 * Get all applications for a job (admin)
 */
export async function getJobApplications(jobId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      applicant:profiles(id, full_name, email, role, location, bio, avatar_url, credentials)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching job applications:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all applications (admin)
 */
export async function getAllApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(id, title, company, location, requirements),
      applicant:profiles(id, full_name, email, role, location, bio, avatar_url, credentials)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all applications:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single application by ID (admin)
 */
export async function getApplicationById(id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(id, title, company, location, requirements),
      applicant:profiles(id, full_name, email, role, location, bio, avatar_url, credentials)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching application:', error);
    return null;
  }

  return data;
}

/**
 * Update an application (admin)
 */
export async function updateApplication(id: string, updates: ApplicationUpdate): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating application:', error);
    return null;
  }

  return data;
}

/**
 * Delete an application (admin)
 */
export async function deleteApplication(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting application:', error);
    return false;
  }

  return true;
}

/**
 * Upload resume PDF
 */
export async function uploadResume(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading resume:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Generate AI summary and match score
 */
export async function generateAISummary(applicationId: string): Promise<{ summary: string; matchScore: number } | null> {
  const application = await getApplicationById(applicationId);
  if (!application || !application.applicant || !application.job) {
    return null;
  }

  const { applicant, job } = application;

  // Build the prompt for AI analysis
  const prompt = `Analyze this job application and provide:
1. A brief summary (2-3 sentences) of the applicant's fit for the role
2. A match score from 0-100

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Requirements: ${job.requirements || 'Not specified'}

APPLICANT DETAILS:
- Name: ${applicant.full_name}
- Current Role: ${applicant.role}
- Location: ${applicant.location}
- Bio: ${applicant.bio || 'Not provided'}
- Credentials: ${applicant.credentials?.join(', ') || 'None listed'}
- Cover Letter: ${application.cover_letter || 'Not provided'}

Respond in JSON format only:
{"summary": "...", "matchScore": 85}`;

  try {
    // Call your AI endpoint (you'll need to set this up)
    const response = await fetch('/api/ai/analyze-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      // Fallback: generate a basic summary without AI
      return generateBasicSummary(application);
    }

    const result = await response.json();
    return {
      summary: result.summary,
      matchScore: result.matchScore,
    };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    // Fallback to basic summary
    return generateBasicSummary(application);
  }
}

/**
 * Generate a basic summary without AI (fallback)
 */
function generateBasicSummary(application: Application): { summary: string; matchScore: number } {
  const { applicant, job } = application;
  if (!applicant || !job) {
    return { summary: 'Unable to generate summary.', matchScore: 0 };
  }

  const credentialCount = applicant.credentials?.length || 0;
  const hasRelevantRole = applicant.role?.toLowerCase().includes('medic') ||
                          applicant.role?.toLowerCase().includes('nurse') ||
                          applicant.role?.toLowerCase().includes('emt');
  const sameLocation = applicant.location?.toLowerCase().includes(job.location?.toLowerCase().split(',')[0] || '');

  let score = 50; // Base score
  if (credentialCount > 0) score += credentialCount * 5;
  if (hasRelevantRole) score += 15;
  if (sameLocation) score += 10;
  if (application.cover_letter) score += 10;
  score = Math.min(score, 95); // Cap at 95

  const summary = `${applicant.full_name} is a ${applicant.role} based in ${applicant.location}. ` +
    `They have ${credentialCount} credential${credentialCount !== 1 ? 's' : ''} listed` +
    (application.cover_letter ? ' and submitted a cover letter.' : '.');

  return { summary, matchScore: score };
}
