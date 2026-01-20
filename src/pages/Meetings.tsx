// Video Meetings Page
// List and manage video meetings for the organization

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Play,
  ExternalLink,
  MoreVertical,
  Trash2,
  Copy,
  Check,
  Building2,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useOrganization, SubscriptionGate } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { VideoMeeting, VideoMeetingCreate } from '@/types/organization';
import {
  getOrganizationMeetings,
  createMeeting,
  deleteMeeting,
  canCreateMeeting,
} from '@/lib/videoMeetingService';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';

export default function Meetings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, hasFeature, isSubscribed } = useOrganization();
  const [meetings, setMeetings] = useState<VideoMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<VideoMeetingCreate>({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
  });

  useEffect(() => {
    if (organization) {
      loadMeetings();
    }
  }, [organization?.id]);

  const loadMeetings = async () => {
    if (!organization) return;
    setLoading(true);
    const data = await getOrganizationMeetings(organization.id, { upcoming: true });
    setMeetings(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !formData.title.trim()) return;

    // Check if can create meeting
    const { allowed, reason } = await canCreateMeeting(organization.id);
    if (!allowed) {
      toast.error(reason || 'Cannot create meeting');
      return;
    }

    setCreating(true);
    const meeting = await createMeeting(organization.id, formData);
    setCreating(false);

    if (meeting) {
      toast.success('Meeting created');
      setCreateDialogOpen(false);
      setFormData({ title: '', description: '', scheduled_at: '', duration_minutes: 60 });
      loadMeetings();
    } else {
      toast.error('Failed to create meeting');
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteMeeting(id);
    if (success) {
      toast.success('Meeting deleted');
      loadMeetings();
    } else {
      toast.error('Failed to delete meeting');
    }
  };

  const handleCopyLink = (meeting: VideoMeeting) => {
    const url = `${window.location.origin}/meeting/${meeting.room_id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(meeting.id);
    toast.success('Meeting link copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMeetingTime = (meeting: VideoMeeting) => {
    if (!meeting.scheduled_at) return 'Not scheduled';

    const date = new Date(meeting.scheduled_at);
    if (isPast(date) && meeting.status === 'scheduled') {
      return `Started ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const getStatusBadge = (meeting: VideoMeeting) => {
    switch (meeting.status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        );
      case 'ended':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            Ended
          </span>
        );
      case 'canceled':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            Canceled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
            Scheduled
          </span>
        );
    }
  };

  // Show agency required prompt if user has no organization
  if (!organization) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="feed-card p-8 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Agency Required</h2>
            <p className="text-muted-foreground mb-6">
              Video meetings are available to agency members. Join or create an agency to access this feature.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/agencies')}>
                <Search className="h-4 w-4 mr-2" />
                Browse Agencies
              </Button>
              <Button onClick={() => navigate('/agency/setup')}>
                <Building2 className="h-4 w-4 mr-2" />
                Create Agency
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show upgrade prompt if no video feature
  if (!hasFeature('video_meetings')) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="feed-card p-8 text-center">
            <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Video Meetings</h2>
            <p className="text-muted-foreground mb-6">
              Upgrade to a paid plan to host secure video meetings with your team.
            </p>
            <Button onClick={() => navigate('/settings/billing')}>
              Upgrade Now
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">Video Meetings</h1>
              <p className="text-muted-foreground">
                Host and join secure video conferences
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Meeting
            </Button>
          </div>
        </div>

        {/* Meetings List */}
        <div className="px-4 md:px-0">
          {loading ? (
            <div className="feed-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading meetings...</p>
            </div>
          ) : meetings.length > 0 ? (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="feed-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(meeting)}
                        {meeting.host_id === user?.id && (
                          <span className="text-xs text-muted-foreground">You're hosting</span>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg mb-1 truncate">{meeting.title}</h3>

                      {meeting.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {meeting.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatMeetingTime(meeting)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {meeting.duration_minutes} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Max {meeting.max_participants}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {meeting.status === 'active' || meeting.status === 'scheduled' ? (
                        <Link to={`/meeting/${meeting.room_id}`}>
                          <Button className="gap-2">
                            {meeting.status === 'active' ? (
                              <>
                                <Play className="h-4 w-4" />
                                Join
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-4 w-4" />
                                Start
                              </>
                            )}
                          </Button>
                        </Link>
                      ) : null}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyLink(meeting)}>
                            {copiedId === meeting.id ? (
                              <Check className="h-4 w-4 mr-2" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            Copy Link
                          </DropdownMenuItem>
                          {meeting.host_id === user?.id && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(meeting.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="feed-card p-12 text-center">
              <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No meetings scheduled</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first video meeting to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Meeting
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meeting</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Team Standup"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Schedule For</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !formData.title.trim()}>
                {creating ? 'Creating...' : 'Create Meeting'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
