"use client"

// Import modules
import { useState, useRef } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CalendarEvent, checkIfMultiDayEvent, EventItem, useCalendarDnd, useCalendarView, type CalendarView, type DragHandlePositionType } from "@/components/full-calendar"

// DraggableEventProps interface
interface DraggableEventProps {
    event: CalendarEvent
    currentView: CalendarView
    showTime?: boolean
    onClick?: (e: React.MouseEvent) => void
    height?: number
    multiDayWidth?: number
    isFirstDay?: boolean
    isLastDay?: boolean
    ariaHidden?: boolean | "true" | "false"
    isAllDay?: boolean
}

// DraggableEvent component
export function DraggableEvent({ 
    event, 
    showTime, 
    onClick, 
    height, 
    multiDayWidth, 
    isFirstDay = true, 
    isLastDay = true, 
    ariaHidden,
    isAllDay = false 
}: DraggableEventProps) {
    const { activeId } = useCalendarDnd()
    const { currentView } = useCalendarView()
    const elementRef = useRef<HTMLDivElement>(null)
    const [dragHandlePosition, setDragHandlePosition] = useState<DragHandlePositionType | null>(null)
    const isMultiDayEvent = checkIfMultiDayEvent(event)

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${event.id}-${currentView}`,
        data: { 
            event, 
            currentView, 
            isFirstDay, 
            isLastDay, 
            isMultiDay: isMultiDayEvent, 
            multiDayWidth, 
            height: height || elementRef.current?.offsetHeight || null, 
            dragHandlePosition,
            isAllDay 
        },
    })

    function handleMouseDown(event: React.MouseEvent) {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect()
            setDragHandlePosition({ 
                x: event.clientX - rect.left, 
                y: event.clientY - rect.top,
                data: { isFirstDay, isLastDay } 
            })
        }
    }

    function handleTouchStart(event: React.TouchEvent) {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect()
            const touch = event.touches[0]
            if (touch) {
                setDragHandlePosition({ 
                    x: touch.clientX - rect.left, 
                    y: touch.clientY - rect.top,
                    data: { isFirstDay, isLastDay } 
                })
            }
        }
    }

    if (isDragging || activeId === `${event.id}-${currentView}`) {
        return <div ref={setNodeRef} className="opacity-0" style={{ height: height || "auto" }} />
    }

    const style = transform
        ? { 
            transform: CSS.Translate.toString(transform), 
            height: height || "auto", 
            width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined 
        }
        : { 
            height: height || "auto", 
            width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined 
        }

    return (
        <div 
            ref={(node) => {
                setNodeRef(node)
                if (elementRef) elementRef.current = node
            }} 
            style={style} 
            className="touch-none"
        >
            <EventItem 
                event={event} 
                currentView={currentView} 
                showTime={showTime} 
                isFirstDay={isFirstDay} 
                isLastDay={isLastDay} 
                isDragging={isDragging} 
                onClick={onClick} 
                onMouseDown={handleMouseDown} 
                onTouchStart={handleTouchStart} 
                dndListeners={listeners} 
                dndAttributes={attributes} 
                aria-hidden={ariaHidden} 
            />
        </div>
    )
}