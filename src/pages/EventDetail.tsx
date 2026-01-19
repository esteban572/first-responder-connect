import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Download,
  Share2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EventResponseButtons } from '@/components/events/EventResponseButtons';
import { AttendeesModal } from '@/components/events/AttendeesModal';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventResponse } from '@/types/event';
import { getEventById, getUserEventResponse } from '@/lib/eventService';
import { downloadEventIcs } from '@/lib/icsGenerator';
import { toast } from 'sonner';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [userResponse, setUserResponse] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id, user]);

  const loadEvent = async () => {
    setLoading(true);
    const eventData = await getEventById(id!);
    if (eventData) {
      setEvent(eventData);
      if (user) {
        const response = await getUserEventResponse(id!, user.id);
        setUserResponse(response);
      }
    } else {
      toast.error('Event not found');
      navigate('/events');
    }
    setLoading(false);
  };

  const handleResponseChange = (response: EventResponse | null) => {
    setUserResponse(response);
    // Update local event counts
    if (event) {
      const updatedEvent = { ...event };
      // This is a simplified update; the actual counts are managed by the database trigger
      // We'll just refetch after a response change for accuracy
      loadEvent();
    }
  };

  const handleAddToCalendar = () => {
    if (event) {
      downloadEventIcs(event);
      toast.success('Calendar file downloaded');
    }
  };

  const handleShare = async () => {
    if (!event) return;

    const url = window.location.href;
    const text = `Check out this event: ${event.title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text, url });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const isPastEvent = event ? new Date(event.start_date) < new Date() : false;

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 text-center">
          <p className="text-gray-500">Event not found.</p>
          <Button onClick={() => navigate('/events')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/events')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        {/* Cover Image */}
        {event.cover_image_url && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        )}

        {/* Event Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {event.is_featured && (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                )}
                {isPastEvent && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    Past Event
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleAddToCalendar}>
                <Download className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Date & Time Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(event.start_date)}
                      </p>
                      {event.end_date && (
                        <p className="text-sm text-gray-500">
                          to {formatDate(event.end_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  {!event.is_all_day && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Clock className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatTime(event.start_date)}
                          {event.end_date && ` - ${formatTime(event.end_date)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {event.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    About this event
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-wrap text-gray-600">
                      {event.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Response Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Will you attend?
                </h2>
                <EventResponseButtons
                  eventId={event.id}
                  currentResponse={userResponse}
                  onResponseChange={handleResponseChange}
                  disabled={isPastEvent}
                />
                {isPastEvent && (
                  <p className="text-sm text-gray-500 mt-3">
                    This event has already passed.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Attendees Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Attendees
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAttendeesModal(true)}
                  >
                    View all
                  </Button>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAttendeesModal(true)}
                    className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.going_count}</p>
                      <p className="text-sm text-gray-500">Going</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowAttendeesModal(true)}
                    className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.interested_count}
                      </p>
                      <p className="text-sm text-gray-500">Interested</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowAttendeesModal(true)}
                    className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                  >
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Users className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.maybe_count}</p>
                      <p className="text-sm text-gray-500">Maybe</p>
                    </div>
                  </button>
                </div>
                {event.max_attendees && (
                  <p className="text-sm text-gray-500 mt-4">
                    Capacity: {event.max_attendees} attendees
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AttendeesModal
        eventId={event.id}
        open={showAttendeesModal}
        onOpenChange={setShowAttendeesModal}
        goingCount={event.going_count}
        interestedCount={event.interested_count}
        maybeCount={event.maybe_count}
      />
    </AppLayout>
  );
}
