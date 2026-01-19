import { useState, useEffect } from 'react';
import { CheckCircle, Star, HelpCircle, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventAttendee, EventResponse } from '@/types/event';
import { getEventAttendees } from '@/lib/eventService';

interface AttendeesModalProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goingCount: number;
  interestedCount: number;
  maybeCount: number;
}

const responseConfig: Record<
  Exclude<EventResponse, 'not_going'>,
  { label: string; icon: typeof CheckCircle; color: string }
> = {
  going: { label: 'Going', icon: CheckCircle, color: 'text-green-600' },
  interested: { label: 'Interested', icon: Star, color: 'text-blue-600' },
  maybe: { label: 'Maybe', icon: HelpCircle, color: 'text-yellow-600' },
};

export function AttendeesModal({
  eventId,
  open,
  onOpenChange,
  goingCount,
  interestedCount,
  maybeCount,
}: AttendeesModalProps) {
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadAttendees();
    }
  }, [open, eventId]);

  const loadAttendees = async () => {
    setLoading(true);
    const data = await getEventAttendees(eventId);
    setAttendees(data);
    setLoading(false);
  };

  const getAttendeesByResponse = (response: EventResponse) => {
    return attendees.filter((a) => a.response === response);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const AttendeeList = ({ response }: { response: Exclude<EventResponse, 'not_going'> }) => {
    const list = getAttendeesByResponse(response);
    const config = responseConfig[response];
    const Icon = config.icon;

    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <p className="text-sm text-gray-500 text-center py-4">
          No one has responded as {config.label.toLowerCase()} yet.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {list.map((attendee) => (
          <div key={attendee.user_id} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={attendee.avatar_url || undefined} />
              <AvatarFallback className="bg-gray-100">
                {attendee.avatar_url ? null : (
                  attendee.full_name ? (
                    getInitials(attendee.full_name)
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {attendee.full_name || 'Anonymous User'}
              </p>
            </div>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attendees</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="going" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="going" className="gap-1">
              <CheckCircle className="h-4 w-4" />
              {goingCount}
            </TabsTrigger>
            <TabsTrigger value="interested" className="gap-1">
              <Star className="h-4 w-4" />
              {interestedCount}
            </TabsTrigger>
            <TabsTrigger value="maybe" className="gap-1">
              <HelpCircle className="h-4 w-4" />
              {maybeCount}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="going" className="mt-4">
            <AttendeeList response="going" />
          </TabsContent>
          <TabsContent value="interested" className="mt-4">
            <AttendeeList response="interested" />
          </TabsContent>
          <TabsContent value="maybe" className="mt-4">
            <AttendeeList response="maybe" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
