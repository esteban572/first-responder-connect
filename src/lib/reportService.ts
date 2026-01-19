import { supabase } from './supabase';
import { Report, ReportCreate } from '@/types/report';

/**
 * Create a new report
 */
export async function createReport(report: ReportCreate): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if user already reported this post
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('post_id', report.post_id)
    .eq('reporter_id', user.id)
    .single();

  if (existing) {
    // Already reported
    return false;
  }

  const { error } = await supabase
    .from('reports')
    .insert({
      ...report,
      reporter_id: user.id,
      status: 'pending',
    });

  if (error) {
    console.error('Error creating report:', error);
    return false;
  }

  return true;
}

/**
 * Get all reports (admin)
 */
export async function getAllReports(status?: string): Promise<Report[]> {
  // First fetch reports
  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: reportsData, error: reportsError } = await query;

  if (reportsError) {
    console.error('Error fetching reports:', reportsError);
    return [];
  }

  if (!reportsData || reportsData.length === 0) {
    return [];
  }

  // Get unique post IDs, reporter IDs, and reviewer IDs
  const postIds = [...new Set(reportsData.map(r => r.post_id))];
  const reporterIds = [...new Set(reportsData.map(r => r.reporter_id))];
  const reviewerIds = [...new Set(reportsData.filter(r => r.reviewed_by).map(r => r.reviewed_by))];

  // Fetch posts
  const { data: postsData } = await supabase
    .from('posts')
    .select('id, content, image_url, user_id, created_at')
    .in('id', postIds);

  // Get post author IDs
  const postAuthorIds = postsData ? [...new Set(postsData.map(p => p.user_id))] : [];

  // Fetch all profiles (reporters, reviewers, post authors)
  const allProfileIds = [...new Set([...reporterIds, ...reviewerIds, ...postAuthorIds])];
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .in('id', allProfileIds);

  // Create maps
  const profilesMap = new Map(
    (profilesData || []).map(p => [p.id, p])
  );

  const postsMap = new Map(
    (postsData || []).map(p => [p.id, {
      ...p,
      author: profilesMap.get(p.user_id) || null,
    }])
  );

  // Combine data
  return reportsData.map(report => ({
    ...report,
    post: postsMap.get(report.post_id) || null,
    reporter: profilesMap.get(report.reporter_id) || null,
    reviewer: report.reviewed_by ? profilesMap.get(report.reviewed_by) || null : null,
  }));
}

/**
 * Get pending reports count (admin)
 */
export async function getPendingReportsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending reports count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Update report status (admin)
 */
export async function updateReportStatus(
  reportId: string,
  status: string,
  adminNotes?: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('reports')
    .update({
      status,
      admin_notes: adminNotes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    console.error('Error updating report:', error);
    return false;
  }

  return true;
}

/**
 * Delete a reported post and mark report as action taken (admin)
 */
export async function deleteReportedPost(reportId: string, postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Delete the post
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (deleteError) {
    console.error('Error deleting post:', deleteError);
    return false;
  }

  // Update all reports for this post to action_taken
  const { error: updateError } = await supabase
    .from('reports')
    .update({
      status: 'action_taken',
      admin_notes: 'Post deleted by admin',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('post_id', postId);

  if (updateError) {
    console.error('Error updating reports:', updateError);
  }

  return true;
}
