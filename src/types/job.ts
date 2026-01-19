export type JobCategory = 'travel' | 'w2' | '1099' | 'contract' | 'temp' | 'staffing' | 'crisis';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  category: JobCategory;
  type: string;
  description?: string;
  requirements?: string;
  urgent: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobCreate {
  title: string;
  company: string;
  location: string;
  salary: string;
  category: JobCategory;
  type: string;
  description?: string;
  requirements?: string;
  urgent?: boolean;
  is_active?: boolean;
}

export interface JobUpdate {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  category?: JobCategory;
  type?: string;
  description?: string;
  requirements?: string;
  urgent?: boolean;
  is_active?: boolean;
}

export const JOB_CATEGORIES: { value: JobCategory; label: string }[] = [
  { value: 'travel', label: 'Travel' },
  { value: 'w2', label: 'W2' },
  { value: '1099', label: '1099' },
  { value: 'contract', label: 'Contract' },
  { value: 'temp', label: 'Temp' },
  { value: 'staffing', label: 'Staffing' },
  { value: 'crisis', label: 'Crisis' },
];

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'PRN',
  'Per event',
  'On-call',
  '8 weeks',
  '13 weeks',
  '26 weeks',
];
