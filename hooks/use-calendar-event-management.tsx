// Import modules
import { useState } from "react"
import { type CalendarEvent } from "@/lib/types"

// Define the useCalendarEventManagement hook to handle the selected event and the state of the event dialog
export function useCalendarEventManagement() {
    // > Use the useState hook to manage the event dialog state
    const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false)

    // > Use the useState hook to manage the selected event
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

    // > Define a helper function to handle resetting the selected event to null
    function handleResetSelectedEvent() {
        setSelectedEvent(null)
    }

    // > Define a helper function to handle the event create button click
    function handleEventCreateClick() {
        setSelectedEvent(null)
        setIsEventDialogOpen(true)
    }

    // > Define a helper function to handle the event dialog close
    function handleDialogClose() {
        setSelectedEvent(null)
        setIsEventDialogOpen(false)
    }

    // > Return the state and functions to manage the event dialog and selected event
    return {
        isEventDialogOpen,
        setIsEventDialogOpen,
        selectedEvent,
        setSelectedEvent,
        handleResetSelectedEvent,
        handleEventCreateClick,
        handleDialogClose
    }
}
