import { Event } from '@/types/event';

/**
 * ICS file generator for cross-platform calendar export
 * Supports: iOS Calendar, Google Calendar, Outlook, Apple Calendar
 */

// CRLF line ending required by ICS spec
const CRLF = '\r\n';

/**
 * Escape special characters in ICS text fields
 * Per RFC 5545: backslash, semicolon, comma, and newlines must be escaped
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold long lines per ICS spec (max 75 octets per line)
 * Continuation lines start with a space
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const result: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    // First line gets full maxLength, continuation lines get maxLength - 1 (for leading space)
    const chunkLength = result.length === 0 ? maxLength : maxLength - 1;
    result.push(remaining.substring(0, chunkLength));
    remaining = remaining.substring(chunkLength);
  }

  if (remaining) {
    result.push(remaining);
  }

  return result.join(CRLF + ' ');
}

/**
 * Format date for ICS (all-day events use VALUE=DATE format YYYYMMDD)
 */
function formatIcsDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Format datetime for ICS (UTC format YYYYMMDDTHHMMSSZ)
 */
function formatIcsDateTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate a unique UID for the event
 */
function generateUid(eventId: string): string {
  return `${eventId}@first-responder-connect`;
}

/**
 * Generate ICS content for a single event
 */
export function generateIcs(event: Event): string {
  const lines: string[] = [];

  // ICS header
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//First Responder Connect//Events//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  // Event component
  lines.push('BEGIN:VEVENT');
  lines.push(foldLine(`UID:${generateUid(event.id)}`));
  lines.push(foldLine(`DTSTAMP:${formatIcsDateTime(new Date().toISOString())}`));

  // Date handling
  if (event.is_all_day) {
    lines.push(foldLine(`DTSTART;VALUE=DATE:${formatIcsDate(event.start_date)}`));
    if (event.end_date) {
      // All-day end date should be exclusive (next day)
      const endDate = new Date(event.end_date);
      endDate.setDate(endDate.getDate() + 1);
      lines.push(foldLine(`DTEND;VALUE=DATE:${formatIcsDate(endDate.toISOString())}`));
    }
  } else {
    lines.push(foldLine(`DTSTART:${formatIcsDateTime(event.start_date)}`));
    if (event.end_date) {
      lines.push(foldLine(`DTEND:${formatIcsDateTime(event.end_date)}`));
    }
  }

  // Event details
  lines.push(foldLine(`SUMMARY:${escapeIcsText(event.title)}`));

  if (event.description) {
    lines.push(foldLine(`DESCRIPTION:${escapeIcsText(event.description)}`));
  }

  if (event.location) {
    lines.push(foldLine(`LOCATION:${escapeIcsText(event.location)}`));
  }

  // Timestamps
  lines.push(foldLine(`CREATED:${formatIcsDateTime(event.created_at)}`));
  lines.push(foldLine(`LAST-MODIFIED:${formatIcsDateTime(event.updated_at)}`));

  // End event and calendar
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join(CRLF);
}

/**
 * Generate ICS for multiple events
 */
export function generateMultipleIcs(events: Event[]): string {
  if (events.length === 0) return '';

  const lines: string[] = [];

  // ICS header
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//First Responder Connect//Events//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  // Add each event
  events.forEach((event) => {
    lines.push('BEGIN:VEVENT');
    lines.push(foldLine(`UID:${generateUid(event.id)}`));
    lines.push(foldLine(`DTSTAMP:${formatIcsDateTime(new Date().toISOString())}`));

    if (event.is_all_day) {
      lines.push(foldLine(`DTSTART;VALUE=DATE:${formatIcsDate(event.start_date)}`));
      if (event.end_date) {
        const endDate = new Date(event.end_date);
        endDate.setDate(endDate.getDate() + 1);
        lines.push(foldLine(`DTEND;VALUE=DATE:${formatIcsDate(endDate.toISOString())}`));
      }
    } else {
      lines.push(foldLine(`DTSTART:${formatIcsDateTime(event.start_date)}`));
      if (event.end_date) {
        lines.push(foldLine(`DTEND:${formatIcsDateTime(event.end_date)}`));
      }
    }

    lines.push(foldLine(`SUMMARY:${escapeIcsText(event.title)}`));

    if (event.description) {
      lines.push(foldLine(`DESCRIPTION:${escapeIcsText(event.description)}`));
    }

    if (event.location) {
      lines.push(foldLine(`LOCATION:${escapeIcsText(event.location)}`));
    }

    lines.push(foldLine(`CREATED:${formatIcsDateTime(event.created_at)}`));
    lines.push(foldLine(`LAST-MODIFIED:${formatIcsDateTime(event.updated_at)}`));
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join(CRLF);
}

/**
 * Download ICS file for a single event
 */
export function downloadEventIcs(event: Event): void {
  const icsContent = generateIcs(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download ICS file for multiple events
 */
export function downloadMultipleEventsIcs(events: Event[], filename: string = 'events'): void {
  const icsContent = generateMultipleIcs(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
