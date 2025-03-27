"use client"

// Import modules
import { useEffect, useMemo, useRef } from "react"
import { format, isSameDay } from "date-fns"
import { XIcon } from "lucide-react"
import { EventItem, type CalendarEvent } from "@/components/full-calendar"

interface EventsPopupProps {
    date: Date
    events: CalendarEvent[]
    position: { top: number; left: number }
    onClose: () => void
    onEventSelect: (event: CalendarEvent) => void
}

// Events popup component
export function EventsPopup({ date, events, position, onClose, onEventSelect }: EventsPopupProps) {
    // > Use ref to get æ ref to the popup element
    const popupRef = useRef<HTMLDivElement>(null)
    // > Use the useEffect hook to handle clicks outside the popup
    useEffect(() => {
        // >> Define the handleClickOutside function
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) { onClose() }
        }
        // >> Add the handleClickOutside function to the event listener for mousedown
        document.addEventListener("mousedown", handleClickOutside)
        // >> Return a cleanup function to remove the event listener
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [onClose])

    // > Use the useEffect hook to handle the escape key
    useEffect(() => {
        // >> Define the handleEscKey function
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }
        // >> Add the handleEscKey function to the event listener for keydown
        document.addEventListener("keydown", handleEscKey)
        // >> Return a cleanup function to remove the event listener
        return () => document.removeEventListener("keydown", handleEscKey)
    }, [onClose])

    // > Define the handleEventClick function
    const handleEventClick = (event: CalendarEvent) => {
        onEventSelect(event)
        onClose()
    }

    // Adjust position to ensure popup stays within viewport
    const adjustedPosition = useMemo(() => {
        const positionCopy = { ...position }

        // Check if we need to adjust the position to fit in the viewport
        if (popupRef.current) {
            const rect = popupRef.current.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            // Adjust horizontally if needed
            if (positionCopy.left + rect.width > viewportWidth) {
                positionCopy.left = Math.max(0, viewportWidth - rect.width)
            }

            // Adjust vertically if needed
            if (positionCopy.top + rect.height > viewportHeight) {
                positionCopy.top = Math.max(0, viewportHeight - rect.height)
            }
        }

        return positionCopy
    }, [position])

    return (
        <div ref={popupRef} className="bg-background absolute z-50 max-h-96 w-80 overflow-auto rounded-md border shadow-lg" style={{ top: `${adjustedPosition.top}px`, left: `${adjustedPosition.left}px` }}>
            <div className="bg-background sticky top-0 flex items-center justify-between border-b p-3">
                <h3 className="font-medium">{format(date, "d MMMM yyyy")}</h3>
                <button onClick={onClose} className="hover:bg-muted rounded-full p-1" aria-label="Close">
                    <XIcon className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-2 p-3">
                {events.length === 0 ? (
                    <div className="text-muted-foreground py-2 text-sm">No events</div>
                ) : (
                    events.map((event) => {
                        const eventStart = new Date(event.start)
                        const eventEnd = new Date(event.end)
                        const isFirstDay = isSameDay(date, eventStart)
                        const isLastDay = isSameDay(date, eventEnd)

                        return (
                            <div
                                key={event.id}
                                className="cursor-pointer"
                                onClick={() => handleEventClick(event)}
                            >
                                <EventItem
                                    event={event}
                                    view="agenda"
                                    isFirstDay={isFirstDay}
                                    isLastDay={isLastDay}
                                />
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
