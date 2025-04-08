// Import modules
import { useState } from "react"
import { AgendaDaysToShow, type CalendarView } from "@/components/full-calendar"
import { subMonths, subWeeks, subDays, addMonths, addWeeks, addDays } from "date-fns"

// Define a custom hook to handle calendar navigation
export function useCalendarNavigation({ currentView, initialDate }: { currentView: CalendarView, initialDate: Date }) {
    // > Use the useState hook to manage the current date
    const [currentDate, setCurrentDate] = useState<Date>(initialDate)

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
            setCurrentDate(subDays(currentDate, AgendaDaysToShow))
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
            setCurrentDate(addDays(currentDate, AgendaDaysToShow))
        }
    }

    // > Define a helper function to handle the today button click
    function handleGoToToday() {
        // >> Set the current date to the current date
        setCurrentDate(new Date())
    }


    return {
        currentDate,
        handleGoToSpecificDate,
        handleGoToNext,
        handleGoToPrevious,
        handleGoToToday,
    }
}
