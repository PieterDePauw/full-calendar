// Import modules
import { useMemo } from "react"
import { format, startOfWeek, endOfWeek, isSameMonth, addDays } from "date-fns"
import { NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA, WEEK_STARTS_ON, useCalendarView, useCalendarDate } from "@/components/full-calendar"

// Define a custom hook to get the title of the calendar view
export function useCalendarViewTitle() {
    // > Get the current view from the global calendar view store
    const { currentView } = useCalendarView()

    // > Get the current date from the global calendar date store
    const { currentDate } = useCalendarDate()

    // > Return a title based on the current view and the current date
    return useMemo(() => {
        // >> Use a switch statement to determine the title based on the current view
        switch (currentView) {
            case "day": {
                // Format: "Friday, April 5, 2025"
                return format(currentDate, "EEEE, MMMM d, yyyy")
            }

            case "week": {
                // >> Define a helper variable for the start date of the week
                const weekStart = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON })
                // >> Define a helper variable for the end date of the week
                const weekEnd = endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON })
                // Check if the start and end dates of the week are in the same month
                const fullWeekWithinSameMonth = isSameMonth(weekStart, weekEnd)
                // If the start and end dates of the week are in the same month, use the full month name, e.g., "April 2025"
                if (fullWeekWithinSameMonth) return format(weekStart, "MMMM yyyy")
                // Otherwise, use an abbreviated version of both month names, e.g. "Mar - Apr 2025"
                return `${format(weekStart, "MMM")} - ${format(weekEnd, "MMM yyyy")}`
            }

            case "month": {
                // Format: "April 2025"
                return format(currentDate, "MMMM yyyy")
            }

            case "agenda": {
                // >> Define a helper variable for the end date of the agenda
                const agendaEndDate = addDays(currentDate, NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA - 1)
                // Check if the agenda start and end dates are in the same month
                const fullAgendaWithinSameMonth = isSameMonth(currentDate, agendaEndDate)
                // If all start and end dates of the agenda are in the same month, use the full month name, e.g., "April 2025"
                if (fullAgendaWithinSameMonth) return format(currentDate, "MMMM yyyy")
                // Otherwise, use an abbreviated version of both month names, e.g. "Apr - May 2025"
                return `${format(currentDate, "MMM")} - ${format(agendaEndDate, "MMM yyyy")}`
            }

            default: {
                // Fallback (should be unreachable if validViews is correct)
                throw new Error(`Could not determine title for view "${currentView}", because it is not a valid view`)
            }
        }
    }, [currentDate, currentView, WEEK_STARTS_ON, NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA])
}
