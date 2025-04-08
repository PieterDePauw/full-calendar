// event-positioning.ts

import { areIntervalsOverlapping, addHours, isSameDay } from "date-fns";
import { type CalendarEvent, type PositionedEvent, WeekCellsHeight } from "@/components/full-calendar";
import { sortEventsByStartTimeAndDuration } from "./event-queries";
import { getDecimalHour } from "./time-helpers";

/**
 * Adjusts event times to the boundaries of `currentDate`’s day.
 */
function adjustEventTimes(
  event: CalendarEvent,
  currentDate: Date
): { adjustedStart: Date; adjustedEnd: Date } {
  const dayStart = new Date(currentDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = addHours(dayStart, 24);

  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);

  const adjustedStart = isSameDay(currentDate, eventStart) ? eventStart : dayStart;
  const adjustedEnd = isSameDay(currentDate, eventEnd) ? eventEnd : dayEnd;

  return { adjustedStart, adjustedEnd };
}

/**
 * Figures out which column an event should occupy based on overlap checks.
 */
function findColumnIndex(
  columns: { event: CalendarEvent; end: Date }[][],
  adjustedStart: Date,
  adjustedEnd: Date
): number {
  let columnIndex = 0;
  let placed = false;

  while (!placed) {
    if (!columns[columnIndex]) {
      columns[columnIndex] = [];
      placed = true;
    }
    const overlaps = columns[columnIndex].some((col) =>
      areIntervalsOverlapping(
        { start: adjustedStart, end: adjustedEnd },
        { start: new Date(col.event.start), end: new Date(col.event.end) }
      )
    );
    if (!overlaps) {
      placed = true;
    } else {
      columnIndex++;
    }
  }

  return columnIndex;
}

/**
 * Lays out events in columns to avoid visual overlap in a day/week grid.
 */
export function positionEvents(
  events: CalendarEvent[],
  currentDate: Date
): PositionedEvent[] {
  const result: PositionedEvent[] = [];
  const columns: { event: CalendarEvent; end: Date }[][] = [];

  // Sort events by start time + duration
  const sortedEvents = sortEventsByStartTimeAndDuration(events);

  for (const event of sortedEvents) {
    const { adjustedStart, adjustedEnd } = adjustEventTimes(event, currentDate);

    // convert times to decimal hours
    const startHour = getDecimalHour(adjustedStart);
    const endHour = getDecimalHour(adjustedEnd);

    // figure out the column
    const columnIndex = findColumnIndex(columns, adjustedStart, adjustedEnd);
    columns[columnIndex].push({ event, end: adjustedEnd });

    // compute the top & height in px, plus left offset & width
    const top = startHour * WeekCellsHeight;
    const height = (endHour - startHour) * WeekCellsHeight;

    // each new column is offset horizontally by ~10%
    const isFirstColumn = columnIndex === 0;
    const width = isFirstColumn ? 1 : 1 - columnIndex * 0.1;
    const left = isFirstColumn ? 0 : columnIndex * 0.1;
    const zIndex = 10 + columnIndex;

    result.push({ event, top, height, left, width, zIndex });
  }

  return result;
}
