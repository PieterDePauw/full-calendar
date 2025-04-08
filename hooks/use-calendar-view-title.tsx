import { useMemo } from "react"
import { format, startOfWeek, endOfWeek, isSameMonth, addDays } from "date-fns"
import { AgendaDaysToShow, WeekStartsOn } from "@/components/full-calendar"
import type { CalendarView } from "@/components/full-calendar"

/**
 * Returns the title for the calendar view based on the current date and view type.
 * @param {Object} params - The parameters object.
 * @param {Date} params.currentDate - The current date to display in the title.
 * @param {CalendarView} params.currentView - The current view type (month, week, day, agenda).
 * @returns {string} The formatted title for the calendar view.
 */
export function useCalendarViewTitle({ currentDate, currentView }: { currentDate: Date; currentView: CalendarView }) {
    return useMemo(() => {
        // > Check if the current view is valid
        if (currentView !== "month" && currentView !== "week" && currentView !== "day" && currentView !== "agenda") {
            return ""
        } else if (currentView === "day") {
            return format(currentDate, "EEEE, MMMM d, yyyy")
        } else if (currentView === "week") {
            if (isSameMonth(startOfWeek(currentDate, { weekStartsOn: WeekStartsOn }), endOfWeek(currentDate, { weekStartsOn: WeekStartsOn }))) {
                return format(startOfWeek(currentDate, { weekStartsOn: WeekStartsOn }), "MMMM yyyy")
            }
            return `${format(startOfWeek(currentDate, { weekStartsOn: WeekStartsOn }), "MMM")} - ${format(endOfWeek(currentDate, { weekStartsOn: WeekStartsOn }), "MMM yyyy")}`
        } else if (currentView === "month") {
            return format(currentDate, "MMMM yyyy")
        } else if (currentView === "agenda") {
            if (isSameMonth(currentDate, addDays(currentDate, AgendaDaysToShow - 1))) {
                return format(currentDate, "MMMM yyyy")
            }
            return `${format(currentDate, "MMM")} - ${format(addDays(currentDate, AgendaDaysToShow - 1), "MMM yyyy")}`
        }
        // Fallback
        return format(currentDate, "MMMM yyyy")
    }, [currentDate, currentView])
}
