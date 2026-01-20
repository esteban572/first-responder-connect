import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Star, Calendar, MapPin, Users } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Event } from '@/types/event';
import {
  getAllEvents,
  toggleEventActive,
  toggleEventFeatured,
  deleteEvent,
} from '@/lib/eventService';

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await getAllEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = await toggleEventActive(id, !currentStatus);
    if (success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_active: !currentStatus } : e))
      );
      toast.success(`Event ${!currentStatus ? 'activated' : 'deactivated'}`);
    } else {
      toast.error('Failed to update event');
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    const success = await toggleEventFeatured(id, !currentStatus);
    if (success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_featured: !currentStatus } : e))
      );
      toast.success(`Event ${!currentStatus ? 'featured' : 'unfeatured'}`);
    } else {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await deleteEvent(deleteId);
    if (success) {
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success('Event deleted');
    } else {
      toast.error('Failed to delete event');
    }
    setDeleteId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isPastEvent = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Manage community events</p>
          </div>
          <Link to="/admin/events/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No events yet</p>
              <Link to="/admin/events/new">
                <Button>Create your first event</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="flex">
                  <div
                    className={`w-2 flex-shrink-0 ${
                      event.is_featured
                        ? 'bg-yellow-500'
                        : event.is_active
                        ? isPastEvent(event.start_date)
                          ? 'bg-gray-400'
                          : 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          {event.is_featured && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Featured
                            </span>
                          )}
                          {event.is_all_day && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                              All Day
                            </span>
                          )}
                          {isPastEvent(event.start_date) && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Past
                            </span>
                          )}
                          {event.is_active ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(event.start_date)}
                            {!event.is_all_day && ` at ${formatTime(event.start_date)}`}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.going_count} going · {event.interested_count} interested · {event.maybe_count} maybe
                          </span>
                          {event.max_attendees && (
                            <span>Max: {event.max_attendees}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Active</span>
                            <Switch
                              checked={event.is_active}
                              onCheckedChange={() =>
                                handleToggleActive(event.id, event.is_active)
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Featured</span>
                            <Switch
                              checked={event.is_featured}
                              onCheckedChange={() =>
                                handleToggleFeatured(event.id, event.is_featured)
                              }
                            />
                          </div>
                        </div>
                        <Link to={`/admin/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This will also remove all
              attendee responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
