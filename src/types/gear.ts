export interface GearCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
}

export interface GearItem {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category_id: string;
  description?: string;
  image_url?: string;
  price_range?: string;
  specs?: Record<string, string | number>;
  website_url?: string;
  created_by?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields from joins
  category?: GearCategory;
  review_count?: number;
  avg_rating?: number;
}

export interface GearItemCreate {
  name: string;
  brand?: string;
  model?: string;
  category_id: string;
  description?: string;
  image_url?: string;
  price_range?: string;
  specs?: Record<string, string | number>;
  website_url?: string;
}

export interface GearReview {
  id: string;
  gear_item_id: string;
  user_id: string;
  rating: number;
  title?: string;
  pros?: string[];
  cons?: string[];
  review_text?: string;
  years_of_use?: string;
  verified_purchase: boolean;
  helpful_count: number;
  images?: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
  gear_item?: GearItem;
  user_voted_helpful?: boolean;
}

export interface GearReviewCreate {
  gear_item_id: string;
  rating: number;
  title?: string;
  pros?: string[];
  cons?: string[];
  review_text?: string;
  years_of_use?: string;
  images?: string[];
}

export interface GearReviewUpdate {
  rating?: number;
  title?: string;
  pros?: string[];
  cons?: string[];
  review_text?: string;
  years_of_use?: string;
  images?: string[];
}

// Predefined categories with icons (matching Lucide icon names)
export const GEAR_CATEGORIES: { id: string; name: string; icon: string }[] = [
  { id: 'monitors', name: 'Cardiac Monitors', icon: 'Heart' },
  { id: 'ventilators', name: 'Ventilators & Airway', icon: 'Wind' },
  { id: 'stretchers', name: 'Stretchers & Transport', icon: 'BedDouble' },
  { id: 'bags', name: 'Bags & Organizers', icon: 'Briefcase' },
  { id: 'diagnostic', name: 'Diagnostic Tools', icon: 'Activity' },
  { id: 'ppe', name: 'PPE & Safety', icon: 'Shield' },
  { id: 'uniforms', name: 'Uniforms & Boots', icon: 'Shirt' },
  { id: 'tools', name: 'Tools & Shears', icon: 'Scissors' },
  { id: 'lighting', name: 'Lighting', icon: 'Flashlight' },
  { id: 'ambulance', name: 'Ambulance Chassis', icon: 'Truck' },
  { id: 'software', name: 'Software & Apps', icon: 'Smartphone' },
  { id: 'iv', name: 'IV & Vascular Access', icon: 'Droplet' },
  { id: 'medications', name: 'Medication Delivery', icon: 'Pill' },
  { id: 'communications', name: 'Radios & Comms', icon: 'Radio' },
  { id: 'other', name: 'Other Equipment', icon: 'Package' },
];

export const PRICE_RANGES = [
  { value: '$', label: 'Budget ($0-50)' },
  { value: '$$', label: 'Mid-Range ($50-200)' },
  { value: '$$$', label: 'Premium ($200-500)' },
  { value: '$$$$', label: 'Professional ($500+)' },
];

export const YEARS_OF_USE = [
  { value: '<1 year', label: 'Less than 1 year' },
  { value: '1-2 years', label: '1-2 years' },
  { value: '3-5 years', label: '3-5 years' },
  { value: '5+ years', label: '5+ years' },
];
