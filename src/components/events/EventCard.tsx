import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Event, EventWithResponse, EVENT_TIMEZONES } from '@/types/event';

interface EventCardProps {
  event: Event | EventWithResponse;
  showResponse?: boolean;
}

export function EventCard({ event, showResponse = false }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTimezoneAbbr = (tz: string) => {
    return EVENT_TIMEZONES.find((t) => t.value === tz)?.abbr || '';
  };

  const isPastEvent = new Date(event.start_date) < new Date();
  const userResponse = 'user_response' in event ? event.user_response : null;

  const getResponseBadge = () => {
    if (!userResponse) return null;
    const colors = {
      going: 'bg-green-100 text-green-700',
      interested: 'bg-blue-100 text-blue-700',
      maybe: 'bg-yellow-100 text-yellow-700',
      not_going: 'bg-gray-100 text-gray-600',
    };
    const labels = {
      going: 'Going',
      interested: 'Interested',
      maybe: 'Maybe',
      not_going: 'Not Going',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[userResponse]}`}>
        {labels[userResponse]}
      </span>
    );
  };

  return (
    <Link to={`/events/${event.id}`}>
      <Card className={`overflow-hidden hover:shadow-md transition-shadow ${isPastEvent ? 'opacity-75' : ''}`}>
        {event.cover_image_url && (
          <div className="h-40 w-full overflow-hidden">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className={`p-4 ${event.cover_image_url ? '' : 'pt-4'}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {event.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
              {showResponse && getResponseBadge()}
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(event.start_date)}</span>
              {!event.is_all_day && (
                <>
                  <Clock className="h-4 w-4 text-gray-400 ml-2" />
                  <span>
                    {formatTime(event.start_date)}
                    {event.timezone && (
                      <span className="text-gray-400 ml-1">
                        {getTimezoneAbbr(event.timezone)}
                      </span>
                    )}
                  </span>
                </>
              )}
              {event.is_all_day && (
                <span className="text-xs text-gray-500">(All Day)</span>
              )}
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>
                {event.going_count} going
                {event.interested_count > 0 && ` · ${event.interested_count} interested`}
              </span>
            </div>
          </div>

          {event.description && (
            <p className="mt-3 text-sm text-gray-500 line-clamp-2">
              {event.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
