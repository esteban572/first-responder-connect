export interface Experience {
  id: string;
  user_id: string;
  title: string;
  organization: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExperienceCreate {
  title: string;
  organization: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  is_public: boolean;
}

export interface ExperienceUpdate extends Partial<ExperienceCreate> {
  id: string;
}
