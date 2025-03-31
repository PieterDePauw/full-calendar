"use client"

// Import modules
import { useMemo, useRef, useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CalendarEvent, checkIfMultiDayEvent, EventItem, useCalendarDnd, type DragHandlePositionType } from "@/components/full-calendar"

// DraggableEventProps interface
interface DraggableEventProps {
    event: CalendarEvent
    view: "month" | "week" | "day"
    showTime?: boolean
    onClick?: (e: React.MouseEvent) => void
    height?: number
    multiDayWidth?: number
    isFirstDay?: boolean
    isLastDay?: boolean
    ariaHidden?: boolean | "true" | "false"
}

// DraggableEvent component
export function DraggableEvent({ event, view, showTime, onClick, height, multiDayWidth, isFirstDay = true, isLastDay = true, ariaHidden: ariaHidden }: DraggableEventProps) {
    // > Get the activeId from the useCalendarDnd hook
    const { activeId } = useCalendarDnd()

    // > Use the useRef hook to create a ref for the element to be dragged
    const elementRef = useRef<HTMLDivElement>(null)

    // > Use the useState hook to create a state variable for the drag handle position
    const [dragHandlePosition, setDragHandlePosition] = useState<DragHandlePositionType | null>(null)

    // > Check if the event is a multi-day event
    const isMultiDayEvent = checkIfMultiDayEvent(event)

    // > Use the useMemo hook to keep a memoized value of the draggable event's id
    const id = useMemo(() => `${event.id}-${view}`, [event.id, view])

    // > Use the useDraggable hook to make the event draggable
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { event: event, view: view, isFirstDay: isFirstDay, isLastDay: isLastDay, isMultiDay: isMultiDayEvent, multiDayWidth: multiDayWidth, height: height || elementRef.current?.offsetHeight || null, dragHandlePosition: dragHandlePosition },
    })

    // > Define a helper function to handle the mouse down event to track where on the event the user clicked
    function handleMouseDown(e: React.MouseEvent) {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect()
            setDragHandlePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        }
    }

    // > Define a helper function to handle the touch start event to track where on the event the user touched
    function handleTouchStart(event: React.TouchEvent) {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect()
            setDragHandlePosition({ x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top })
        }
    }

    // > Don't render if this event is being dragged
    if (isDragging || activeId === id) {
        return <div ref={setNodeRef} className="opacity-0" style={{ height: height || "auto" }} />
    }

    // > Define a style object based on the transform property
    const style = transform
        ? { transform: CSS.Translate.toString(transform), height: height || "auto", width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined }
        : { height: height || "auto", width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined }

    // > Return the JSX for the draggable event
    return (
        <div ref={(node) => {setNodeRef(node); if (elementRef) elementRef.current = node}} style={style} className="touch-none">
            <EventItem event={event} view={view} showTime={showTime} isFirstDay={isFirstDay} isLastDay={isLastDay} isDragging={isDragging} onClick={onClick} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} dndListeners={listeners} dndAttributes={attributes} aria-hidden={ariaHidden} />
        </div>
    )
}
