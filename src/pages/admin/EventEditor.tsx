import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { EventCreate, EVENT_TIMEZONES } from '@/types/event';
import { getEventById, createEvent, updateEvent } from '@/lib/eventService';

export default function EventEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    const event = await getEventById(id);
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setCoverImageUrl(event.cover_image_url || '');

      // Parse start date/time
      const start = new Date(event.start_date);
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));

      // Parse end date/time if exists
      if (event.end_date) {
        const end = new Date(event.end_date);
        setEndDate(end.toISOString().split('T')[0]);
        setEndTime(end.toTimeString().slice(0, 5));
      }

      setIsAllDay(event.is_all_day);
      setTimezone(event.timezone || 'America/New_York');
      setIsActive(event.is_active);
      setIsFeatured(event.is_featured);
      setMaxAttendees(event.max_attendees ? String(event.max_attendees) : '');
    } else {
      toast.error('Event not found');
      navigate('/admin/events');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!startDate) {
      toast.error('Start date is required');
      return;
    }
    if (!isAllDay && !startTime) {
      toast.error('Start time is required for timed events');
      return;
    }

    setSaving(true);

    // Build start datetime
    let startDateTime: string;
    if (isAllDay) {
      startDateTime = new Date(startDate + 'T00:00:00').toISOString();
    } else {
      startDateTime = new Date(startDate + 'T' + startTime).toISOString();
    }

    // Build end datetime if provided
    let endDateTime: string | undefined;
    if (endDate) {
      if (isAllDay) {
        endDateTime = new Date(endDate + 'T23:59:59').toISOString();
      } else if (endTime) {
        endDateTime = new Date(endDate + 'T' + endTime).toISOString();
      }
    }

    const data: EventCreate = {
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      cover_image_url: coverImageUrl.trim() || undefined,
      start_date: startDateTime,
      end_date: endDateTime,
      timezone,
      is_all_day: isAllDay,
      is_active: isActive,
      is_featured: isFeatured,
      max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
    };

    let result;
    if (isEditing && id) {
      result = await updateEvent(id, data);
    } else {
      result = await createEvent(data);
    }

    setSaving(false);

    if (result) {
      toast.success(isEditing ? 'Event updated' : 'Event created');
      navigate('/admin/events');
    } else {
      toast.error('Failed to save event');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Event' : 'New Event'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update event details' : 'Create a new event'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Community Training Day"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event, what to expect, what to bring, etc."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Fire Station 12, 123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {coverImageUrl && (
                  <div className="mt-2">
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="h-32 w-auto object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>All Day Event</Label>
                  <p className="text-sm text-gray-500">No specific start/end times</p>
                </div>
                <Switch checked={isAllDay} onCheckedChange={setIsAllDay} />
              </div>

              <div>
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Times will be displayed in this timezone
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                {!isAllDay && (
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                {!isAllDay && (
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-gray-500">Show this event to users</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-gray-500">
                    Highlight this event on the events page
                  </p>
                </div>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
