"use client"

// Import modules
import { createContext, useContext, useId, useRef, useState, type ReactNode } from "react"
import { DndContext, DragOverlay, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from "@dnd-kit/core"
import { addMinutes, differenceInMinutes } from "date-fns"
import { EventItem, compareDateTime, type CalendarEvent, type CalendarView, type DragHandlePositionType } from "@/components/full-calendar"

// Define the type for drag-and-drop context
type CalendarDndContextType = {
    activeEvent: CalendarEvent | null
    activeId: UniqueIdentifier | null
    activeView: CalendarView | null
    currentTime: Date | null
    eventHeight: number | null
    isMultiDay: boolean
    multiDayWidth: number | null
    dragHandlePosition: DragHandlePositionType | null
}

// Create the context for the calendar drag-and-drop functionality
const CalendarDndContext = createContext<CalendarDndContextType>({ activeEvent: null, activeId: null, activeView: null, currentTime: null, eventHeight: null, isMultiDay: false, multiDayWidth: null, dragHandlePosition: null })

// Create a custom hook to use the calendar drag-and-drop context
export function useCalendarDnd() {
    return useContext(CalendarDndContext)
}

// CalendarDndProvider component
// This component provides the drag-and-drop context for the calendar
// It uses the DndContext from dnd-kit to manage drag-and-drop interactions
export function CalendarDndProvider({ children, onEventUpdate }: { children: ReactNode; onEventUpdate: (event: CalendarEvent) => void }) {
    const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [activeView, setActiveView] = useState<"month" | "week" | "day" | null>(null)
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [eventHeight, setEventHeight] = useState<number | null>(null)
    const [isMultiDay, setIsMultiDay] = useState(false)
    const [multiDayWidth, setMultiDayWidth] = useState<number | null>(null)
    const [dragHandlePosition, setDragHandlePosition] = useState<DragHandlePositionType | null>(null)

    // > Use the useRef hook to store the original height of the event to maintain the drag overlay size
    const eventDimensions = useRef<{ height: number }>({ height: 0 })

    // > Use the useSensors hook to define the sensors for drag-and-drop interactions
    const sensors = useSensors(
        // >> Use the useSensor hook to define the mouse sensor and require the mouse to move by 5px before activating
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        // >> Use the useSensor hook to define the pointer sensor and require the pointer to move by 5px before activating
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        // >> Use the useSensor hook to define the touch sensor and require the touch to move by 5px before activating, after a 250ms delay
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    )

    // > Generate a stable ID for the DndContext
    const dndContextId = useId()

    // > Define a helper function to handle the drag start event
    function handleDragStart(dragStartEvent: DragStartEvent) {
        // >> Add safety check for data.current
        if (!dragStartEvent.active.data.current) {
            console.error("Missing data in drag start event", dragStartEvent)
            return
        }

        // >> Store the active event and its properties
        setActiveEvent(dragStartEvent.active.data.current.event)
        setActiveId(dragStartEvent.active.id)
        setActiveView(dragStartEvent.active.data.current.currentView)
        setCurrentTime(new Date(dragStartEvent.active.data.current.event.start))
        setIsMultiDay(dragStartEvent.active.data.current.isMultiDay || false)
        setMultiDayWidth(dragStartEvent.active.data.current.multiDayWidth || null)
        setDragHandlePosition(dragStartEvent.active.data.current.dragHandlePosition || null)

        // >> Assign the event height to the ref for the drag overlay and store it in state
        if (dragStartEvent.active.data.current.height) {
            eventDimensions.current.height = dragStartEvent.active.data.current.height
            setEventHeight(dragStartEvent.active.data.current.height)
        }
    }

    // > Define a helper function to handle the drag over event
    function handleDragOver(dragOverEvent: DragOverEvent) {
        // >> Check if there is an active event
        if (!activeEvent) {
            console.error("No active event found during drag over", dragOverEvent)
            return
        }

        // Add robust error checking
        if (!dragOverEvent.over || !dragOverEvent.over.data.current) {
            console.error("We could either not find the over element or not find its data")
            return
        }

        // Safely access data with checks
        const { date, time } = dragOverEvent.over.data.current as { date: Date; time?: number }

        // Update time for week/day views
        if (time !== undefined && activeView !== "month") {
            const newTime = new Date(date)

            // Calculate hours and minutes with 15-minute precision
            const hours = Math.floor(time)
            const fractionalHour = time - hours

            // Map to nearest 15 minute interval (0, 0.25, 0.5, 0.75)
            let minutes = 0
            if (fractionalHour < 0.125) minutes = 0
            else if (fractionalHour < 0.375) minutes = 15
            else if (fractionalHour < 0.625) minutes = 30
            else minutes = 45

            newTime.setHours(hours, minutes, 0, 0)

            // Only update if time has changed
            if (!currentTime ||
                newTime.getHours() !== currentTime.getHours() ||
                newTime.getMinutes() !== currentTime.getMinutes() ||
                newTime.getDate() !== currentTime.getDate() ||
                newTime.getMonth() !== currentTime.getMonth() ||
                newTime.getFullYear() !== currentTime.getFullYear()) {
                setCurrentTime(newTime)
            }
        } else if (activeView === "month") {
            // For month view, just update the date but preserve time
            const newTime = new Date(date)
            if (currentTime) {
                newTime.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds(), currentTime.getMilliseconds())
            }

            // Only update if date has changed
            if (!currentTime ||
                newTime.getDate() !== currentTime.getDate() ||
                newTime.getMonth() !== currentTime.getMonth() ||
                newTime.getFullYear() !== currentTime.getFullYear()) {
                setCurrentTime(newTime)
            }
        }

    }

    // > Define a helper function to handle the drag end event
    function handleDragEnd(dragEndEvent: DragEndEvent) {
        try {
            // Add robust error checking
            if (!dragEndEvent.over || !activeEvent || !currentTime) {
                // Reset state and exit early
                setActiveEvent(null)
                setActiveId(null)
                setActiveView(null)
                setCurrentTime(null)
                setEventHeight(null)
                setIsMultiDay(false)
                setMultiDayWidth(null)
                setDragHandlePosition(null)
                return
            }

            // Safely access data with checks
            if (!dragEndEvent.active.data.current || !dragEndEvent.over.data.current) {
                throw new Error("Missing data in drag dragEndEvent")
            }

            const activeData = dragEndEvent.active.data.current as { event?: CalendarEvent; currentView?: string }
            const overData = dragEndEvent.over.data.current as { date?: Date; time?: number }

            // Verify we have all required data
            if (!activeData.event || !overData.date) {
                throw new Error("Missing required event data")
            }

            // Calculate new start time
            const newStart = new Date(overData.date)

            // If time is provided (for week/day views), set the hours and minutes
            if (overData.time !== undefined) {
                const hours = Math.floor(overData.time)
                const fractionalHour = overData.time - hours

                // Map to nearest 15 minute interval (0, 0.25, 0.5, 0.75)
                let minutes = 0
                if (fractionalHour < 0.125) minutes = 0
                else if (fractionalHour < 0.375) minutes = 15
                else if (fractionalHour < 0.625) minutes = 30
                else minutes = 45

                newStart.setHours(hours, minutes, 0, 0)
            } else {
                // For month view, preserve the original time from currentTime
                newStart.setHours(
                    currentTime.getHours(),
                    currentTime.getMinutes(),
                    currentTime.getSeconds(),
                    currentTime.getMilliseconds()
                )
            }

            // Get the original start and end times from the active event
            const originalStart = new Date(activeData.event.start)
            const originalEnd = new Date(activeData.event.end)

            // Calculate new end time based on the original duration
            const durationMinutes = differenceInMinutes(originalEnd, originalStart)
            const newEnd = addMinutes(newStart, durationMinutes)

            // Check if the start time has actually changed
            const hasStartTimeChanged = compareDateTime(originalStart, newStart)

            // Update the event only if the time has changed
            if (hasStartTimeChanged) {
                onEventUpdate({ ...activeData.event, start: newStart, end: newEnd })
            }
        } catch (error) {
            console.error("Error in drag end handler:", error)
        } finally {
            // Always reset state
            setActiveEvent(null)
            setActiveId(null)
            setActiveView(null)
            setCurrentTime(null)
            setEventHeight(null)
            setIsMultiDay(false)
            setMultiDayWidth(null)
            setDragHandlePosition(null)
        }
    }

    // > Return the JSX for the calendar drag-and-drop context provider and the drag overlay component
    return (
        <DndContext id={dndContextId} sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <CalendarDndContext.Provider value={{ activeEvent, activeId, activeView, currentTime, eventHeight, isMultiDay, multiDayWidth, dragHandlePosition }} >
                {children}
                <DragOverlay adjustScale={false} dropAnimation={null}>
                    {activeEvent && activeView && (
                        <div style={{ height: eventHeight ? `${eventHeight}px` : "auto", width: isMultiDay && multiDayWidth ? `${multiDayWidth}%` : "100%" }}>
                            <EventItem event={activeEvent} currentView={activeView} isDragging={true} showTime={activeView !== "month"} currentTime={currentTime || undefined} isFirstDay={dragHandlePosition?.data?.isFirstDay !== false} isLastDay={dragHandlePosition?.data?.isLastDay !== false} />
                        </div>
                    )}
                </DragOverlay>
            </CalendarDndContext.Provider>
        </DndContext>
    )
}
