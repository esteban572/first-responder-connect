import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'connection' | 'message' | 'job' | 'credential_expiring' | 'credential_expired';
  title: string;
  description?: string;
  read: boolean;
  related_user_id?: string;
  related_post_id?: string;
  related_credential_id?: string;
  created_at: string;
  related_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Get related user profiles
  const relatedUserIds = data
    .filter(n => n.related_user_id)
    .map(n => n.related_user_id);

  if (relatedUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', relatedUserIds);

    const profilesMap = new Map(
      (profiles || []).map(p => [p.id, p])
    );

    return data.map(notification => ({
      ...notification,
      related_user: notification.related_user_id
        ? profilesMap.get(notification.related_user_id)
        : undefined,
    }));
  }

  return data;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  return true;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}

/**
 * Delete all notifications
 */
export async function clearAllNotifications(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }

  return true;
}

/**
 * Subscribe to new notifications (real-time)
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
