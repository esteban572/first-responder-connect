// Video Meeting Service Layer
// Handles Jitsi video conferencing integration

import { supabase } from '@/lib/supabase';
import {
  VideoMeeting,
  VideoMeetingCreate,
  VideoMeetingUpdate,
  MeetingParticipant,
} from '@/types/organization';

// ============================================
// MEETING CRUD
// ============================================

export async function createMeeting(
  orgId: string,
  data: VideoMeetingCreate
): Promise<VideoMeeting | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Generate secure room ID
  const roomId = generateSecureRoomId(orgId);

  const { data: meeting, error } = await supabase
    .from('video_meetings')
    .insert({
      organization_id: orgId,
      host_id: user.id,
      room_id: roomId,
      title: data.title,
      description: data.description || null,
      scheduled_at: data.scheduled_at || null, // Convert empty string to null
      duration_minutes: data.duration_minutes || 60,
      max_participants: data.max_participants || 10,
      recording_enabled: data.recording_enabled || false,
      waiting_room_enabled: data.waiting_room_enabled ?? true,
      password: data.password || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating meeting:', error);
    return null;
  }

  // Add host as participant
  await supabase
    .from('meeting_participants')
    .insert({
      meeting_id: meeting.id,
      user_id: user.id,
      role: 'host',
      status: 'invited',
    });

  return meeting;
}

export async function getMeeting(id: string): Promise<VideoMeeting | null> {
  const { data, error } = await supabase
    .from('video_meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching meeting:', error);
    return null;
  }

  // Fetch host info separately
  if (data?.host_id) {
    const { data: hostData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', data.host_id)
      .single();

    if (hostData) {
      data.host = hostData;
    }
  }

  return data;
}

export async function getMeetingByRoomId(roomId: string): Promise<VideoMeeting | null> {
  const { data, error } = await supabase
    .from('video_meetings')
    .select('*')
    .eq('room_id', roomId)
    .single();

  if (error) {
    console.error('Error fetching meeting by room:', error);
    return null;
  }

  // Fetch host info separately
  if (data?.host_id) {
    const { data: hostData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', data.host_id)
      .single();

    if (hostData) {
      data.host = hostData;
    }
  }

  return data;
}

export async function getOrganizationMeetings(
  orgId: string,
  options?: {
    status?: string;
    upcoming?: boolean;
    limit?: number;
  }
): Promise<VideoMeeting[]> {
  let query = supabase
    .from('video_meetings')
    .select('*')
    .eq('organization_id', orgId)
    .order('scheduled_at', { ascending: true, nullsFirst: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.upcoming) {
    query = query
      .in('status', ['scheduled', 'active'])
      .or(`scheduled_at.gte.${new Date().toISOString()},scheduled_at.is.null`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }

  // Fetch host info for all meetings
  if (data && data.length > 0) {
    const hostIds = [...new Set(data.map(m => m.host_id))];
    const { data: hosts } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', hostIds);

    if (hosts) {
      const hostMap = new Map(hosts.map(h => [h.id, h]));
      data.forEach(meeting => {
        meeting.host = hostMap.get(meeting.host_id) || null;
      });
    }
  }

  return data || [];
}

export async function getUserMeetings(options?: {
  status?: string;
  upcoming?: boolean;
}): Promise<VideoMeeting[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('video_meetings')
    .select('*')
    .eq('host_id', user.id)
    .order('scheduled_at', { ascending: true, nullsFirst: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.upcoming) {
    query = query
      .in('status', ['scheduled', 'active'])
      .or(`scheduled_at.gte.${new Date().toISOString()},scheduled_at.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user meetings:', error);
    return [];
  }

  // Fetch host info (will be the current user)
  if (data && data.length > 0) {
    const { data: hostData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (hostData) {
      data.forEach(meeting => {
        meeting.host = hostData;
      });
    }
  }

  return data || [];
}

export async function updateMeeting(
  id: string,
  data: VideoMeetingUpdate
): Promise<VideoMeeting | null> {
  const { data: meeting, error } = await supabase
    .from('video_meetings')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating meeting:', error);
    return null;
  }

  return meeting;
}

export async function startMeeting(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('video_meetings')
    .update({
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error starting meeting:', error);
    return false;
  }

  return true;
}

export async function endMeeting(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('video_meetings')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error ending meeting:', error);
    return false;
  }

  return true;
}

export async function cancelMeeting(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('video_meetings')
    .update({ status: 'canceled' })
    .eq('id', id);

  if (error) {
    console.error('Error canceling meeting:', error);
    return false;
  }

  return true;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('video_meetings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting meeting:', error);
    return false;
  }

  return true;
}

// ============================================
// PARTICIPANTS
// ============================================

export async function getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
  const { data, error } = await supabase
    .from('meeting_participants')
    .select(`
      *,
      user:profiles!user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }

  return data || [];
}

export async function addParticipant(
  meetingId: string,
  userId?: string,
  email?: string,
  name?: string
): Promise<MeetingParticipant | null> {
  const { data, error } = await supabase
    .from('meeting_participants')
    .insert({
      meeting_id: meetingId,
      user_id: userId,
      email,
      name,
      role: 'participant',
      status: 'invited',
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding participant:', error);
    return null;
  }

  return data;
}

export async function updateParticipantStatus(
  participantId: string,
  status: 'invited' | 'joined' | 'left' | 'declined'
): Promise<boolean> {
  const updates: Record<string, unknown> = { status };

  if (status === 'joined') {
    updates.joined_at = new Date().toISOString();
  } else if (status === 'left') {
    updates.left_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('meeting_participants')
    .update(updates)
    .eq('id', participantId);

  if (error) {
    console.error('Error updating participant:', error);
    return false;
  }

  return true;
}

export async function joinMeeting(meetingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if already a participant
  const { data: existing } = await supabase
    .from('meeting_participants')
    .select('id')
    .eq('meeting_id', meetingId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return updateParticipantStatus(existing.id, 'joined');
  }

  // Add as new participant
  const participant = await addParticipant(meetingId, user.id);
  if (participant) {
    return updateParticipantStatus(participant.id, 'joined');
  }

  return false;
}

export async function leaveMeeting(meetingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing } = await supabase
    .from('meeting_participants')
    .select('id')
    .eq('meeting_id', meetingId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return updateParticipantStatus(existing.id, 'left');
  }

  return false;
}

// ============================================
// JITSI HELPERS
// ============================================

// Generate a secure, unguessable room ID
export function generateSecureRoomId(orgId: string): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const hex = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${orgId.slice(0, 8)}-${hex}`;
}

// Get Jitsi configuration for a meeting
export function getJitsiConfig(meeting: VideoMeeting, userName: string, userEmail?: string) {
  return {
    roomName: meeting.room_id,
    width: '100%',
    height: '100%',
    parentNode: undefined, // Set in component
    configOverwrite: {
      startWithAudioMuted: true,
      startWithVideoMuted: false,
      prejoinPageEnabled: meeting.waiting_room_enabled,
      disableDeepLinking: true,
      enableClosePage: false,
      enableWelcomePage: false,
      disableModeratorIndicator: false,
      enableEmailInStats: false,
      // Disable features based on subscription
      disableRecordAudioNotification: !meeting.recording_enabled,
      fileRecordingsEnabled: meeting.recording_enabled,
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: [
        'microphone',
        'camera',
        'closedcaptions',
        'desktop',
        'fullscreen',
        'fodeviceselection',
        'hangup',
        'chat',
        'raisehand',
        'tileview',
        'select-background',
        'settings',
        'videoquality',
      ],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      BRAND_WATERMARK_LINK: '',
      SHOW_POWERED_BY: false,
      SHOW_PROMOTIONAL_CLOSE_PAGE: false,
      MOBILE_APP_PROMO: false,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
    },
    userInfo: {
      displayName: userName,
      email: userEmail,
    },
  };
}

// Check if user can join a meeting (must be in the meeting's organization)
export async function canJoinMeeting(meetingId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, reason: 'You must be logged in to join meetings' };
  }

  // Get the meeting
  const { data: meeting, error: meetingError } = await supabase
    .from('video_meetings')
    .select('organization_id')
    .eq('id', meetingId)
    .single();

  if (meetingError || !meeting) {
    return { allowed: false, reason: 'Meeting not found' };
  }

  // Check if user is a member of the meeting's organization
  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', meeting.organization_id)
    .eq('user_id', user.id)
    .single();

  if (memberError || !membership) {
    return { allowed: false, reason: 'You must be a member of this agency to join this meeting' };
  }

  return { allowed: true };
}

// Check if user can join a meeting by room ID (must be in the meeting's organization)
export async function canJoinMeetingByRoomId(roomId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, reason: 'You must be logged in to join meetings' };
  }

  // Get the meeting
  const { data: meeting, error: meetingError } = await supabase
    .from('video_meetings')
    .select('organization_id')
    .eq('room_id', roomId)
    .single();

  if (meetingError || !meeting) {
    return { allowed: false, reason: 'Meeting not found' };
  }

  // Check if user is a member of the meeting's organization
  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', meeting.organization_id)
    .eq('user_id', user.id)
    .single();

  if (memberError || !membership) {
    return { allowed: false, reason: 'You must be a member of this agency to join this meeting' };
  }

  return { allowed: true };
}

// Check if user can create meetings based on subscription
export async function canCreateMeeting(orgId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const { data: org, error } = await supabase
    .from('organizations')
    .select('subscription_status, subscription_plan')
    .eq('id', orgId)
    .single();

  if (error || !org) {
    return { allowed: false, reason: 'Organization not found' };
  }

  // TODO: Uncomment for production to require paid subscription
  // if (org.subscription_plan === 'free') {
  //   return { allowed: false, reason: 'Video meetings require a paid subscription' };
  // }

  // Free plan limited to 3 meetings per month
  if (org.subscription_plan === 'free') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('video_meetings')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', startOfMonth.toISOString());

    if ((count || 0) >= 3) {
      return { allowed: false, reason: 'Monthly meeting limit reached (3 meetings on free plan)' };
    }
  }

  // Allow free status for testing - TODO: restrict for production
  if (org.subscription_status !== 'active' && org.subscription_status !== 'trialing' && org.subscription_status !== 'free') {
    return { allowed: false, reason: 'Subscription is not active' };
  }

  // Check meeting limits for starter plan
  if (org.subscription_plan === 'starter') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('video_meetings')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', startOfMonth.toISOString());

    if ((count || 0) >= 5) {
      return { allowed: false, reason: 'Monthly meeting limit reached (5 meetings)' };
    }
  }

  return { allowed: true };
}
