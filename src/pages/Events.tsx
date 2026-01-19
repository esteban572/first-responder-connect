import { useState, useEffect } from 'react';
import { Calendar, List, CalendarDays } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCard } from '@/components/events/EventCard';
import { EventCalendar } from '@/components/events/EventCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventResponse } from '@/types/event';
import { getActiveEvents, getUserEventResponses } from '@/lib/eventService';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [userResponses, setUserResponses] = useState<Record<string, EventResponse>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    setLoading(true);
    const eventData = await getActiveEvents();
    setEvents(eventData);

    if (user && eventData.length > 0) {
      const eventIds = eventData.map((e) => e.id);
      const responses = await getUserEventResponses(eventIds, user.id);
      setUserResponses(responses);
    }

    setLoading(false);
  };

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.start_date) >= now);
  const pastEvents = events.filter((e) => new Date(e.start_date) < now);
  const featuredEvents = upcomingEvents.filter((e) => e.is_featured);

  const eventsWithResponses = events.map((event) => ({
    ...event,
    user_response: userResponses[event.id] || null,
  }));

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1">
              Discover and join community events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('calendar')}
              className="gap-1.5"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
              className="gap-1.5"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Events Yet
              </h3>
              <p className="text-gray-500">
                Check back later for upcoming community events.
              </p>
            </CardContent>
          </Card>
        ) : view === 'calendar' ? (
          <div className="space-y-6">
            {/* Featured Events Banner */}
            {featuredEvents.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Featured Events
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredEvents.slice(0, 3).map((event) => (
                    <EventCard
                      key={event.id}
                      event={{ ...event, user_response: userResponses[event.id] || null }}
                      showResponse
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Calendar View */}
            <EventCalendar events={events} />
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastEvents.length})
              </TabsTrigger>
              <TabsTrigger value="my-events">
                My Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No upcoming events.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={{ ...event, user_response: userResponses[event.id] || null }}
                      showResponse
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No past events.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={{ ...event, user_response: userResponses[event.id] || null }}
                      showResponse
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-events">
              {(() => {
                const myEvents = eventsWithResponses.filter(
                  (e) => e.user_response && e.user_response !== 'not_going'
                );
                return myEvents.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">
                        You haven't responded to any events yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {myEvents.map((event) => (
                      <EventCard key={event.id} event={event} showResponse />
                    ))}
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
