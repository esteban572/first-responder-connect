// Group Types for Public & Private Groups Feature

export type GroupVisibility = 'public' | 'private';
export type GroupMemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type GroupMemberStatus = 'active' | 'pending' | 'banned';

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  visibility: GroupVisibility;
  owner_id: string;
  member_count: number;
  post_count: number;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  owner?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  // Current user's membership (when fetched with membership)
  membership?: {
    role: GroupMemberRole;
    status: GroupMemberStatus;
    joined_at: string;
  };
}

export interface GroupCreate {
  name: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  visibility?: GroupVisibility;
}

export interface GroupUpdate {
  name?: string;
  slug?: string;
  description?: string;
  cover_image_url?: string;
  visibility?: GroupVisibility;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joined_at: string;
  // Joined from profiles
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role?: string;
  };
}

export interface GroupInvite {
  id: string;
  group_id: string;
  user_id: string | null;
  email: string | null;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  // Joined from groups
  group?: {
    id: string;
    name: string;
    cover_image_url: string | null;
  };
  // Joined from profiles
  inviter?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface GroupInviteCreate {
  user_id?: string;
  email?: string;
}
