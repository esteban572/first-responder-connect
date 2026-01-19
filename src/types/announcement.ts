export interface Announcement {
  id: string;
  title: string;
  content: string;
  background_color: string;
  text_color: string;
  font_family: string;
  font_size: string;
  is_active: boolean;
  priority: number;
  starts_at: string;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementCreate {
  title: string;
  content: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  font_size?: string;
  is_active?: boolean;
  priority?: number;
  starts_at?: string;
  expires_at?: string | null;
}

export interface AnnouncementUpdate {
  title?: string;
  content?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  font_size?: string;
  is_active?: boolean;
  priority?: number;
  starts_at?: string;
  expires_at?: string | null;
}

export interface ColorPreset {
  name: string;
  value: string;
  textColor: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Emergency Orange', value: '#f97316', textColor: '#ffffff' },
  { name: 'Alert Red', value: '#dc2626', textColor: '#ffffff' },
  { name: 'Info Blue', value: '#2563eb', textColor: '#ffffff' },
  { name: 'Success Green', value: '#16a34a', textColor: '#ffffff' },
  { name: 'Warning Amber', value: '#d97706', textColor: '#ffffff' },
  { name: 'Navy Primary', value: '#1e3a5f', textColor: '#ffffff' },
  { name: 'Purple', value: '#7c3aed', textColor: '#ffffff' },
  { name: 'Teal', value: '#0d9488', textColor: '#ffffff' },
];

export interface FontOption {
  name: string;
  value: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Space Grotesk', value: 'Space Grotesk' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'System UI', value: 'system-ui' },
];

export interface FontSizeOption {
  name: string;
  value: string;
  className: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { name: 'Small', value: 'sm', className: 'text-sm' },
  { name: 'Normal', value: 'base', className: 'text-base' },
  { name: 'Large', value: 'lg', className: 'text-lg' },
  { name: 'Extra Large', value: 'xl', className: 'text-xl' },
];
