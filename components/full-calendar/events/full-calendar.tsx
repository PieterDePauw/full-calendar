"use client"

// Import modules
import { useState, type CSSProperties } from "react"
import { RiCalendarCheckLine } from "@remixicon/react"
import { format } from "date-fns"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { addHoursToDate, AgendaView, CalendarDndProvider, DayView, EventDialog, EventGap, EventHeight, MonthView, WeekCellsHeight, WeekView, capitalize, getFirstLetter, useViewKeyboardShortcut, useCalendarNavigation, useCalendarViewTitle, useCalendarView, type CalendarEvent } from "@/components/full-calendar"

// FullCalendarProps type
export interface FullCalendarProps {
    events?: CalendarEvent[]
    onEventAdd?: (event: CalendarEvent) => void
    onEventUpdate?: (event: CalendarEvent) => void
    onEventDelete?: (eventId: string) => void
    className?: string
}

// FullCalendar component
export function FullCalendar({ events = [], onEventAdd, onEventUpdate, onEventDelete, className }: FullCalendarProps) {
    // > Define the initial date as today
    const initialDate = new Date()

    // > We no longer keep current view in local state
    const { currentView, setCurrentView } = useCalendarView()

    // > Use the useState hook to manage the event dialog state
    const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false)

    // > Use the useState hook to manage the selected event
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

    // > Use the useCalendarNavigation hook to manage the current date and navigation
    const { currentDate, handleGoToNext, handleGoToPrevious, handleGoToToday } = useCalendarNavigation({ initialDate })

    // > Use the useCalendarViewTitle hook to manage the view title
    const viewTitle = useCalendarViewTitle({ currentDate })

    // > Use the useViewKeyboardShortcut hook to handle keyboard shortcuts for switching calendar views
    useViewKeyboardShortcut({ isEventDialogOpen })

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
        const newEvent: CalendarEvent = { id: "", title: "", start: startTime, end: addHoursToDate(startTime, 1), allDay: false }
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
        toast(`Event "${updatedEvent.title}" moved`, {
            description: format(new Date(updatedEvent.start), "MMM d, yyyy"),
            position: "bottom-left"
        })
        // >> Reset the selected event to null
        setSelectedEvent(null)
        // >> Close the event dialog after updating the event
        setIsEventDialogOpen(false)
    }

    // > Define a helper function to handle the event create button click
    function handleEventCreateClick() {
        setSelectedEvent(null)
        setIsEventDialogOpen(true)
    }

    // > Define a helper function to handle the event dialog close
    function handleDialogClose() {
        setSelectedEvent(null);
        setIsEventDialogOpen(false)
    }

    // > Define a helper function to handle saving an event
    function handleEventSave(event: CalendarEvent) {
        // >> If the event has an ID, it's an existing event that needs to be updated
        if (event.id) {
            // >>> Call the onEventUpdate callback with the updated event
            onEventUpdate?.(event)
            // >>> Show toast notification when an event is updated
            toast(`Event "${event.title}" updated`, {
                description: format(new Date(event.start), "MMM d, yyyy"),
                position: "bottom-left",
            })
        }

        // >> If the event doesn't have an ID, it's a new event that needs to be added
        if (!event.id) {
            // >>> Call the onEventAdd callback with the new event
            onEventAdd?.({ ...event, id: Math.random().toString(36).substring(2, 11) })
            // >>> Show toast notification when an event is added
            toast(`Event "${event.title}" added`, {
                description: format(new Date(event.start), "MMM d, yyyy"),
                position: "bottom-left",
            })
        }
        // >> Reset the selected event to null
        setSelectedEvent(null)
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
        onEventDelete?.(eventId)
        // >> Show toast notification when an event is deleted
        toast(`Event "${deletedEvent.title}" deleted`, {
            description: format(new Date(deletedEvent.start), "MMM d, yyyy"),
            position: "bottom-left"
        })
        // >> Reset the selected event to null
        setSelectedEvent(null)
        // >> Close the event dialog after deleting the event
        setIsEventDialogOpen(false)
    }

    // > Define the style object for the calendar component based on the event height, the event gap, and week cells height
    const style = { "--event-height": `${EventHeight}px`, "--event-gap": `${EventGap}px`, "--week-cells-height": `${WeekCellsHeight}px` } as CSSProperties

    // > Return the FullCalendar component
    return (
        <div className="flex flex-1 flex-col rounded-lg border" style={style}>
            <CalendarDndProvider onEventUpdate={handleEventUpdate}>
                {/* Calendar header */}
                <div className={cn("flex items-center justify-between p-2 sm:p-4", className)}>
                    {/* Calendar header with buttons and view selector */}
                    <div className="flex items-center gap-1 sm:gap-4">
                        <Button variant="outline" className="aspect-square max-[479px]:p-0!" onClick={handleGoToToday}>
                            <RiCalendarCheckLine className="min-[480px]:hidden" size={16} aria-hidden="true" />
                            <span className="max-[479px]:sr-only">Today</span>
                        </Button>
                        <div className="flex items-center sm:gap-2">
                            <Button variant="ghost" size="icon" onClick={handleGoToPrevious} aria-label="Previous">
                                <ChevronLeftIcon size={16} aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleGoToNext} aria-label="Next">
                                <ChevronRightIcon size={16} aria-hidden="true" />
                            </Button>
                        </div>
                        <h2 className="text-sm font-semibold sm:text-lg md:text-xl">
                            {viewTitle}
                        </h2>
                    </div>

                    {/* View selector and new event button */}
                    <div className="flex items-center gap-2">
                        {/* View selector dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild={true}>
                                <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                                    <span>
                                        <span className="min-[480px]:hidden" aria-hidden="true">
                                            {getFirstLetter(currentView)}
                                        </span>
                                        <span className="max-[479px]:sr-only">
                                            {capitalize(currentView)}
                                        </span>
                                    </span>
                                    <ChevronDownIcon className="-me-1 opacity-60" size={16} aria-hidden="true"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-32">
                                <DropdownMenuItem onClick={() => setCurrentView("month")}>
                                    Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrentView("week")}>
                                    Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrentView("day")}>
                                    Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrentView("agenda")}>
                                    Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* New event button */}
                        <Button className="aspect-square max-[479px]:p-0!" onClick={handleEventCreateClick}>
                            <PlusIcon className="opacity-60 sm:-ms-1" size={16} />
                            <span className="max-sm:sr-only">New event</span>
                        </Button>
                    </div>
                </div>

                {/* Calendar main content */}
                <div className="flex flex-1 flex-col">
                    {currentView === "month" && (
                        <MonthView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {currentView === "week" && (
                        <WeekView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {currentView === "day" && (
                        <DayView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {currentView === "agenda" && (
                        <AgendaView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} />
                    )}
                </div>

                {/* Event dialog for creating or editing events */}
                <EventDialog event={selectedEvent} isOpen={isEventDialogOpen} onClose={handleDialogClose} onSave={handleEventSave} onDelete={handleEventDelete} />
            </CalendarDndProvider>
        </div>
    )
}
