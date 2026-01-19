export interface MediaItem {
  id: string;
  user_id: string;
  url: string;
  type: 'photo' | 'video';
  caption?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaItemCreate {
  url: string;
  type: 'photo' | 'video';
  caption?: string;
}
