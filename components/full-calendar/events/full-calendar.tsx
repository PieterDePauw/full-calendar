"use client"

// Import modules
import React from "react"
import { toast } from "sonner"
import { addHours } from "date-fns"
import { CalendarHeader, AgendaView, CalendarDndProvider, DayView, EventDialog, EventGap, EventHeight, MonthView, WeekCellsHeight, WeekView, useViewKeyboardShortcut, useCalendarEventManagement, useCalendarView, type CalendarEvent, useCalendarDate, formatForNotification } from "@/components/full-calendar"

// FullCalendar component
// biome-ignore format: keep all properties on the same line
export function FullCalendar({ events = [], onEventAdd, onEventUpdate, onEventDelete, className }: { events?: CalendarEvent[], onEventAdd?: (event: CalendarEvent) => void, onEventUpdate?: (event: CalendarEvent) => void, onEventDelete?: (eventId: string) => void, className?: string }) {
    // > Use the useCalendarView hook to manage the current view
    const { currentView } = useCalendarView()

    // > Use the useCalendarNavigation hook to manage the current date and navigation
    const { currentDate } = useCalendarDate()

    // > Use the useCalendarEventManagement hook to manage the selected date and the state of the dialog
    const { isEventDialogOpen, setIsEventDialogOpen, selectedEvent, setSelectedEvent, handleResetSelectedEvent, handleDialogClose, handleEventCreateClick } = useCalendarEventManagement()

    // > Use the useViewKeyboardShortcut hook to handle keyboard shortcuts for switching calendar views
    useViewKeyboardShortcut()

    // > Define a helper function to handle selecting an event
    function handleEventSelect(event: CalendarEvent) {
        // >> Log the selected event to the console
        console.log("Event selected:", event)
        // >> Set the selected event to the selected event
        setSelectedEvent(event)
        // >> Open the event dialog
        setIsEventDialogOpen(true)
    }

    // > Define a helper function to handle creating a new event
    function handleEventCreate(startTime: Date) {
        // >> Log the start time of the new event
        console.log("Creating new event at:", startTime) // Debug log
        // >> Snap to 15-minute intervals
        const minutes = startTime.getMinutes()
        const remainder = minutes % 15
        if (remainder !== 0) {
            if (remainder < 7.5) {
                // Round down to nearest 15 min
                startTime.setMinutes(minutes - remainder)
            } else {
                // Round up to nearest 15 min
                startTime.setMinutes(minutes + (15 - remainder))
            }
            startTime.setSeconds(0)
            startTime.setMilliseconds(0)
        }
        // >> Create a default new event with a default duration of 1 hour
        const newEvent: CalendarEvent = { id: "", title: "", start: startTime, end: addHours(startTime, 1), allDay: false }
        // >> Set the selected event to the default new event
        setSelectedEvent(newEvent)
        // >> Open the event dialog
        setIsEventDialogOpen(true)
    }

    // > Define a helper function to handle updating an event
    function handleEventUpdate(updatedEvent: CalendarEvent) {
        // >> Call the onEventUpdate callback with the updated event
        onEventUpdate?.(updatedEvent)
        // >> Show toast notification when an event is updated via drag and drop
        toast(`Event "${updatedEvent.title}" moved`, { description: formatForNotification(updatedEvent.start), position: "bottom-right" })
        // >> Reset the selected event to null
        handleResetSelectedEvent();
        // >> Close the event dialog after updating the event
        setIsEventDialogOpen(false)
    }

    // > Define a helper function to handle saving an event
    function handleEventSave(event: CalendarEvent) {
        // >> Check if the event has an ID
        const alreadyExists = event.id && events.some((existingEvent) => existingEvent.id === event.id)
        // >> If the event has an ID, it's an existing event that needs to be updated
        if (alreadyExists) { onEventUpdate?.(event) }
        // >> If the event doesn't have an ID, it's a new event that needs to be added
        if (!alreadyExists) { onEventAdd?.({ ...event, id: Math.random().toString(36).substring(2, 11) }) }
        // >> Show toast notification when an event is added or updated
        toast(`Event "${event.title}" ${event.id ? "updated" : "added"}`, { description: formatForNotification(event.start), position: "bottom-right" })
        // >> Reset the selected event to null
        handleResetSelectedEvent()
        // >> Close the event dialog after saving the event
        setIsEventDialogOpen(false)
    }

    // > Define a helper function to handle deleting an event
    function handleEventDelete(eventId: string) {
        // >> Find the event to be deleted
        const deletedEvent = events.find((event) => event.id === eventId)
        // >> If the event is not found, return early
        if (!deletedEvent) return
        // >> Call the onEventDelete callback with the event
        if (deletedEvent) { onEventDelete?.(eventId) }
        // >> Show toast notification when an event is deleted
        toast(`Event "${deletedEvent.title}" deleted`, { description: formatForNotification(deletedEvent.start), position: "bottom-right" })
        // >> Reset the selected event to null
        handleResetSelectedEvent()
        // >> Close the event dialog after deleting the event
        setIsEventDialogOpen(false)
    }

    // > Define the style object for the calendar component based on the event height, the event gap, and week cells height
    // const style = { "--event-height": `${EventHeight}px`, "--event-gap": `${EventGap}px`, "--week-cells-height": `${WeekCellsHeight}px` } as React.CSSProperties

    // > Return the FullCalendar component
    return (
        <div className="flex flex-1 flex-col rounded-lg border" style={{ "--event-height": `${EventHeight}px`, "--event-gap": `${EventGap}px`, "--week-cells-height": `${WeekCellsHeight}px` } as React.CSSProperties}>
            <CalendarDndProvider onEventUpdate={handleEventUpdate}>
                {/* Calendar header */}
                <CalendarHeader className={className} onEventCreateClick={handleEventCreateClick} />

                {/* Calendar main content */}
                <div className="flex flex-1 flex-col">
                    {currentView === "month" && <MonthView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />}
                    {currentView === "week" && <WeekView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />}
                    {currentView === "day" && <DayView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />}
                    {currentView === "agenda" && <AgendaView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} />}
                </div>

                {/* Event dialog for creating or editing events */}
                <EventDialog event={selectedEvent} isOpen={isEventDialogOpen} onClose={handleDialogClose} onSave={handleEventSave} onDelete={handleEventDelete} />
            </CalendarDndProvider>
        </div>
    )
}
