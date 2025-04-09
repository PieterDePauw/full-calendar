// Import modules
import { useMemo } from "react"
import { format, startOfWeek, endOfWeek, isSameMonth, addDays } from "date-fns"
import { NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA, WEEK_STARTS_ON } from "@/components/full-calendar"
import { useCalendarView } from "@/hooks/use-calendar-view"

// Use the useCalendarViewTitle hook to get the title of the calendar view
export function useCalendarViewTitle({ currentDate }: { currentDate: Date }) {
    // > Get the current view from the global calendar view store
    const { currentView } = useCalendarView()

    // > Return a title based on the current view
    return useMemo(() => {
        // > Check if the current view is valid
        if (currentView !== "month" && currentView !== "week" && currentView !== "day" && currentView !== "agenda") {
            return ""
        }
        if (currentView === "day") {
            return format(currentDate, "EEEE, MMMM d, yyyy")
        }
        if (currentView === "week") {
            if (isSameMonth(startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }))) {
                return format(startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), "MMMM yyyy")
            }
            return `${format(startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), "MMM")} - ${format(endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), "MMM yyyy")}`
        }
        if (currentView === "month") {
            return format(currentDate, "MMMM yyyy")
        }
        if (currentView === "agenda") {
            if (isSameMonth(currentDate, addDays(currentDate, NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA - 1))) {
                return format(currentDate, "MMMM yyyy")
            }
            return `${format(currentDate, "MMM")} - ${format(addDays(currentDate, NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA - 1), "MMM yyyy")}`
        }
        // Fallback
        return format(currentDate, "MMMM yyyy")
    }, [currentDate, currentView])
}
