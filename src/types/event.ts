// Event response options
export type EventResponse = 'going' | 'interested' | 'maybe' | 'not_going';

export const EVENT_RESPONSE_OPTIONS: { value: EventResponse; label: string; icon: string }[] = [
  { value: 'going', label: 'Going', icon: 'CheckCircle' },
  { value: 'interested', label: 'Interested', icon: 'Star' },
  { value: 'maybe', label: 'Maybe', icon: 'HelpCircle' },
  { value: 'not_going', label: 'Not Going', icon: 'XCircle' },
];

// Common US timezones for event scheduling
export const EVENT_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', abbr: 'ET' },
  { value: 'America/Chicago', label: 'Central Time (CT)', abbr: 'CT' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', abbr: 'MT' },
  { value: 'America/Phoenix', label: 'Arizona (MST)', abbr: 'MST' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', abbr: 'PT' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', abbr: 'AKT' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', abbr: 'HST' },
  { value: 'UTC', label: 'UTC', abbr: 'UTC' },
];

// Event interface matching the database schema
export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  cover_image_url: string | null;
  start_date: string;
  end_date: string | null;
  timezone: string;
  is_all_day: boolean;
  is_active: boolean;
  is_featured: boolean;
  max_attendees: number | null;
  going_count: number;
  interested_count: number;
  maybe_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Event response (user's RSVP to an event)
export interface EventResponseRecord {
  id: string;
  event_id: string;
  user_id: string;
  response: EventResponse;
  created_at: string;
  updated_at: string;
}

// For creating a new event
export interface EventCreate {
  title: string;
  description?: string;
  location?: string;
  cover_image_url?: string;
  start_date: string;
  end_date?: string;
  timezone?: string;
  is_all_day?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  max_attendees?: number | null;
}

// For updating an event
export interface EventUpdate {
  title?: string;
  description?: string;
  location?: string;
  cover_image_url?: string;
  start_date?: string;
  end_date?: string | null;
  timezone?: string;
  is_all_day?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  max_attendees?: number | null;
}

// Event with user's response (for display purposes)
export interface EventWithResponse extends Event {
  user_response?: EventResponse | null;
}

// Attendee info for displaying in modal
export interface EventAttendee {
  user_id: string;
  response: EventResponse;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}
