// Import modules
import { useMemo } from "react"
import { format, startOfWeek, endOfWeek, isSameMonth, addDays } from "date-fns"
import { NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA, WEEK_STARTS_ON, useCalendarView, useCalendarDate } from "@/components/full-calendar"

// Define a custom hook to get the title of the calendar view
export function useCalendarViewTitle(): { viewTitle: string } {
    // > Get the current view from the global calendar view store
    const { currentView } = useCalendarView()

    // > Get the current date from the global calendar date store
    const { currentDate } = useCalendarDate()

    // > Use the useMemo hook to memoize the title based on the current view and the current date
    const viewTitle = useMemo(() => {
        // >> Use a switch statement to determine the title based on the current view
        switch (currentView) {
            // >>> If the current view is "day", ...
            case "day": {
                // >>>> Use the full date format, e.g., "Wednesday 5th April 2025"
                return format(currentDate, "EEEE dd MMMM yyyy")
            }

            // >>> If the current view is "week", ...
            case "week": {
                // >>>> Define a helper variable for the start date of the week
                const weekStart = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON })
                // >>>> Define a helper variable for the end date of the week
                const weekEnd = endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON })
                // >>>> Check if the start and end dates of the week are in the same month
                const fullWeekWithinSameMonth = isSameMonth(weekStart, weekEnd)
                // >>>> If the start and end dates of the week are in the same month, use the full month name, e.g., "April 2025"
                if (fullWeekWithinSameMonth) return format(weekStart, "MMMM yyyy")
                // >>>> Otherwise, use an abbreviated version of both month names, e.g. "Mar - Apr 2025"
                return `${format(weekStart, "MMM")} - ${format(weekEnd, "MMM yyyy")}`
            }

            // >>> If the current view is "month", ...
            case "month": {
                // >>>> Use the full month name, e.g. "April 2025"
                return format(currentDate, "MMMM yyyy")
            }

            // >>> If the current view is "agenda", ...
            case "agenda": {
                // >>>> Define a helper variable for the end date of the agenda
                const agendaEndDate = addDays(currentDate, NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA - 1)
                // >>>> Check if the agenda start and end dates are in the same month
                const fullAgendaWithinSameMonth = isSameMonth(currentDate, agendaEndDate)
                // >>>> If all start and end dates of the agenda are in the same month, use the full month name, e.g., "April 2025"
                if (fullAgendaWithinSameMonth) return format(currentDate, "MMMM yyyy")
                // >>>> Otherwise, use an abbreviated version of both month names, e.g. "Apr - May 2025"
                return `${format(currentDate, "MMM")} - ${format(agendaEndDate, "MMM yyyy")}`
            }

            // >>> If the current view is any other view, (which should not happen)
            default: {
                // >>>> Throw an error indicating that the view is not valid
                throw new Error(`Could not determine title for view "${currentView}", because it is not a valid view`)
            }
        }
    }, [currentDate, currentView, WEEK_STARTS_ON, NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA])

    // > Return the memoized title
    return { viewTitle }
}
