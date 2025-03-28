import { differenceInDays, isSameDay } from "date-fns"

import type { CalendarEvent, EventColor } from "@/components/full-calendar"
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
    // Return true if all components are the same
    return isSameYear && isSameMonth && isSameDay && isSameHour && isSameMinutes
}

// Helper function to determine if an event should be hidden based on its index and visible count
export function isEventHidden(index: number, visibleCount: number | undefined): boolean {
    return (!!visibleCount && index >= visibleCount)
}

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
