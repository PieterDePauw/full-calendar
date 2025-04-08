// event-queries.ts

import { differenceInDays, differenceInMinutes, isSameDay } from "date-fns";
import { type CalendarEvent } from "@/components/full-calendar";

// Define a helper function to determine if an event is an all-day event or spans multiple days.
export function checkIfMultiDayEvent(event: CalendarEvent): boolean {
    // > Check if the event is an all-day event
    const isAllDay = event.allDay === true
    // > Check if the start of the event is on a different day than the end of the event
    const isMultiDay = !isSameDay(new Date(event.start), new Date(event.end))
    // > Check if the event spans multiple days
    const spansMultipleDays = differenceInDays(new Date(event.end), new Date(event.start)) >= 1
    // > Return true if either of the above conditions are met
    return isAllDay || isMultiDay || spansMultipleDays
}

// Define a helper function to filter events that start on a specific day (i.e. only events starting on the specified day)
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    // > Return the filtered and sorted events
    return events
        // >> Filter the events to include only those that are starting on the specified day
        .filter((event) => isSameDay(day, new Date(event.start)))
        // >> Sort the events by start time
        .toSorted((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

// Define a helper function to sort an array of events sorted by their start time, with multi-day events sorted first
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
    // > Return the sorted events
    return events.toSorted((eventA, eventB) => {
        // >> Check if the events are multi-day events
        const aIsMultiDay = checkIfMultiDayEvent(eventA)
        const bIsMultiDay = checkIfMultiDayEvent(eventB)

        // >> Sort multi-day events before single-day events
        if (aIsMultiDay && !bIsMultiDay) { return -1 }
        if (!aIsMultiDay && bIsMultiDay) { return 1 }

        // >> If both events are multi-day or single-day, sort by start time
        return new Date(eventA.start).getTime() - new Date(eventB.start).getTime()
    })
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
    return ( isSameDay(day, start) || isSameDay(day, end) || (day > start && day < end));
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

// Define a helper function to sort events based on their start time firstly, then by their duration
export function sortEventsByStartTimeAndDuration(events: CalendarEvent[]): CalendarEvent[] {
    // > Return the sorted events by start time and duration
    return events.toSorted((eventA, eventB) => {
        // >> Get the start time for each of the events
        const eventAStart = new Date(eventA.start)
        const eventBStart = new Date(eventB.start)

        // >> If the start times are different, sort by start time
        if (eventAStart < eventBStart) return -1
        if (eventAStart > eventBStart) return 1

        // >> Get the end time for each of the events
        const eventAEnd = new Date(eventA.end)
        const eventBEnd = new Date(eventB.end)

        // >> Get the duration for each of the events
        const aDuration = differenceInMinutes(eventAEnd, eventAStart)
        const bDuration = differenceInMinutes(eventBEnd, eventBStart)

        // >> If start times are equal, sort by duration (longer events first)
        return bDuration - aDuration
    })
}
