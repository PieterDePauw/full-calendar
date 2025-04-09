"use client"

// Import modules
import { useState, useRef /* useMemo */ } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CalendarEvent, checkIfMultiDayEvent, EventItem, useCalendarDnd, useCalendarView, type CalendarView, type DragHandlePositionType } from "@/components/full-calendar"

// DraggableEventProps interface
interface DraggableEventProps {
    event: CalendarEvent
    currentView: CalendarView,
    // currentView: "month" | "week" | "day"
    showTime?: boolean
    onClick?: (e: React.MouseEvent) => void
    height?: number
    multiDayWidth?: number
    isFirstDay?: boolean
    isLastDay?: boolean
    ariaHidden?: boolean | "true" | "false"
}

// DraggableEvent component
export function DraggableEvent({ event, showTime, onClick, height, multiDayWidth, isFirstDay = true, isLastDay = true, ariaHidden: ariaHidden }: DraggableEventProps) {
    // > Get the activeId from the useCalendarDnd hook
    const { activeId } = useCalendarDnd()

    // > Get the view from the useCalendarView hook
    const { currentView } = useCalendarView()

    // > Use the useRef hook to create a ref for the element to be dragged
    const elementRef = useRef<HTMLDivElement>(null)

    // > Use the useState hook to create a state variable for the drag handle position
    const [dragHandlePosition, setDragHandlePosition] = useState<DragHandlePositionType | null>(null)

    // > Check if the event is a multi-day event
    const isMultiDayEvent = checkIfMultiDayEvent(event)

    // > Use the useMemo hook to keep a memoized value of the draggable event's id
    // const id = useMemo(() => `${event.id}-${currentView}`, [event.id, currentView])

    // > Use the useDraggable hook to make the event draggable
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${event.id}-${currentView}`,
        data: { event: event, currentView: currentView, isFirstDay: isFirstDay, isLastDay: isLastDay, isMultiDay: isMultiDayEvent, multiDayWidth: multiDayWidth, height: height || elementRef.current?.offsetHeight || null, dragHandlePosition: dragHandlePosition },
    })

    // > Define a helper function to handle the mouse down event to track where on the event the user clicked
    function handleMouseDown(event: React.MouseEvent) {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect()
            setDragHandlePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top })
        }
    }

    // > Define a helper function to handle the touch start event to track where on the event the user touched
    function handleTouchStart(event: React.TouchEvent) {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect()
            const touch = event.touches[0]
            if (touch) {
                setDragHandlePosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top })
            }
        }
    }


    // > Don't render if this event is being dragged
    if (isDragging || activeId === `${event.id}-${currentView}`) {
        return <div ref={setNodeRef} className="opacity-0" style={{ height: height || "auto" }} />
    }

    // > Define a style object based on the transform property
    const style = transform
        ? { transform: CSS.Translate.toString(transform), height: height || "auto", width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined }
        : { height: height || "auto", width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined }

    // > Return the JSX for the draggable event
    return (
        <div ref={(node) => {setNodeRef(node); if (elementRef) elementRef.current = node}} style={style} className="touch-none">
            <EventItem event={event} currentView={currentView} showTime={showTime} isFirstDay={isFirstDay} isLastDay={isLastDay} isDragging={isDragging} onClick={onClick} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} dndListeners={listeners} dndAttributes={attributes} aria-hidden={ariaHidden} />
        </div>
    )
}
