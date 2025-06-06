"use client"

// Import modules
import { useMemo, type ReactNode, type MouseEvent, type TouchEvent } from "react"
import { type DraggableAttributes } from "@dnd-kit/core"
import { type SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { differenceInMinutes, isPast } from "date-fns"
import { cn } from "@/lib/utils"
import { formatTimeWithOptionalMinutes, getEventWrapperClasses, getDayWeekEventClasses, getMonthEventClasses, getAgendaEventClasses, type CalendarEvent, type CalendarView } from "@/components/full-calendar"

// EventWrapperProps interface
interface EventWrapperProps {
    event: CalendarEvent
    isFirstDay?: boolean
    isLastDay?: boolean
    isDragging?: boolean
    onClick?: (e: MouseEvent) => void
    className?: string
    children: ReactNode
    currentTime?: Date
    dndListeners?: SyntheticListenerMap
    dndAttributes?: DraggableAttributes
    onMouseDown?: (e: MouseEvent) => void
    onTouchStart?: (e: TouchEvent) => void
}

// Shared wrapper component for event styling
function EventWrapper({ event, isFirstDay = true, isLastDay = true, isDragging, onClick, className, children, currentTime, dndListeners, dndAttributes, onMouseDown, onTouchStart }: EventWrapperProps) {
    // > Get the event color from the event object
    const eventColor = event.color

    // > Use the provided currentTime if it's available to calculate the updated end time, otherwise use the current event's end time
    const displayEnd = currentTime
        ? new Date(new Date(currentTime).getTime() + (new Date(event.end).getTime() - new Date(event.start).getTime()))
        : new Date(event.end)

    // > Check if the event is in the past based on the displayEnd time
    const isEventInPast = isPast(displayEnd)

    // > Return a button element with the appropriate classes and attributes
    return (
        <button className={getEventWrapperClasses({ isFirstDay, isLastDay, eventColor, className })} data-dragging={isDragging || undefined} data-past-event={isEventInPast || undefined} onClick={onClick} onMouseDown={onMouseDown} onTouchStart={onTouchStart} {...dndListeners} {...dndAttributes}>
            {children}
        </button>
    )
}

interface EventItemProps {
    event: CalendarEvent
    currentView: CalendarView
    isDragging?: boolean
    onClick?: (e: MouseEvent) => void
    showTime?: boolean
    currentTime?: Date // For updating time during drag
    isFirstDay?: boolean
    isLastDay?: boolean
    children?: ReactNode
    className?: string
    dndListeners?: SyntheticListenerMap
    dndAttributes?: DraggableAttributes
    onMouseDown?: (e: MouseEvent) => void
    onTouchStart?: (e: TouchEvent) => void
}

export function EventItem({ event, currentView, isDragging, onClick, showTime, currentTime, isFirstDay = true, isLastDay = true, children, className, dndListeners, dndAttributes, onMouseDown, onTouchStart }: EventItemProps) {
    // > Get the event color from the event object
    const eventColor = event.color

    // > Use the provided currentTime (for dragging) or the event's actual time
    const displayStart = useMemo(() => currentTime || new Date(event.start), [currentTime, event.start])

    // > If currentTime is available, calculate the updated end time based on the event's duration
    const displayEnd = useMemo(() => currentTime ? new Date(new Date(currentTime).getTime() + (new Date(event.end).getTime() - new Date(event.start).getTime())) : new Date(event.end), [currentTime, event.start, event.end])

    // > Use the useMemo hook to memoize whether the event is in the past
    const isEventInPast = useMemo(() => isPast(new Date(event.end)), [event.end])

    // > Use the useMemo hook to memoize whether the event is an all-day event
    const isAllDayEvent = useMemo(() => event.allDay, [event.allDay])

    // > Calculate event duration in minutes
    const durationInMinutes = useMemo(() => differenceInMinutes(displayEnd, displayStart), [displayStart, displayEnd])

    // > Define a function to get the event time string based on its duration
    function getEventTime() {
        // >> If the event is all day, display "All day"
        if (isAllDayEvent) return "All day"
        // >> If the event is short (i.e., less than 45 minutes), display only the start time
        if (durationInMinutes < 45) return formatTimeWithOptionalMinutes(displayStart)
        // >> If the event is longer (i.e., 45 minutes or more), display the start and end times
        return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`
    }

    if (currentView === "month") {
        return (
            <EventWrapper event={event} isFirstDay={isFirstDay} isLastDay={isLastDay} isDragging={isDragging} onClick={onClick} className={getMonthEventClasses({ className })} currentTime={currentTime} dndListeners={dndListeners} dndAttributes={dndAttributes} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                {children || (
                    <span className="truncate">
                        {!event.allDay && (
                            <span className="truncate text-[11px] font-normal opacity-70">
                                {formatTimeWithOptionalMinutes(displayStart)}{" "}
                            </span>
                        )}
                        {event.title}
                    </span>
                )}
            </EventWrapper>
        )
    }

    if (currentView === "week" || currentView === "day") {
        return (
            <EventWrapper event={event} isFirstDay={isFirstDay} isLastDay={isLastDay} isDragging={isDragging} onClick={onClick} className={getDayWeekEventClasses({ durationInMinutes, currentView, className })} currentTime={currentTime} dndListeners={dndListeners} dndAttributes={dndAttributes} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                {durationInMinutes < 45 ? (
                    <div className="truncate font-normal opacity-70 sm:text-[11px]">
                        {event.title}{" "}
                        {showTime && (
                            <span className={cn("opacity-70")}>
                                {formatTimeWithOptionalMinutes(displayStart)}
                            </span>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="truncate font-medium">{event.title}</div>
                        {showTime && (
                            <div className="truncate font-normal opacity-70 sm:text-[11px]">
                                {getEventTime()}
                            </div>
                        )}
                    </>
                )}
            </EventWrapper>
        )
    }

    // Agenda view - kept separate since it's significantly different
    return (
        <button className={getAgendaEventClasses({ eventColor, className })} data-past-event={isEventInPast} onClick={onClick} onMouseDown={onMouseDown} onTouchStart={onTouchStart} {...dndListeners} {...dndAttributes}>
            <div className="text-sm font-medium">{event.title}</div>
            <div className="text-xs opacity-70">
                {event.allDay ? (<span>{getEventTime()}</span>) : (<span className="uppercase">{formatTimeWithOptionalMinutes(displayStart)} -{" "}{formatTimeWithOptionalMinutes(displayEnd)}</span>)}
                {event.location && (<><span className="px-1 opacity-35"> · </span><span>{event.location}</span></>)}
            </div>
            {event.description && <div className="my-1 text-xs opacity-90">{event.description}</div>}
        </button>
    )
}
