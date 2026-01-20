// Meeting Room Page
// Full-screen video meeting experience

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Video, Lock, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { VideoMeeting } from '@/types/organization';
import { getMeetingByRoomId, getMeetingParticipants, canJoinMeetingByRoomId } from '@/lib/videoMeetingService';
import { JitsiMeeting } from '@/components/video/JitsiMeeting';
import { format } from 'date-fns';

export default function MeetingRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, hasFeature } = useOrganization();

  const [meeting, setMeeting] = useState<VideoMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadMeeting();
    }
  }, [roomId]);

  const loadMeeting = async () => {
    if (!roomId) return;

    setLoading(true);

    // First check if user can join this meeting (is in the organization)
    const { allowed, reason } = await canJoinMeetingByRoomId(roomId);
    if (!allowed) {
      setError(reason || 'You do not have access to this meeting');
      setLoading(false);
      return;
    }

    const data = await getMeetingByRoomId(roomId);

    if (!data) {
      setError('Meeting not found');
      setLoading(false);
      return;
    }

    if (data.status === 'canceled') {
      setError('This meeting has been canceled');
      setLoading(false);
      return;
    }

    if (data.status === 'ended') {
      setError('This meeting has ended');
      setLoading(false);
      return;
    }

    setMeeting(data);
    setLoading(false);
  };

  const handleMeetingEnd = () => {
    toast.info('Meeting ended');
    navigate('/meetings');
  };

  // Check feature access
  if (!hasFeature('video_meetings')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Upgrade Required</h2>
          <p className="text-muted-foreground mb-4">
            Video meetings require a paid subscription.
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/meetings">
              <Button variant="outline">Go Back</Button>
            </Link>
            <Link to="/settings/billing">
              <Button>Upgrade Now</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Unable to Join</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link to="/meetings">
            <Button>Back to Meetings</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  // Pre-join screen
  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full">
          {/* Back link */}
          <Link
            to="/meetings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Meetings
          </Link>

          {/* Meeting info */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">{meeting.title}</h1>
            {meeting.description && (
              <p className="text-muted-foreground text-sm mb-4">{meeting.description}</p>
            )}

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {meeting.scheduled_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(meeting.scheduled_at), 'MMM d, h:mm a')}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Max {meeting.max_participants}
              </div>
            </div>
          </div>

          {/* Host info */}
          {meeting.host && (
            <div className="flex items-center justify-center gap-2 mb-6 text-sm">
              {meeting.host.avatar_url ? (
                <img
                  src={meeting.host.avatar_url}
                  alt={meeting.host.full_name || 'Host'}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200" />
              )}
              <span className="text-muted-foreground">
                Hosted by{' '}
                <span className="font-medium text-foreground">
                  {meeting.host.full_name || 'Unknown'}
                </span>
              </span>
            </div>
          )}

          {/* Join info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground text-center">
              You'll join as{' '}
              <span className="font-medium text-foreground">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link to="/meetings" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button className="flex-1 gap-2" onClick={() => setJoined(true)}>
              <Video className="h-4 w-4" />
              Join Meeting
            </Button>
          </div>

          {/* Password hint if needed */}
          {meeting.password && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              This meeting is password protected
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full-screen meeting view
  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <JitsiMeeting
        meeting={meeting}
        onMeetingEnd={handleMeetingEnd}
      />
    </div>
  );
}
