// event-queries.ts

import { differenceInDays, differenceInMinutes, isSameDay } from "date-fns";
import { type CalendarEvent } from "@/components/full-calendar";

/**
 * Determines if an event is all-day or spans multiple days.
 */
export function checkIfMultiDayEvent(event: CalendarEvent): boolean {
  const isAllDay = event.allDay === true;
  const isStartEndSameDay = isSameDay(new Date(event.start), new Date(event.end));
  const spansMultipleDays =
    differenceInDays(new Date(event.end), new Date(event.start)) >= 1;

  return isAllDay || !isStartEndSameDay || spansMultipleDays;
}

/**
 * Returns events that *start* on the given day.
 */
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((event) => isSameDay(day, new Date(event.start)))
    .toSorted((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Sorts events, placing multi-day events first, then by earliest start time.
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.toSorted((eventA, eventB) => {
    const aIsMultiDay = checkIfMultiDayEvent(eventA);
    const bIsMultiDay = checkIfMultiDayEvent(eventB);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(eventA.start).getTime() - new Date(eventB.start).getTime();
  });
}

/**
 * Returns multi-day events that span the given day (but don't start on that day).
 */
export function getSpanningEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((event) => {
    if (!checkIfMultiDayEvent(event)) return false;
    if (isSameDay(day, new Date(event.start))) return false;
    if (isSameDay(day, new Date(event.end))) return true;

    const start = new Date(event.start);
    const end = new Date(event.end);
    return day > start && day < end;
  });
}

/**
 * Gets events that start, end, or span the given day.
 */
export function getAllEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return (
      isSameDay(day, start) ||
      isSameDay(day, end) ||
      (day > start && day < end)
    );
  });
}

/**
 * Like getAllEventsForDay, but sorted by start time for the Agenda view.
 */
export function getAgendaEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      return (
        isSameDay(day, start) ||
        isSameDay(day, end) ||
        (day > start && day < end)
      );
    })
    .toSorted((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Sorts events first by earliest start time, then by longer duration first.
 */
export function sortEventsByStartTimeAndDuration(events: CalendarEvent[]): CalendarEvent[] {
  return events.toSorted((eventA, eventB) => {
    const aStart = new Date(eventA.start);
    const bStart = new Date(eventB.start);

    if (aStart < bStart) return -1;
    if (aStart > bStart) return 1;

    const aEnd = new Date(eventA.end);
    const bEnd = new Date(eventB.end);

    const aDuration = differenceInMinutes(aEnd, aStart);
    const bDuration = differenceInMinutes(bEnd, bStart);

    // Sort longer events first when start times match
    return bDuration - aDuration;
  });
}
