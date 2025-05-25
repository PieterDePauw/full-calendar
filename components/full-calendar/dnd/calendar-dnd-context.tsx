"use client"

// Import modules
import { createContext, useContext, useId, useRef, useState, type ReactNode } from "react"
import { DndContext, DragOverlay, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from "@dnd-kit/core"
import { addMinutes, differenceInMinutes, isSameDay, startOfDay, endOfDay } from "date-fns"
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
    isDraggingFromAllDay: boolean
}

// Create the context for the calendar drag-and-drop functionality
const CalendarDndContext = createContext<CalendarDndContextType>({ 
    activeEvent: null, 
    activeId: null, 
    activeView: null, 
    currentTime: null, 
    eventHeight: null, 
    isMultiDay: false, 
    multiDayWidth: null, 
    dragHandlePosition: null,
    isDraggingFromAllDay: false 
})

// Create a custom hook to use the calendar drag-and-drop context
export function useCalendarDnd() {
    return useContext(CalendarDndContext)
}

// CalendarDndProvider component
export function CalendarDndProvider({ children, onEventUpdate }: { children: ReactNode; onEventUpdate: (event: CalendarEvent) => void }) {
    const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [activeView, setActiveView] = useState<"month" | "week" | "day" | null>(null)
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [eventHeight, setEventHeight] = useState<number | null>(null)
    const [isMultiDay, setIsMultiDay] = useState(false)
    const [multiDayWidth, setMultiDayWidth] = useState<number | null>(null)
    const [dragHandlePosition, setDragHandlePosition] = useState<DragHandlePositionType | null>(null)
    const [isDraggingFromAllDay, setIsDraggingFromAllDay] = useState(false)

    const eventDimensions = useRef<{ height: number }>({ height: 0 })

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    )

    const dndContextId = useId()

    function handleDragStart(dragStartEvent: DragStartEvent) {
        if (!dragStartEvent.active.data.current) {
            console.error("Missing data in drag start event", dragStartEvent)
            return
        }

        const eventData = dragStartEvent.active.data.current
        setActiveEvent(eventData.event)
        setActiveId(dragStartEvent.active.id)
        setActiveView(eventData.currentView)
        setCurrentTime(new Date(eventData.event.start))
        setIsMultiDay(eventData.isMultiDay || false)
        setMultiDayWidth(eventData.multiDayWidth || null)
        setDragHandlePosition(eventData.dragHandlePosition || null)
        setIsDraggingFromAllDay(eventData.isAllDay || false)

        if (eventData.height) {
            eventDimensions.current.height = eventData.height
            setEventHeight(eventData.height)
        }
    }

    function handleDragOver(dragOverEvent: DragOverEvent) {
        if (!activeEvent || !dragOverEvent.over || !dragOverEvent.over.data.current) {
            return
        }

        const { date, time, isAllDayArea } = dragOverEvent.over.data.current as { date: Date; time?: number; isAllDayArea?: boolean }
        const newTime = new Date(date)

        if (isDraggingFromAllDay && !isAllDayArea && time !== undefined) {
            // Converting from all-day to timed event
            const hours = Math.floor(time)
            const minutes = Math.round((time - hours) * 60 / 15) * 15
            newTime.setHours(hours, minutes, 0, 0)
            setCurrentTime(newTime)
            return
        }

        if (isAllDayArea) {
            // Dragging to all-day area
            newTime.setHours(0, 0, 0, 0)
            setCurrentTime(newTime)
            return
        }

        if (time !== undefined && activeView !== "month") {
            // Normal time-slot dragging
            const hours = Math.floor(time)
            const minutes = Math.round((time - hours) * 60 / 15) * 15
            newTime.setHours(hours, minutes, 0, 0)
            setCurrentTime(newTime)
        } else if (activeView === "month") {
            if (currentTime) {
                newTime.setHours(
                    currentTime.getHours(),
                    currentTime.getMinutes(),
                    currentTime.getSeconds(),
                    currentTime.getMilliseconds()
                )
            }
            setCurrentTime(newTime)
        }
    }

    function handleDragEnd(dragEndEvent: DragEndEvent) {
        try {
            if (!dragEndEvent.over || !activeEvent || !currentTime) {
                setActiveEvent(null)
                setActiveId(null)
                setActiveView(null)
                setCurrentTime(null)
                setEventHeight(null)
                setIsMultiDay(false)
                setMultiDayWidth(null)
                setDragHandlePosition(null)
                setIsDraggingFromAllDay(false)
                return
            }

            const overData = dragEndEvent.over.data.current as { date: Date; time?: number; isAllDayArea?: boolean }
            if (!overData) {
                throw new Error("Missing drop target data")
            }

            const newStart = new Date(overData.date)
            const originalStart = new Date(activeEvent.start)
            const originalEnd = new Date(activeEvent.end)
            const duration = differenceInMinutes(originalEnd, originalStart)

            if (overData.isAllDayArea) {
                // Converting to all-day event
                const newEvent = {
                    ...activeEvent,
                    start: startOfDay(newStart),
                    end: endOfDay(newStart),
                    allDay: true
                }
                onEventUpdate(newEvent)
            } else if (isDraggingFromAllDay && !overData.isAllDayArea && overData.time !== undefined) {
                // Converting from all-day to timed event
                const hours = Math.floor(overData.time)
                const minutes = Math.round((overData.time - hours) * 60 / 15) * 15
                newStart.setHours(hours, minutes, 0, 0)
                const newEnd = addMinutes(newStart, duration || 60)
                const newEvent = {
                    ...activeEvent,
                    start: newStart,
                    end: newEnd,
                    allDay: false
                }
                onEventUpdate(newEvent)
            } else {
                // Normal event update
                if (overData.time !== undefined) {
                    const hours = Math.floor(overData.time)
                    const minutes = Math.round((overData.time - hours) * 60 / 15) * 15
                    newStart.setHours(hours, minutes, 0, 0)
                } else {
                    newStart.setHours(
                        currentTime.getHours(),
                        currentTime.getMinutes(),
                        currentTime.getSeconds(),
                        currentTime.getMilliseconds()
                    )
                }

                const newEnd = addMinutes(newStart, duration)
                const hasStartTimeChanged = compareDateTime(originalStart, newStart)

                if (hasStartTimeChanged) {
                    onEventUpdate({ ...activeEvent, start: newStart, end: newEnd })
                }
            }
        } catch (error) {
            console.error("Error in drag end handler:", error)
        } finally {
            setActiveEvent(null)
            setActiveId(null)
            setActiveView(null)
            setCurrentTime(null)
            setEventHeight(null)
            setIsMultiDay(false)
            setMultiDayWidth(null)
            setDragHandlePosition(null)
            setIsDraggingFromAllDay(false)
        }
    }

    return (
        <DndContext id={dndContextId} sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <CalendarDndContext.Provider value={{ 
                activeEvent, 
                activeId, 
                activeView, 
                currentTime, 
                eventHeight, 
                isMultiDay, 
                multiDayWidth, 
                dragHandlePosition,
                isDraggingFromAllDay 
            }}>
                {children}
                <DragOverlay adjustScale={false} dropAnimation={null}>
                    {activeEvent && activeView && (
                        <div style={{ height: eventHeight ? `${eventHeight}px` : "auto", width: isMultiDay && multiDayWidth ? `${multiDayWidth}%` : "100%" }}>
                            <EventItem 
                                event={activeEvent} 
                                currentView={activeView} 
                                isDragging={true} 
                                showTime={activeView !== "month"} 
                                currentTime={currentTime || undefined} 
                                isFirstDay={dragHandlePosition?.data?.isFirstDay !== false} 
                                isLastDay={dragHandlePosition?.data?.isLastDay !== false} 
                            />
                        </div>
                    )}
                </DragOverlay>
            </CalendarDndContext.Provider>
        </DndContext>
    )
}