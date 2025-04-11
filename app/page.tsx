"use client"

// Import modules
import { useState } from "react"
import { FullCalendar, type CalendarEvent } from "@/components/full-calendar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { generateSampleEvents } from "./data"

// Generate some sample events
const sampleEvents = generateSampleEvents()

// HomePage component@
export default function HomePage() {
    // > Use the useState hook to manage the events state
    const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)

    // > Define a helper function to handle adding a new event
    const handleEventAdd = (event: CalendarEvent) => setEvents([...events, event])

    // > Define a helper function to handle updating an existing event
    const handleEventUpdate = (updatedEvent: CalendarEvent) => setEvents(events.map((event) => event.id === updatedEvent.id ? updatedEvent : event))

    // > Define a helper function to handle deleting an event
    const handleEventDelete = (eventId: string) => setEvents(events.filter((event) => event.id !== eventId))

    // > Return the JSX for the HomePage component for rendering the calendar and theme toggle
    return (
        // Add min-h-screen to make it full height
        <div className="flex flex-col p-1 sm:p-4 md:p-8">
            <FullCalendar events={events} onEventAdd={handleEventAdd} onEventUpdate={handleEventUpdate} onEventDelete={handleEventDelete} />
            <ThemeToggle />
        </div>
    )
}
