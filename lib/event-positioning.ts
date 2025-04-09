// Import modules
import { areIntervalsOverlapping, addHours, isSameDay, startOfDay } from "date-fns";
import { type CalendarEvent, type PositionedEvent, WEEK_CELLS_HEIGHT, getDecimalHour, sortEventsByStartTimeAndDuration } from "@/components/full-calendar";

// Define a helper function to adjust event start/end times to the current day boundaries
function adjustEventTimes(event: CalendarEvent, currentDate: Date): { adjustedStart: Date; adjustedEnd: Date }  {
    // > Get the start time of the current day
    const dayStart = startOfDay(currentDate)
    // > Get the end time of the current day (24 hours after the start time)
    const dayEnd = addHours(dayStart, 24)
    // > Get the start time of the event
    const eventStart = new Date(event.start)
    // > Get the end time of the event
    const eventEnd = new Date(event.end)
    // > Adjust the start time of the event to the start of the current day, if it doesn't start on the specified day
    const adjustedStart = isSameDay(currentDate, eventStart) ? eventStart : dayStart
    // > Adjust the end time of the event to the end of the current day, if it doesn't end on the specified day
    const adjustedEnd = isSameDay(currentDate, eventEnd) ? eventEnd : dayEnd
    // > Return the adjusted start and end times
    return { adjustedStart, adjustedEnd }
}

// Define a helper function to find the column index for the event based on its start and end times based on overlap checks
function findColumnIndex(columns: { event: CalendarEvent; end: Date }[][], adjustedStart: Date, adjustedEnd: Date): number {
    // > Define a variable to keep track of the column index
    let columnIndex = 0

    // > Define a variable to keep track of whether the event has been placed
    let placed = false

    // > Loop until the event is placed in a column
    while (!placed) {
        // >> If the column doesn't exist, create it and use it.
        if (!columns[columnIndex]) {
            columns[columnIndex] = []
            placed = true
        }
        // >> Check if event overlaps with any in the current column.
        const overlaps = columns[columnIndex].some(col => areIntervalsOverlapping({ start: adjustedStart, end: adjustedEnd }, { start: new Date(col.event.start), end: new Date(col.event.end) }))
        // >> If it doesn't overlap, place the event in this column, otherwise move to the next column.
        if (!overlaps) {
            placed = true
        } else {
            columnIndex++
        }
    }

    // Once the column is determined, return the column index where the event should be placed
    return columnIndex
}

// Define a helper function to position events in columns based on their start and end times to avoid visual overlap in a day/week grid
export function positionEvents(events: CalendarEvent[], currentDate: Date): PositionedEvent[] {
    // > Define a result array to hold positioned events
    const result: PositionedEvent[] = [];

    // > Define a columns array to hold the events in columns to avoid overlapping events
    const columns: (({ event: CalendarEvent; end: Date })[])[] = [];

    // > Sort events by start time and duration
    const sortedEvents = sortEventsByStartTimeAndDuration(events);

    // > Loop through each event to calculate its position in the calendar
    for (const event of sortedEvents) {
        // >> Adjust event times to current day boundaries.
        const { adjustedStart, adjustedEnd } = adjustEventTimes(event, currentDate);

        // >> Calculate the start time and the end time as hours in decimals.
        const startHour = getDecimalHour(adjustedStart);
        const endHour = getDecimalHour(adjustedEnd);

        // >> Find a column index where the event doesn't overlap.
        const columnIndex = findColumnIndex(columns, adjustedStart, adjustedEnd);

        // >> Add the event to the determined column.
        columns[columnIndex].push({ event, end: adjustedEnd });

        // >> Calculate vertical position and height.
        const top = startHour * WEEK_CELLS_HEIGHT;
        const height = (endHour - startHour) * WEEK_CELLS_HEIGHT;

        // >> Calculate horizontal position & layering.
        const isFirstColumn = columnIndex === 0;
        const width = isFirstColumn ? 1 : (1 - (columnIndex * 0.1))
        const left = isFirstColumn ? 0 : columnIndex * 0.1;
        const zIndex = 10 + columnIndex;

        // >> Add the positioned event to the result array.
        result.push({ event, top, height, left, width, zIndex });
    }

    // > Return the array of positioned events
    return result;
}
