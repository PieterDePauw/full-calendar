// Import modules
import { type ClassValue } from "clsx"
import { addHours, areIntervalsOverlapping, differenceInDays, differenceInMinutes, getHours, getMinutes, isSameDay, startOfDay } from "date-fns"
import { WeekCellsHeight, type CalendarEvent, type PositionedEvent, type EventColor, type CalendarView } from "@/components/full-calendar"
import { cn } from "@/lib/utils"

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color: EventColor | string = "sky"): string {
    switch (color) {
        case "sky":
            return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8"
        case "amber":
            return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8"
        case "violet":
            return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8"
        case "rose":
            return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8"
        case "emerald":
            return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8"
        case "orange":
            return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8"
        default:
            return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8"
    }
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(isFirstDay: boolean, isLastDay: boolean): string {
    // If it is both the first and last day of the event (single-day event), round all corners
    if (isFirstDay && isLastDay) return "rounded"
    // If it is the first day of the event, only round the left end
    if (isFirstDay) return "rounded-l rounded-r-none"
    // If it is the last day of the event, only round the right end
    if (isLastDay) return "rounded-r rounded-l-none"
    // If it is neither the first nor last day of the event, don't round any corners
    return "rounded-none"
}

// Define a helper function to generate the classname for the event wrapper
export function getEventWrapperClasses({ isFirstDay, isLastDay, eventColor, className }: { isFirstDay: boolean, isLastDay: boolean, eventColor?: EventColor, className?: ClassValue }): string {
    return cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full overflow-hidden px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
        getEventColorClasses(eventColor),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        className
    )
}

// Define a helper function to generate the classname for events in the day view or the week view
export function getDayWeekEventClasses({ durationInMinutes, view, className }: { durationInMinutes: number, view: CalendarView, className: ClassValue }): string {
    return cn(
        "py-1",
        durationInMinutes < 45 ? "items-center" : "flex-col",
        view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
        className
    )
}

// Define a helper function to generate the classname for events in the month view
export function getMonthEventClasses({ className }: { className: ClassValue }): string {
    return cn(
        "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
        className

    )
}

// Define a helper function to generate the classname for events in the agenda view
export function getAgendaEventClasses({ eventColor, className }: { eventColor?: EventColor, className?: ClassValue }): string {
    return cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded p-2 text-left transition outline-none focus-visible:ring-[3px] data-past-event:line-through data-past-event:opacity-90",
        getEventColorClasses(eventColor),
        className
    )
}

/**
 * Check if an event is a multi-day event
 */
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

/**
 * Filter events for a specific day
 */
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    return events.filter((event) => {
        const eventStart = new Date(event.start)
        return isSameDay(day, eventStart)
    })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
    return [...events].sort((a, b) => {
        const aIsMultiDay = checkIfMultiDayEvent(a)
        const bIsMultiDay = checkIfMultiDayEvent(b)

        if (aIsMultiDay && !bIsMultiDay) return -1
        if (!aIsMultiDay && bIsMultiDay) return 1

        return new Date(a.start).getTime() - new Date(b.start).getTime()
    })
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    return events.filter((event) => {
        const isMultiDayEvent = checkIfMultiDayEvent(event)
        if (!isMultiDayEvent) return false

        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        // Only include if it's not the start day but is either the end day or a middle day
        return (
            !isSameDay(day, eventStart) &&
            (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
        )
    })
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    return events.filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return (
            isSameDay(day, eventStart) ||
            isSameDay(day, eventEnd) ||
            (day > eventStart && day < eventEnd)
        )
    })
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    return events.filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return (
            isSameDay(day, eventStart) ||
            isSameDay(day, eventEnd) ||
            (day > eventStart && day < eventEnd)
        )
    })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date, hours: number): Date {
    if (!Number.isInteger(hours)) { throw new Error("To add hours to the date, the value for hours must be an integer"); }
    const result = new Date(date)
    result.setHours(result.getHours() + hours)
    return result
}

// Helper function to compare two dates and check if they are the same
export function compareDateTime(dateA: Date, dateB: Date): boolean {
    // Check if the year of both dates is the same
    const isSameYear = dateA.getFullYear() === dateB.getFullYear()
    // Check if the month of both dates are the same
    const isSameMonth = dateA.getMonth() === dateB.getMonth()
    // Check if the day of both dates are the same
    const isSameDay = dateA.getDate() === dateB.getDate()
    // Check if the hours of both dates are the same
    const isSameHour = dateA.getHours() === dateB.getHours()
    // Check if the minutes of both dates are the same
    const isSameMinutes = dateA.getMinutes() === dateB.getMinutes()
    // Return true if any of the above checks are not true
    return !isSameYear || !isSameMonth || !isSameDay || !isSameHour || !isSameMinutes
}

// Helper function to determine if an event should be hidden based on its index and visible count
// function checkEventVisibility(index: number, visibleCount: number | undefined): boolean {
//     return (!!visibleCount && index >= visibleCount)
// }

// Define a helper function to generate the class name for the droppable cell based on which quarter of the hour is specified
export function generateDroppableCell(quarter: number) {
    return cn(
        "absolute h-[calc(var(--week-cells-height)/4)] w-full",
        quarter === 0 && "top-0",
        quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
        quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
        quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]"
    )
}

// Helper to adjust event start/end times to the current day boundaries
function adjustEventTimes(event: CalendarEvent, currentDate: Date): { adjustedStart: Date; adjustedEnd: Date}  {
    const dayStart = startOfDay(currentDate)
    const dayEnd = addHours(dayStart, 24)
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    return {
        adjustedStart: isSameDay(currentDate, eventStart) ? eventStart : dayStart,
        adjustedEnd: isSameDay(currentDate, eventEnd) ? eventEnd : dayEnd,
    }
}

// Define a helper function to get the decimal hour from a specified date/time
function getDecimalHour(date: Date): number {
    return getHours(date) + (getMinutes(date) / 60)
}

// Define a helper function to sort events based on their start time and duration
export function sortEventsByStartTimeAndDuration(events: CalendarEvent[]): CalendarEvent[] {
    // > Get the sorted events by start time and duration
    const sortedEvents = [...events].sort((eventA, eventB) => {
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

    // > Return the sorted events
    return sortedEvents
}

// Helper to find a column index for the event
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

// Define a helper function to position events in columns based on their start and end times
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

        // Find a column index where the event doesn't overlap.
        const columnIndex = findColumnIndex(columns, adjustedStart, adjustedEnd);

        // Add the event to the determined column.
        columns[columnIndex].push({ event, end: adjustedEnd });

        // >> Calculate vertical position and height.
        const top = startHour * WeekCellsHeight;
        const height = (endHour - startHour) * WeekCellsHeight;

        // >> Calculate horizontal position & layering.
        const isFirstColumn = columnIndex === 0;
        const width = isFirstColumn ? 1 : 0.9;
        const left = isFirstColumn ? 0 : columnIndex * 0.1;
        const zIndex = 10 + columnIndex;

        // >> Add the positioned event to the result array.
        result.push({ event, top, height, left, width, zIndex });
    }

    return result;
}

// // Define a helper function to position events in columns based on their start and end times
// function assignColumn(columns: { event: CalendarEvent; end: Date }[][], event: CalendarEvent, adjustedStart: Date, adjustedEnd: Date): number {
//     // > Define a variable to keep track of the column index
//     let columnIndex = 0;

//     // > Define a variable to keep track of whether the event has been placed
//     let placed = false;

//     // > Create an object that holds the start and end times of the event
//     const currentInterval = { start: adjustedStart, end: adjustedEnd };

//     // > Loop until the event is placed in a column
//     while (!placed) {
//         // >> Define a variable to hold the current column
//         const currentColumn = columns[columnIndex];

//         // >> If no column exists at this index, ...
//         if (!currentColumn) {
//             // >>> Initialize the column as an empty array in the columns array
//             columns[columnIndex] = [];
//             // >>> Mark the event as placed
//             placed = true;
//         }

//         // >> If a column does exist at this index, ....
//         if (currentColumn) {
//             // >>> Check if the event overlaps with any existing events within this column
//             const overlaps = currentColumn.some((col) => areIntervalsOverlapping(currentInterval, { start: new Date(col.event.start), end: new Date(col.event.end) }));

//             // >>> If the event does not overlap with any existing events, mark it as placed; otherwise, move to the next column
//             if (!overlaps) {
//                 placed = true;
//             } else {
//                 columnIndex++;
//             }
//         }
//     }

//     // Once the column is determined, push the event into it
//     columns[columnIndex].push({ event, end: adjustedEnd });

//     // Return the column index where the event was placed
//     return columnIndex;
// }

// // > Process events to calculate positions
// export function positionEvents({ timeEvents, currentDate }: { timeEvents: CalendarEvent[]; currentDate: Date }): PositionedEvent[] {
//     // >> Define a result array to hold positioned events
//     const result: PositionedEvent[] = []

//     // >> Define the start of the day
//     const dayStart: Date = startOfDay(currentDate)

//     // >> Sort events by start time and duration
//     const sortedEvents: CalendarEvent[] = sortEventsByStartTimeAndDuration(timeEvents)

//     // >> Define an array to hold columns for overlapping events
//     const columns: { event: CalendarEvent; end: Date }[][] = []

//     // >> Loop through each event to calculate its position
//     sortedEvents.forEach((event) => {
//         // >>> Get the start and end times of the event
//         const eventStart = new Date(event.start)
//         const eventEnd = new Date(event.end)

//         // >>> Adjust start and end times if they're outside this day
//         const adjustedStart = isSameDay(currentDate, eventStart) ? eventStart : dayStart
//         const adjustedEnd = isSameDay(currentDate, eventEnd) ? eventEnd : addHours(dayStart, 24)

//         // >>> Calculate the start time and the end time as hours in decimals
//         const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60
//         const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60

//         // >>> Calculate top position and height
//         const top = startHour * WeekCellsHeight
//         const height = (endHour - startHour) * WeekCellsHeight

//         // >>> Find a column for this event
//         let columnIndex = 0
//         let placed = false

//         // >> Loop until the event is placed in a column
//         while (!placed) {
//             if (!columns[columnIndex]) {
//                 columns[columnIndex] = []
//                 placed = true
//             } else {
//                 // Check if this event overlaps with any event in this column
//                 const overlaps = columns[columnIndex].some((col) =>
//                     areIntervalsOverlapping(
//                         { start: adjustedStart, end: adjustedEnd },
//                         { start: new Date(col.event.start), end: new Date(col.event.end) }
//                     )
//                 )

//                 if (!overlaps) {
//                     placed = true
//                 } else {
//                     columnIndex++
//                 }
//             }
//         }

//         // Add event to its column
//         columns[columnIndex].push({ event, end: adjustedEnd })

//         // First column takes full width, others are indented by 10% and take 90% width
//         const width = columnIndex === 0 ? 1 : 0.9
//         const left = columnIndex === 0 ? 0 : columnIndex * 0.1

//         // Higher columns get higher z-index
//         const adjustedZIndex = 10 + columnIndex

//         // Add event to result
//         result.push({ event, top, height, left, width, zIndex: adjustedZIndex })
//     })

//     // >> Return the result array holding the positioned events
//     return result
// }
