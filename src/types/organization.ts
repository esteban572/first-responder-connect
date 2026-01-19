// Organization Types for Multi-Tenant SaaS

export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type MeetingStatus = 'scheduled' | 'active' | 'ended' | 'canceled';
export type ParticipantRole = 'host' | 'co-host' | 'participant';
export type ParticipantStatus = 'invited' | 'joined' | 'left' | 'declined';
export type InviteRole = 'admin' | 'member' | 'viewer';

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
}

export interface OrganizationCreate {
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
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
    videoMeetingsPerMonth: 0,
    features: ['basic_messaging', 'job_board', 'credentials'],
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
