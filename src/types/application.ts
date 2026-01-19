export type ApplicationStatus = 'pending' | 'reviewed' | 'interviewing' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: ApplicationStatus;
  ai_summary?: string;
  ai_match_score?: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
    requirements?: string;
  };
  applicant?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    location: string;
    bio?: string;
    avatar_url?: string;
    credentials: string[];
  };
}

export interface ApplicationCreate {
  job_id: string;
  cover_letter?: string;
  resume_url?: string;
}

export interface ApplicationUpdate {
  status?: ApplicationStatus;
  ai_summary?: string;
  ai_match_score?: number;
  admin_notes?: string;
}

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-700' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-purple-100 text-purple-700' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];
