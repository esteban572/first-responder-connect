export type AgencyType = 'private' | 'municipal' | 'fire_based' | 'hospital_based' | 'third_service' | 'volunteer';
export type ServiceArea = '911' | 'IFT' | 'CCT' | 'mixed';
export type EmploymentStatus = 'current' | 'former';

export interface Agency {
  id: string;
  name: string;
  city?: string;
  state?: string;
  agency_type?: AgencyType;
  service_area?: ServiceArea;
  website_url?: string;
  logo_url?: string;
  employee_count?: string;
  is_verified: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Computed stats
  review_count?: number;
  avg_overall?: number;
  avg_culture?: number;
  avg_compensation?: number;
  avg_worklife?: number;
  avg_equipment?: number;
  avg_training?: number;
  avg_management?: number;
  recommend_percent?: number;
}

export interface AgencyCreate {
  name: string;
  city?: string;
  state?: string;
  agency_type?: AgencyType;
  service_area?: ServiceArea;
  website_url?: string;
  logo_url?: string;
  employee_count?: string;
}

export interface AgencyReview {
  id: string;
  agency_id: string;
  // user_id is NOT exposed for anonymity
  rating_overall: number;
  rating_culture?: number;
  rating_compensation?: number;
  rating_worklife?: number;
  rating_equipment?: number;
  rating_training?: number;
  rating_management?: number;
  title?: string;
  pros?: string;
  cons?: string;
  review_text?: string;
  advice_to_management?: string;
  employment_status?: EmploymentStatus;
  job_title?: string;
  years_at_agency?: string;
  would_recommend?: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  agency?: Agency;
  user_voted_helpful?: boolean;
  is_own_review?: boolean; // For edit/delete controls
}

export interface AgencyReviewCreate {
  agency_id: string;
  rating_overall: number;
  rating_culture?: number;
  rating_compensation?: number;
  rating_worklife?: number;
  rating_equipment?: number;
  rating_training?: number;
  rating_management?: number;
  title?: string;
  pros?: string;
  cons?: string;
  review_text?: string;
  advice_to_management?: string;
  employment_status?: EmploymentStatus;
  job_title?: string;
  years_at_agency?: string;
  would_recommend?: boolean;
}

export interface AgencyReviewUpdate {
  rating_overall?: number;
  rating_culture?: number;
  rating_compensation?: number;
  rating_worklife?: number;
  rating_equipment?: number;
  rating_training?: number;
  rating_management?: number;
  title?: string;
  pros?: string;
  cons?: string;
  review_text?: string;
  advice_to_management?: string;
  employment_status?: EmploymentStatus;
  job_title?: string;
  years_at_agency?: string;
  would_recommend?: boolean;
}

// Constants for UI
export const AGENCY_TYPES: { value: AgencyType; label: string }[] = [
  { value: 'private', label: 'Private Ambulance' },
  { value: 'municipal', label: 'Municipal/City' },
  { value: 'fire_based', label: 'Fire-Based EMS' },
  { value: 'hospital_based', label: 'Hospital-Based' },
  { value: 'third_service', label: 'Third Service' },
  { value: 'volunteer', label: 'Volunteer' },
];

export const SERVICE_AREAS: { value: ServiceArea; label: string }[] = [
  { value: '911', label: '911 Emergency' },
  { value: 'IFT', label: 'Interfacility Transport' },
  { value: 'CCT', label: 'Critical Care Transport' },
  { value: 'mixed', label: 'Mixed Services' },
];

export const EMPLOYEE_COUNTS = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export const EMPLOYMENT_STATUSES: { value: EmploymentStatus; label: string }[] = [
  { value: 'current', label: 'Current Employee' },
  { value: 'former', label: 'Former Employee' },
];

export const JOB_TITLES = [
  'EMT-Basic',
  'EMT-Advanced',
  'Paramedic',
  'Critical Care Paramedic',
  'Flight Paramedic',
  'Supervisor/Lieutenant',
  'Captain',
  'Chief/Director',
  'Dispatcher',
  'Other',
];

export const YEARS_AT_AGENCY = [
  { value: '<1 year', label: 'Less than 1 year' },
  { value: '1-2 years', label: '1-2 years' },
  { value: '3-5 years', label: '3-5 years' },
  { value: '5-10 years', label: '5-10 years' },
  { value: '10+ years', label: '10+ years' },
];

export const RATING_CATEGORIES = [
  { key: 'rating_overall', label: 'Overall', icon: 'Star' },
  { key: 'rating_culture', label: 'Culture', icon: 'Users' },
  { key: 'rating_compensation', label: 'Compensation', icon: 'DollarSign' },
  { key: 'rating_worklife', label: 'Work-Life Balance', icon: 'Clock' },
  { key: 'rating_equipment', label: 'Equipment', icon: 'Stethoscope' },
  { key: 'rating_training', label: 'Training', icon: 'GraduationCap' },
  { key: 'rating_management', label: 'Management', icon: 'Briefcase' },
];

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];
