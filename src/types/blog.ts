export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  category: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  userReaction?: 'like' | 'dislike' | null;
  isSaved?: boolean;
}

export interface BlogPostCreate {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  category: string;
  tags?: string[];
  is_published?: boolean;
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  cover_image_url?: string;
  category?: string;
  tags?: string[];
  is_published?: boolean;
}

export interface BlogComment {
  id: string;
  blog_post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  likes_count: number;
  dislikes_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  replies?: BlogComment[];
  userReaction?: 'like' | 'dislike' | null;
}

export interface BlogCommentCreate {
  blog_post_id: string;
  content: string;
  parent_id?: string;
}

export interface SavedArticle {
  id: string;
  user_id: string;
  blog_post_id: string;
  created_at: string;
  blog_post?: BlogPost;
}

export const BLOG_CATEGORIES = [
  'Industry News',
  'Career Advice',
  'Training & Education',
  'Equipment & Gear',
  'Mental Health',
  'Success Stories',
  'Policy & Regulations',
  'Technology',
];
