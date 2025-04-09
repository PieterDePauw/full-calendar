"use client"

// Import modules
import { useMemo } from "react"
import { RiCalendarEventLine } from "@remixicon/react"
import { addDays, format, isToday } from "date-fns"
import { AgendaDaysToShow, CalendarEvent, EventItem, getAgendaEventsForDay } from "@/components/full-calendar"

// Agenda view component
export function AgendaView({ currentDate, events, onEventSelect }: { currentDate: Date; events: CalendarEvent[]; onEventSelect: (event: CalendarEvent) => void }) {
    // > Show events for the next days based on constant
    const days = useMemo(() => {
        console.log("Agenda view updating with date:", currentDate.toISOString())
        return Array.from({ length: AgendaDaysToShow }, (_, i) => addDays(new Date(currentDate), i))
    }, [currentDate])

    // > Helper function to handle the event click to select an event
    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        // >> Prevent the click event from bubbling up
        e.stopPropagation()
        // >> Log the event clicked
        console.log("Agenda view event clicked:", event)
        // >> Call the onEventSelect function with the selected
        onEventSelect(event)
    }

    // > Check if there are any days with events
    const hasEvents = days.some((day) => getAgendaEventsForDay(events, day).length > 0)

    // > Render the agenda view
    return (
        <div className="border-border/70 border-t px-4">
            {/* >> If there are events, render a message to show the user */}
            {!hasEvents && <EmptyAgendaView />}

            {/* >> Map through the days and render the events for each day */}
            {hasEvents && days.map((day) => {
                // >>> Get the events for each day
                const dayEvents = getAgendaEventsForDay(events, day)

                // >>> If there are no events for the day, return null (no need to render anything)
                if (dayEvents.length === 0) return null

                // >>> Sort the events for the day
                // const sortedEvents = dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

                // >>> Render the events for the day
                return (
                    <div key={day.toString()} className="border-border/70 relative my-12 border-t">
                        <span className="bg-background absolute -top-3 left-0 flex h-6 items-center pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs" data-today={isToday(day) || undefined}>
                            {format(day, "d MMM, EEEE")}
                        </span>
                        <div className="mt-6 space-y-2">
                            {dayEvents.map((event) => <EventItem key={event.id} event={event} currentView="agenda" onClick={(e) => handleEventClick(event, e)} />)}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// EmptyAgendaView component
export function EmptyAgendaView() {
    return (
        <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
            <RiCalendarEventLine size={32} className="text-muted-foreground/50 mb-2"/>
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="text-muted-foreground">There are no events scheduled for this time period.</p>
        </div>
    )
}
