export interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  post?: {
    id: string;
    content: string;
    image_url?: string;
    user_id: string;
    created_at: string;
    author?: {
      id: string;
      full_name: string;
      avatar_url?: string;
      role?: string;
    };
  };
  reporter?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  reviewer?: {
    id: string;
    full_name: string;
  };
}

export interface ReportCreate {
  post_id: string;
  reason: string;
  description?: string;
}

export const REPORT_REASONS = [
  'Spam',
  'Harassment or bullying',
  'Hate speech',
  'Violence or threats',
  'Misinformation',
  'Inappropriate content',
  'Impersonation',
  'Other',
] as const;

export const REPORT_STATUSES = [
  { value: 'pending', label: 'Pending Review', color: 'yellow' },
  { value: 'reviewed', label: 'Under Review', color: 'blue' },
  { value: 'dismissed', label: 'Dismissed', color: 'gray' },
  { value: 'action_taken', label: 'Action Taken', color: 'red' },
] as const;
