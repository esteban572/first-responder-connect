import { useState } from 'react';
import { CheckCircle, Star, HelpCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EventResponse } from '@/types/event';
import { setEventResponse, removeEventResponse } from '@/lib/eventService';

interface EventResponseButtonsProps {
  eventId: string;
  currentResponse: EventResponse | null;
  onResponseChange?: (response: EventResponse | null) => void;
  disabled?: boolean;
}

const responseOptions: {
  value: EventResponse;
  label: string;
  icon: typeof CheckCircle;
  activeClass: string;
  hoverClass: string;
}[] = [
  {
    value: 'going',
    label: 'Going',
    icon: CheckCircle,
    activeClass: 'bg-green-600 text-white hover:bg-green-700',
    hoverClass: 'hover:bg-green-50 hover:text-green-700 hover:border-green-300',
  },
  {
    value: 'interested',
    label: 'Interested',
    icon: Star,
    activeClass: 'bg-blue-600 text-white hover:bg-blue-700',
    hoverClass: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300',
  },
  {
    value: 'maybe',
    label: 'Maybe',
    icon: HelpCircle,
    activeClass: 'bg-yellow-500 text-white hover:bg-yellow-600',
    hoverClass: 'hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300',
  },
  {
    value: 'not_going',
    label: 'Not Going',
    icon: XCircle,
    activeClass: 'bg-gray-600 text-white hover:bg-gray-700',
    hoverClass: 'hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300',
  },
];

export function EventResponseButtons({
  eventId,
  currentResponse,
  onResponseChange,
  disabled = false,
}: EventResponseButtonsProps) {
  const [loading, setLoading] = useState(false);

  const handleResponse = async (response: EventResponse) => {
    if (disabled || loading) return;

    setLoading(true);

    // Toggle behavior: clicking same response removes it
    if (currentResponse === response) {
      const success = await removeEventResponse(eventId);
      if (success) {
        onResponseChange?.(null);
        toast.success('Response removed');
      } else {
        toast.error('Failed to remove response');
      }
    } else {
      const success = await setEventResponse(eventId, response);
      if (success) {
        onResponseChange?.(response);
        const label = responseOptions.find((o) => o.value === response)?.label;
        toast.success(`Marked as ${label}`);
      } else {
        toast.error('Failed to save response');
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {responseOptions.map((option) => {
        const Icon = option.icon;
        const isActive = currentResponse === option.value;

        return (
          <Button
            key={option.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleResponse(option.value)}
            disabled={disabled || loading}
            className={`gap-1.5 ${isActive ? option.activeClass : option.hoverClass}`}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
