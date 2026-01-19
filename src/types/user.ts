export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  location: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  credentials: string[];
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  role?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  credentials?: string[];
}

export interface UserConnection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}
