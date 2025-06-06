// Import modules
import { subMonths, subWeeks, subDays, addMonths, addWeeks, addDays } from "date-fns"
import { NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA, type CalendarView } from "@/components/full-calendar"
import { useCalendarView, useCalendarDate } from "@/hooks/use-calendar"

// Define a custom hook to handle calendar navigation
export function useCalendarNavigation(initialDate: Date = new Date() ) {
    // > Use the useCalendarView hook to get the current view
    const { currentView, setCurrentView } = useCalendarView()

    // > Use the useCalendarDate hook to get the current date
    const { currentDate, setCurrentDate } = useCalendarDate()

    // > Define a function to handle date change
    function handleGoToSpecificDate(newDate: Date) {
        setCurrentDate(newDate)
    }

    // > Define a helper function to handle the previous button click
    function handleGoToPrevious() {
        if (currentView !== "month" && currentView !== "week" && currentView !== "day" && currentView !== "agenda") {
            return
        } else if (currentView === "month") {
            setCurrentDate(subMonths(currentDate, 1))
        } else if (currentView === "week") {
            setCurrentDate(subWeeks(currentDate, 1))
        } else if (currentView === "day") {
            setCurrentDate(subDays(currentDate, 1))
        } else if (currentView === "agenda") {
            setCurrentDate(subDays(currentDate, NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA))
        }
    }

    // > Define a helper function to handle the next button click
    function handleGoToNext() {
        if (currentView !== "month" && currentView !== "week" && currentView !== "day" && currentView !== "agenda") {
            return
        } else if (currentView === "month") {
            setCurrentDate(addMonths(currentDate, 1))
        } else if (currentView === "week") {
            setCurrentDate(addWeeks(currentDate, 1))
        } else if (currentView === "day") {
            setCurrentDate(addDays(currentDate, 1))
        } else if (currentView === "agenda") {
            setCurrentDate(addDays(currentDate, NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA))
        }
    }

    // > Define a helper function to handle the today button click
    function handleGoToToday() {
        // >> Get the current date
        const today = new Date()
        // >> Set the current date to the current date
        setCurrentDate(today)
    }

    // > Define a helper function to handle the view change
    function handleSwitchToSpecificView(view: CalendarView) {
        // >> Set the current view to the specified view
        setCurrentView(view)
    }

    // > Define a helper function to handle the view change to "day"
    function handleSwitchToDayView() {
        // >> Set the current view to "day"
        setCurrentView("day")
    }

    // > Define a helper function to handle the view change to "week"
    function handleSwitchToWeekView() {
        // >> Set the current view to "week"
        setCurrentView("week")
    }

    // > Define a helper function to handle the view change to "month"
    function handleSwitchToMonthView() {
        // >> Set the current view to "month"
        setCurrentView("month")
    }

    // > Define a helper function to handle the view change to "agenda"
    function handleSwitchToAgendaView() {
        // >> Set the current view to "agenda"
        setCurrentView("agenda")
    }

    // > Return the current date and helper functions
    return {
        currentDate,
        handleGoToSpecificDate,
        handleGoToNext,
        handleGoToPrevious,
        handleGoToToday,
        handleSwitchToSpecificView,
        handleSwitchToDayView,
        handleSwitchToWeekView,
        handleSwitchToMonthView,
        handleSwitchToAgendaView,
    }
}
