import { supabase } from './supabase';
import { Announcement, AnnouncementCreate, AnnouncementUpdate } from '@/types/announcement';

/**
 * Get all active announcements (for feed display)
 */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .lte('starts_at', new Date().toISOString())
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active announcements:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all announcements (for admin management)
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all announcements:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }

  return data;
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(announcement: AnnouncementCreate): Promise<Announcement | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('announcements')
    .insert({
      ...announcement,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating announcement:', error);
    return null;
  }

  return data;
}

/**
 * Update an announcement
 */
export async function updateAnnouncement(id: string, updates: AnnouncementUpdate): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating announcement:', error);
    return null;
  }

  return data;
}

/**
 * Toggle announcement active status
 */
export async function toggleAnnouncementActive(id: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('announcements')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling announcement:', error);
    return false;
  }

  return true;
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting announcement:', error);
    return false;
  }

  return true;
}

/**
 * Subscribe to announcement changes (real-time)
 */
export function subscribeToAnnouncements(callbacks: {
  onInsert?: (announcement: Announcement) => void;
  onUpdate?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
}) {
  const channel = supabase
    .channel('announcements-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'announcements' },
      (payload) => {
        callbacks.onInsert?.(payload.new as Announcement);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'announcements' },
      (payload) => {
        callbacks.onUpdate?.(payload.new as Announcement);
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'announcements' },
      (payload) => {
        callbacks.onDelete?.(payload.old as Announcement);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
