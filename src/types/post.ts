export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  location?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  };
}

export interface PostCreate {
  content: string;
  image_url?: string;
  location?: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

export interface CommentCreate {
  post_id: string;
  content: string;
  parent_id?: string;
}
