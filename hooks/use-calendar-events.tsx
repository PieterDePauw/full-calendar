import { useCallback } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import type { CalendarEvent } from "@/components/full-calendar"
import { addHoursToDate, AgendaDaysToShow } from "@/components/full-calendar"

interface UseCalendarEventsProps {
    events: CalendarEvent[]
    onEventAdd?: (event: CalendarEvent) => void
    onEventUpdate?: (event: CalendarEvent) => void
    onEventDelete?: (eventId: string) => void

    // The necessary pieces of state for controlling event dialogs
    selectedEvent: CalendarEvent | null
    setSelectedEvent: (event: CalendarEvent | null) => void
    isEventDialogOpen: boolean
    setIsEventDialogOpen: (open: boolean) => void
}

/**
 * Handles logic around selecting events, creating new ones, saving changes,
 * and deleting them. Also includes toast messages, etc.
 */
export function useCalendarEvents({
    events,
    onEventAdd,
    onEventUpdate,
    onEventDelete,
    selectedEvent,
    setSelectedEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
}: UseCalendarEventsProps) {

    const handleEventSelect = useCallback((event: CalendarEvent) => {
        setSelectedEvent(event)
        setIsEventDialogOpen(true)
    }, [setSelectedEvent, setIsEventDialogOpen])

    const handleEventCreate = useCallback((startTime: Date) => {
        // Snap to 15-min intervals
        const minutes = startTime.getMinutes()
        const remainder = minutes % 15
        if (remainder !== 0) {
            if (remainder < 7.5) {
                startTime.setMinutes(minutes - remainder)
            } else {
                startTime.setMinutes(minutes + (15 - remainder))
            }
            startTime.setSeconds(0)
            startTime.setMilliseconds(0)
        }
        // Create a blank event (1-hour duration)
        const newEvent: CalendarEvent = {
            id: "",
            title: "",
            start: startTime,
            end: addHoursToDate(startTime, 1),
            allDay: false,
        }
        setSelectedEvent(newEvent)
        setIsEventDialogOpen(true)
    }, [setSelectedEvent, setIsEventDialogOpen])

    const handleEventCreateClick = useCallback(() => {
        // e.g. opening the dialog with no event selected
        setSelectedEvent(null)
        setIsEventDialogOpen(true)
    }, [setSelectedEvent, setIsEventDialogOpen])

    const handleEventSave = useCallback((event: CalendarEvent) => {
        if (event.id) {
            // Update existing
            onEventUpdate?.(event)
            toast(`Event "${event.title}" updated`, {
                description: format(event.start, "MMM d, yyyy"),
                position: "bottom-left",
            })
        } else {
            // Add new
            const newId = Math.random().toString(36).substring(2, 11)
            onEventAdd?.({ ...event, id: newId })
            toast(`Event "${event.title}" added`, {
                description: format(event.start, "MMM d, yyyy"),
                position: "bottom-left",
            })
        }
        setSelectedEvent(null)
        setIsEventDialogOpen(false)
    }, [onEventAdd, onEventUpdate, setSelectedEvent, setIsEventDialogOpen])

    const handleEventDelete = useCallback((eventId: string) => {
        const deletedEvent = events.find((ev) => ev.id === eventId)
        if (!deletedEvent) return

        onEventDelete?.(eventId)
        toast(`Event "${deletedEvent.title}" deleted`, {
            description: format(deletedEvent.start, "MMM d, yyyy"),
            position: "bottom-left",
        })
        setSelectedEvent(null)
        setIsEventDialogOpen(false)
    }, [events, onEventDelete, setSelectedEvent, setIsEventDialogOpen])

    const handleEventUpdate = useCallback((updatedEvent: CalendarEvent) => {
        onEventUpdate?.(updatedEvent)
        toast(`Event "${updatedEvent.title}" moved`, {
            description: format(updatedEvent.start, "MMM d, yyyy"),
            position: "bottom-left",
        })
    }, [onEventUpdate])

    return {
        selectedEvent,
        isEventDialogOpen,

        handleEventSelect,
        handleEventCreate,
        handleEventCreateClick,
        handleEventSave,
        handleEventDelete,
        handleEventUpdate,
    }
}
