import { supabase } from './supabase';
import {
  Event,
  EventCreate,
  EventUpdate,
  EventResponse,
  EventResponseRecord,
  EventWithResponse,
  EventAttendee,
} from '@/types/event';

// ============ EVENT CRUD ============

/**
 * Get all active events (for user-facing pages)
 */
export async function getActiveEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching active events:', error);
    return [];
  }
  return data || [];
}

/**
 * Get all events (for admin management)
 */
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
  return data || [];
}

/**
 * Get events for a specific month
 */
export async function getEventsByMonth(year: number, month: number): Promise<Event[]> {
  const startOfMonth = new Date(year, month, 1).toISOString();
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .gte('start_date', startOfMonth)
    .lte('start_date', endOfMonth)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events by month:', error);
    return [];
  }
  return data || [];
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }
  return data;
}

/**
 * Create a new event
 */
export async function createEvent(event: EventCreate): Promise<Event | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...event,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return null;
  }
  return data;
}

/**
 * Update an event
 */
export async function updateEvent(id: string, updates: EventUpdate): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    return null;
  }
  return data;
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }
  return true;
}

// ============ EVENT TOGGLES ============

/**
 * Toggle event active status
 */
export async function toggleEventActive(id: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling event active:', error);
    return false;
  }
  return true;
}

/**
 * Toggle event featured status
 */
export async function toggleEventFeatured(id: string, isFeatured: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling event featured:', error);
    return false;
  }
  return true;
}

// ============ EVENT RESPONSES ============

/**
 * Get user's response to an event
 */
export async function getUserEventResponse(eventId: string, userId: string): Promise<EventResponse | null> {
  const { data, error } = await supabase
    .from('event_responses')
    .select('response')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (error) {
    // No response found is not an error
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching user response:', error);
    return null;
  }
  return data?.response || null;
}

/**
 * Get all user responses for multiple events (for efficiency)
 */
export async function getUserEventResponses(eventIds: string[], userId: string): Promise<Record<string, EventResponse>> {
  if (eventIds.length === 0) return {};

  const { data, error } = await supabase
    .from('event_responses')
    .select('event_id, response')
    .eq('user_id', userId)
    .in('event_id', eventIds);

  if (error) {
    console.error('Error fetching user responses:', error);
    return {};
  }

  const responses: Record<string, EventResponse> = {};
  data?.forEach((item) => {
    responses[item.event_id] = item.response;
  });
  return responses;
}

/**
 * Set or update user's response to an event (upsert pattern)
 */
export async function setEventResponse(eventId: string, response: EventResponse): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('event_responses')
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        response: response,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'event_id,user_id',
      }
    );

  if (error) {
    console.error('Error setting event response:', error);
    return false;
  }
  return true;
}

/**
 * Remove user's response to an event
 */
export async function removeEventResponse(eventId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('event_responses')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error removing event response:', error);
    return false;
  }
  return true;
}

// ============ ATTENDEES ============

/**
 * Get attendees for an event with profile info
 */
export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const { data, error } = await supabase
    .from('event_responses')
    .select(`
      user_id,
      response,
      created_at,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq('event_id', eventId)
    .neq('response', 'not_going')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching attendees:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    user_id: item.user_id,
    response: item.response,
    full_name: item.profiles?.full_name || null,
    avatar_url: item.profiles?.avatar_url || null,
    created_at: item.created_at,
  }));
}

// ============ COMBINED QUERIES ============

/**
 * Get events with user's responses (for user-facing pages)
 */
export async function getEventsWithResponses(userId: string): Promise<EventWithResponse[]> {
  const events = await getActiveEvents();
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.id);
  const responses = await getUserEventResponses(eventIds, userId);

  return events.map((event) => ({
    ...event,
    user_response: responses[event.id] || null,
  }));
}

/**
 * Get upcoming events (next 30 days)
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const now = new Date().toISOString();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .gte('start_date', now)
    .lte('start_date', thirtyDaysFromNow)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
  return data || [];
}

/**
 * Get featured events
 */
export async function getFeaturedEvents(): Promise<Event[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .gte('start_date', now)
    .order('start_date', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching featured events:', error);
    return [];
  }
  return data || [];
}
