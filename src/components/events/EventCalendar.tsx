import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { cn } from '@/lib/utils';

interface EventCalendarProps {
  events: Event[];
  onMonthChange?: (year: number, month: number) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function EventCalendar({ events, onMonthChange }: EventCalendarProps) {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Create a map of date -> events for quick lookup
  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((event) => {
      const date = new Date(event.start_date);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  // Get calendar grid data
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: { date: Date | null; isCurrentMonth: boolean; isToday: boolean; events: Event[] }[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(currentYear, currentMonth, -startingDayOfWeek + i + 1);
      const key = `${prevDate.getFullYear()}-${prevDate.getMonth()}-${prevDate.getDate()}`;
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        events: eventsByDate[key] || [],
      });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const key = `${currentYear}-${currentMonth}-${day}`;
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        events: eventsByDate[key] || [],
      });
    }

    // Add days to complete the last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const key = `${nextDate.getFullYear()}-${nextDate.getMonth()}-${nextDate.getDate()}`;
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        events: eventsByDate[key] || [],
      });
    }

    return days;
  }, [currentMonth, currentYear, eventsByDate, today]);

  const goToPreviousMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    onMonthChange?.(newYear, newMonth);
  };

  const goToNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    onMonthChange?.(newYear, newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    onMonthChange?.(today.getFullYear(), today.getMonth());
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <div className="w-24" /> {/* Spacer for balance */}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              'min-h-24 p-1 border-b border-r',
              !day.isCurrentMonth && 'bg-gray-50',
              day.isToday && 'bg-blue-50',
              index % 7 === 6 && 'border-r-0',
              index >= 35 && 'border-b-0'
            )}
          >
            <div
              className={cn(
                'text-sm font-medium p-1',
                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                day.isToday && 'text-blue-600'
              )}
            >
              {day.date?.getDate()}
            </div>
            <div className="space-y-1">
              {day.events.slice(0, 2).map((event) => (
                <button
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className={cn(
                    'w-full text-left text-xs px-1.5 py-0.5 rounded truncate',
                    event.is_featured
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-accent/20 text-accent-foreground hover:bg-accent/30'
                  )}
                >
                  {!event.is_all_day && (
                    <span className="font-medium">
                      {new Date(event.start_date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}{' '}
                    </span>
                  )}
                  {event.title}
                </button>
              ))}
              {day.events.length > 2 && (
                <button
                  onClick={() => {
                    // Navigate to first event if there are more
                    if (day.events.length > 0) {
                      navigate(`/events/${day.events[0].id}`);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-1.5"
                >
                  +{day.events.length - 2} more
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
