// Organization Types for Multi-Tenant SaaS

export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type MeetingStatus = 'scheduled' | 'active' | 'ended' | 'canceled';
export type ParticipantRole = 'host' | 'co-host' | 'participant';
export type ParticipantStatus = 'invited' | 'joined' | 'left' | 'declined';
export type InviteRole = 'admin' | 'member' | 'viewer';

export type AgencyType = 'private' | 'municipal' | 'fire_based' | 'hospital_based' | 'third_service' | 'volunteer';
export type ServiceArea = '911' | 'IFT' | 'CCT' | 'mixed';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan;
  revenuecat_customer_id: string | null;
  owner_id: string;
  settings: Record<string, unknown>;
  max_members: number;
  features_enabled: string[];
  created_at: string;
  updated_at: string;
  // Agency-specific fields
  city?: string;
  state?: string;
  agency_type?: AgencyType;
  service_area?: ServiceArea;
  website_url?: string;
  employee_count?: string;
  is_public: boolean;
  is_verified: boolean;
  // Computed stats (from view)
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

export interface OrganizationCreate {
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  // Agency fields
  city?: string;
  state?: string;
  agency_type?: AgencyType;
  service_area?: ServiceArea;
  website_url?: string;
  employee_count?: string;
  is_public?: boolean;
}

export interface OrganizationUpdate {
  name?: string;
  slug?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  settings?: Record<string, unknown>;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string;
  created_at: string;
  // Joined from profiles
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  email: string;
  role: InviteRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface InviteCreate {
  email: string;
  role?: InviteRole;
}

export interface VideoMeeting {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  room_id: string;
  scheduled_at: string | null;
  duration_minutes: number;
  status: MeetingStatus;
  host_id: string;
  max_participants: number;
  recording_enabled: boolean;
  waiting_room_enabled: boolean;
  password: string | null;
  settings: Record<string, unknown>;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  host?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  participants_count?: number;
}

export interface VideoMeetingCreate {
  title: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  max_participants?: number;
  recording_enabled?: boolean;
  waiting_room_enabled?: boolean;
  password?: string;
}

export interface VideoMeetingUpdate {
  title?: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  status?: MeetingStatus;
  max_participants?: number;
  recording_enabled?: boolean;
  waiting_room_enabled?: boolean;
  password?: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string | null;
  email: string | null;
  name: string | null;
  role: ParticipantRole;
  status: ParticipantStatus;
  joined_at: string | null;
  left_at: string | null;
  created_at: string;
  // Joined from profiles
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface SubscriptionEvent {
  id: string;
  organization_id: string;
  event_type: string;
  product_id: string | null;
  entitlement_id: string | null;
  revenue_cat_event_id: string | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

// Subscription plan features
export const PLAN_FEATURES: Record<SubscriptionPlan, {
  maxMembers: number;
  videoMeetingsPerMonth: number | 'unlimited';
  features: string[];
}> = {
  free: {
    maxMembers: 5,
    videoMeetingsPerMonth: 3, // Limited free meetings for testing
    features: ['basic_messaging', 'job_board', 'credentials', 'video_meetings'], // TODO: Remove video_meetings for production
  },
  starter: {
    maxMembers: 15,
    videoMeetingsPerMonth: 5,
    features: ['basic_messaging', 'job_board', 'credentials', 'video_meetings', 'events'],
  },
  pro: {
    maxMembers: 50,
    videoMeetingsPerMonth: 'unlimited',
    features: ['basic_messaging', 'job_board', 'credentials', 'video_meetings', 'events', 'analytics', 'custom_branding'],
  },
  enterprise: {
    maxMembers: Infinity,
    videoMeetingsPerMonth: 'unlimited',
    features: ['basic_messaging', 'job_board', 'credentials', 'video_meetings', 'events', 'analytics', 'custom_branding', 'api_access', 'sso', 'priority_support'],
  },
};

// Helper to check if a plan has a feature
export const planHasFeature = (plan: SubscriptionPlan, feature: string): boolean => {
  return PLAN_FEATURES[plan].features.includes(feature);
};

// Helper to check if org can add more members
export const canAddMembers = (org: Organization, currentCount: number): boolean => {
  return currentCount < org.max_members;
};

// Organization/Agency Review Types
export type EmploymentStatus = 'current' | 'former';

export interface OrganizationReview {
  id: string;
  organization_id: string;
  user_id: string;
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
  // Computed
  user_voted_helpful?: boolean;
  is_own_review?: boolean;
}

export interface OrganizationReviewCreate {
  organization_id: string;
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

// Agency/Organization Constants
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

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

// Review form constants
export const EMPLOYMENT_STATUSES = [
  { value: 'current', label: 'Current Employee' },
  { value: 'former', label: 'Former Employee' },
];

export const JOB_TITLES = [
  'EMT',
  'EMT-Basic',
  'EMT-Advanced',
  'Paramedic',
  'Critical Care Paramedic',
  'Flight Paramedic',
  'Dispatcher',
  'Supervisor',
  'Manager',
  'Training Officer',
  'Fleet/Logistics',
  'Administrative',
  'Other',
];

export const YEARS_AT_AGENCY = [
  { value: '<1', label: 'Less than 1 year' },
  { value: '1-2', label: '1-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

export const RATING_CATEGORIES = [
  { key: 'rating_overall', label: 'Overall' },
  { key: 'rating_culture', label: 'Culture' },
  { key: 'rating_compensation', label: 'Compensation' },
  { key: 'rating_worklife', label: 'Work-Life Balance' },
  { key: 'rating_equipment', label: 'Equipment' },
  { key: 'rating_training', label: 'Training' },
  { key: 'rating_management', label: 'Management' },
];
