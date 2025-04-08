"use client"

import { useMemo, useState, type CSSProperties } from "react"
import { RiCalendarCheckLine } from "@remixicon/react"
import { addDays, addMonths, addWeeks, endOfWeek, format, isSameMonth, startOfWeek, subMonths, subWeeks } from "date-fns"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { addHoursToDate, AgendaDaysToShow, AgendaView, CalendarDndProvider, CalendarEvent, CalendarView, DayView, EventDialog, EventGap, EventHeight, MonthView, WeekCellsHeight, WeekView, useViewKeyboardShortcut } from "@/components/full-calendar"

// FullCalendarProps type
export interface FullCalendarProps {
    events?: CalendarEvent[]
    onEventAdd?: (event: CalendarEvent) => void
    onEventUpdate?: (event: CalendarEvent) => void
    onEventDelete?: (eventId: string) => void
    className?: string
    initialView?: CalendarView
}

// FullCalendar component
export function FullCalendar({ events = [], onEventAdd, onEventUpdate, onEventDelete, className, initialView = "month" }: FullCalendarProps) {
    // > Define the initial date as today
    const today = new Date()

    // > Use the useState hook to manage the current date
    const [currentDate, setCurrentDate] = useState<Date>(today)

    // > Use the useState hook to manage the current view
    const [view, setView] = useState<CalendarView>(initialView)

    // > Use the useState hook to manage the event dialog state
    const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false)

    // > Use the useState hook to manage the selected event
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

    // > Use the useViewKeyboardShortcut hook to handle keyboard shortcuts for switching calendar views
    useViewKeyboardShortcut({ isEventDialogOpen, setView })

    // // > Use the useEffect hook to listen for keydown events to switch between calendar views
    // useEffect(() => {
    //     // >> Define the handleKeyDown function
    //     function handleKeyDown(e: KeyboardEvent) {
    //         // >>> If user is typing in an input, a textarea or a contentEditable element or if the event dialog is open, return early
    //         if (isEventDialogOpen || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable)) { return}
    //         // >>> Get the key pressed
    //         const keyPressed = e.key.toLowerCase()
    //         // >>> Switch view based on key pressed
    //         switch (keyPressed) {
    //             case "m":
    //                 setView("month")
    //                 break
    //             case "w":
    //                 setView("week")
    //                 break
    //             case "d":
    //                 setView("day")
    //                 break
    //             case "a":
    //                 setView("agenda")
    //                 break
    //             default:
    //                 break
    //         }
    //     }
    //     // >> Add the handleKeyDown to the event listener for keydown
    //     window.addEventListener("keydown", handleKeyDown)
    //     // >> Return a function to clean up the event listener
    //     return () => window.removeEventListener("keydown", handleKeyDown)
    // }, [isEventDialogOpen])

    // > Define a helper function to handle the previous button click
    function handleGoToPrevious() {
        if (view === "month") {
            setCurrentDate(subMonths(currentDate, 1))
        } else if (view === "week") {
            setCurrentDate(subWeeks(currentDate, 1))
        } else if (view === "day") {
            setCurrentDate(addDays(currentDate, -1))
        } else if (view === "agenda") {
            setCurrentDate(addDays(currentDate, -AgendaDaysToShow))
        }
    }

    // > Define a helper function to handle the next button click
    function handleGoToNext() {
        if (view === "month") {
            setCurrentDate(addMonths(currentDate, 1))
        } else if (view === "week") {
            setCurrentDate(addWeeks(currentDate, 1))
        } else if (view === "day") {
            setCurrentDate(addDays(currentDate, 1))
        } else if (view === "agenda") {
            setCurrentDate(addDays(currentDate, AgendaDaysToShow))
        }
    }

    // > Define a helper function to handle the today button click
    function handleGoToToday() {
        // >> Set the current date to the current date
        setCurrentDate(today)
    }

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

    // > Define a helper function to handle saving an event
    function handleEventSave(event: CalendarEvent) {
        // >> IF the event has an ID, it's an existing event that needs to be updated
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

        // >> Close the event dialog after saving the event and reset the selected event
        setIsEventDialogOpen(false)
        setSelectedEvent(null)
    }

    // > Define a helper function to handle deleting an event
    function handleEventDelete(eventId: string) {
        // >> Find the event to be deleted
        const deletedEvent = events.find((e) => e.id === eventId)
        // >> If the event is not found, return early
        if (!deletedEvent) return
        // >> Call the onEventDelete callback with the event
        onEventDelete?.(eventId)
        // >> Close the event dialog
        setIsEventDialogOpen(false)
        // >> Reset the selected event
        setSelectedEvent(null)
        // >> Show toast notification when an event is deleted
        toast(`Event "${deletedEvent.title}" deleted`, {
            description: format(new Date(deletedEvent.start), "MMM d, yyyy"),
            position: "bottom-left"
        })
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
    }

    // > Use the useMemo hook to calculate the view title based on the current date and view
    const viewTitle = useMemo(() => {
        if (view === "month") {
            return format(currentDate, "MMMM yyyy")
        } else if (view === "week") {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 })
            const end = endOfWeek(currentDate, { weekStartsOn: 0 })
            if (isSameMonth(start, end)) {
                return format(start, "MMMM yyyy")
            } else {
                return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
            }
        } else if (view === "day") {
            return (
                <>
                    <span className="min-[480px]:hidden" aria-hidden="true">
                        {format(currentDate, "MMM d, yyyy")}
                    </span>
                    <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
                        {format(currentDate, "MMMM d, yyyy")}
                    </span>
                    <span className="max-md:hidden">
                        {format(currentDate, "EEE MMMM d, yyyy")}
                    </span>
                </>
            )
        } else if (view === "agenda") {
            // Show the month range for agenda view
            const start = currentDate
            const end = addDays(currentDate, AgendaDaysToShow - 1)

            if (isSameMonth(start, end)) {
                return format(start, "MMMM yyyy")
            } else {
                return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
            }
        } else {
            return format(currentDate, "MMMM yyyy")
        }
    }, [currentDate, view])

    // > Define the style object for the calendar component based on the event height, the event gap, and week cells height
    const style = {
        "--event-height": `${EventHeight}px`,
        "--event-gap": `${EventGap}px`,
        "--week-cells-height": `${WeekCellsHeight}px`,
    } as CSSProperties

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
                                            {view.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="max-[479px]:sr-only">
                                            {view.charAt(0).toUpperCase() + view.slice(1)}
                                        </span>
                                    </span>
                                    <ChevronDownIcon className="-me-1 opacity-60" size={16} aria-hidden="true"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-32">
                                <DropdownMenuItem onClick={() => setView("month")}>
                                    Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setView("week")}>
                                    Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setView("day")}>
                                    Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setView("agenda")}>
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
                    {view === "month" && (
                        <MonthView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {view === "week" && (
                        <WeekView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {view === "day" && (
                        <DayView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} onEventCreate={handleEventCreate} />
                    )}
                    {view === "agenda" && (
                        <AgendaView currentDate={currentDate} events={events} onEventSelect={handleEventSelect} />
                    )}
                </div>

                {/* Event dialog for creating or editing events */}
                <EventDialog event={selectedEvent} isOpen={isEventDialogOpen} onClose={handleDialogClose} onSave={handleEventSave} onDelete={handleEventDelete} />
            </CalendarDndProvider>
        </div>
    )
}
