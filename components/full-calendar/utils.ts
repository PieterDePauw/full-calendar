// Import modules
import { type ClassValue } from "clsx"
import { addHours, areIntervalsOverlapping, differenceInDays, differenceInMinutes, getHours, getMinutes, isSameDay, startOfDay } from "date-fns"
import { WeekCellsHeight, type CalendarEvent, type PositionedEvent, type EventColor, type CalendarView } from "@/components/full-calendar"
import { cn } from "@/lib/utils"

// Define a helper function to generate CSS classes for event colors
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

// Define a helper function to generate CSS classes for border radius based on event position in multi-day events
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

// Define a helper function to generate the classname for the droppable cell based on which quarter of the hour is specified
export function getDroppableCellClasses(quarter: number) {
    return cn(
        "absolute h-[calc(var(--week-cells-height)/4)] w-full",
        quarter === 0 && "top-0",
        quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
        quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
        quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]"
    )
}

// Define a helper function to check if an event is a multi-day event
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

// Define a helper function to filter events for a specific day (i.e. only events starting on the specified day)
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    // >> Return the filtered and sorted events
    return events
        // >>> Filter the events to include only those that are starting on the specified day
        .filter((event) => isSameDay(day, new Date(event.start)))
        // >>> Sort the events by start time
        .toSorted((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

// Define a helper function to sort an array of events by their start time, with multi-day events sorted first
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
    // >> Return the sorted events
    return events.toSorted((eventA, eventB) => {
        // >>> Check if the events are multi-day events
        const aIsMultiDay = checkIfMultiDayEvent(eventA)
        const bIsMultiDay = checkIfMultiDayEvent(eventB)

        // >>> Sort multi-day events before single-day events
        if (aIsMultiDay && !bIsMultiDay) { return -1 }
        if (!aIsMultiDay && bIsMultiDay) { return 1 }

        // >>> If both events are multi-day or single-day, sort by start time
        return new Date(eventA.start).getTime() - new Date(eventB.start).getTime()
    })
}

// Define a helper function to get all multi-day events that span across a specific day (but don't start on that day)
export function getSpanningEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    // >> Filter the events to include only those that are multi-day events and span the specified day
    return events.filter((event) => {
        // >>> Check if the event is a multi-day event
        const isMultiDayEvent = checkIfMultiDayEvent(event)

        // >>> If the event is not a multi-day event, return false to exclude it
        if (!isMultiDayEvent) return false

        // >>> If the specified day is the same as the start date of the event, return false to exclude it
        if (isSameDay(day, new Date(event.start))) return false

        // >>> If the specified day is the same as the end date of the event, return true to include it
        if (isSameDay(day, new Date(event.end))) return true

        // >>> If the specified day is between the start and end dates of the event, return true to include it
        if (day > new Date(event.start) && day < new Date(event.end)) return true

        // >>> Otherwise, return false to exclude the event
        return false
    })
}

// Define a helper function to get all events that take place on a specific day (regardless of whether they are starting on, ending on, or spanning the current day)
export function getAllEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    // > Return the filtered events
    return events.filter((event) => isSameDay(day, new Date(event.start)) || isSameDay(day, new Date(event.end)) || (day > new Date(event.start) && day < new Date(event.end)))
}

// Define a helper function to get all events for a specific day in the agenda view (regardless of whether they are starting on, ending on, or spanning the current day)
export function getAgendaEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    // >> Return the filtered and sorted events
    return events
        // >>> Filter the events to include only those that are either starting, ending on the specified day, or spanning the day
        .filter((event) => isSameDay(day, new Date(event.start)) || isSameDay(day, new Date(event.end)) || (day > new Date(event.start) && day < new Date(event.end)))
        // >>> Sort the events by start time
        .toSorted((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

// Define a helper function to add hours to a specified date
export function addHoursToDate(date: Date, hours: number): Date {
    // >> If the hours value is not an integer, throw an error
    if (!Number.isInteger(hours)) { throw new Error("To add hours to the date, the value for hours must be an integer"); }
    // >> If the hours value is an integer, create a new date object
    const result = new Date(date)
    // >> Add the specified number of hours to the date
    result.setHours(result.getHours() + hours)
    // >> Return the new date object
    return result
}

// Define a helper function to compare two dates and check if they are the same
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

// Define a helper function to adjust event start/end times to the current day boundaries
function adjustEventTimes(event: CalendarEvent, currentDate: Date): { adjustedStart: Date; adjustedEnd: Date }  {
    // > Get the start time of the current day
    const dayStart = startOfDay(currentDate)
    // > Get the end time of the current day (24 hours after the start time)
    const dayEnd = addHours(dayStart, 24)
    // > Get the start and end times of the event
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    // > Adjust the start and end times of the event to fit within the current day boundaries
    const adjustedStart = isSameDay(currentDate, eventStart) ? eventStart : dayStart
    const adjustedEnd = isSameDay(currentDate, eventEnd) ? eventEnd : dayEnd
    // > Return the adjusted start and end times
    return { adjustedStart, adjustedEnd }
}

// Define a helper function to get the decimal hour from a specified date/time
function getDecimalHour(date: Date): number {
    return getHours(date) + (getMinutes(date) / 60)
}

// Define a helper function to sort events based on their start time and duration
function sortEventsByStartTimeAndDuration(events: CalendarEvent[]): CalendarEvent[] {
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

// Define a helper function to find a column index for the event
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
        const width = isFirstColumn ? 1 : 1 - (columnIndex * 0.1);
        const left = isFirstColumn ? 0 : columnIndex * 0.1;
        const zIndex = 10 + columnIndex;

        // >> Add the positioned event to the result array.
        result.push({ event, top, height, left, width, zIndex });
    }

    // > Return the array of positioned events
    return result;
}
