"use client"

import React, { useMemo } from "react"
import {
    addHours,
    areIntervalsOverlapping,
    differenceInMinutes,
    eachDayOfInterval,
    eachHourOfInterval,
    endOfWeek,
    format,
    getHours,
    getMinutes,
    isBefore,
    isSameDay,
    isToday,
    startOfDay,
    startOfWeek,
} from "date-fns"
import { cn } from "@/lib/utils"
import {
    DraggableEvent,
    DroppableCell,
    EventItem,
    checkIfMultiDayEvent,
    useCurrentTimeIndicator,
    WeekCellsHeight,
    getDroppableCellClasses,
    type CalendarEvent,
} from "@/components/full-calendar"
import { CurrentTimeIndicator } from "./day-view"

interface WeekViewProps {
    currentDate: Date
    events: CalendarEvent[]
    onEventSelect: (event: CalendarEvent) => void
    onEventCreate: (startTime: Date) => void
}

interface PositionedEvent {
    event: CalendarEvent
    top: number
    height: number
    left: number
    width: number
    zIndex: number
}

export function WeekView({ currentDate, events, onEventSelect, onEventCreate }: WeekViewProps) {
    // Get the days of the week based on the current date
    // prettier-ignore // biome-ignore
    const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 0 }), end: endOfWeek(currentDate, { weekStartsOn: 0 }) }), [currentDate])

    // Get the start of the week for the current date
    // prettier-ignore // biome-ignore
    const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate])

    // Get the hours for each day of the week based on the current date
    // prettier-ignore // biome-ignore
    const hours = useMemo(() => eachHourOfInterval({ start: startOfDay(currentDate), end: addHours(startOfDay(currentDate), 23) }), [currentDate])

    // Get all-day events and multi-day events for the week
    // prettier-ignore // biome-ignore
    const allDayEvents = useMemo(() => events.filter((event) => checkIfMultiDayEvent(event)).filter((event) => days.some((day) => isSameDay(day, new Date(event.start)) || isSameDay(day, new Date(event.end)) || (day > new Date(event.start) && day < new Date(event.end)))), [events, days])

    // Process events for each day to calculate positions
    const processedDayEvents = useMemo(() => {
        const result = days.map((day) => {
            // Get events for this day that are not all-day events or multi-day events
            const dayEvents = events.filter((event) => {
                // Skip all-day events and multi-day events
                if (event.allDay || checkIfMultiDayEvent(event)) return false

                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)

                // Check if event is on this day
                return (isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (eventStart < day && eventEnd > day))
            })

            // Sort events by start time and duration
            const sortedEvents = [...dayEvents].sort((a, b) => {
                const aStart = new Date(a.start)
                const bStart = new Date(b.start)
                const aEnd = new Date(a.end)
                const bEnd = new Date(b.end)

                // First sort by start time
                if (aStart < bStart) return -1
                if (aStart > bStart) return 1

                // If start times are equal, sort by duration (longer events first)
                const aDuration = differenceInMinutes(aEnd, aStart)
                const bDuration = differenceInMinutes(bEnd, bStart)
                return bDuration - aDuration
            })

            // Calculate positions for each event
            const positionedEvents: PositionedEvent[] = []
            const dayStart = startOfDay(day)

            // Track columns for overlapping events
            const columns: { event: CalendarEvent; end: Date }[][] = []

            // Loop through sorted events to position them
            sortedEvents.forEach((event) => {
                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)

                // Adjust start and end times if they're outside this day
                const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart
                const adjustedEnd = isSameDay(day, eventEnd) ? eventEnd : addHours(dayStart, 24)

                // Calculate top position and height
                const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60
                const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60
                const top = startHour * WeekCellsHeight
                const height = (endHour - startHour) * WeekCellsHeight

                // Find a column for this event
                let columnIndex = 0
                let placed = false

                while (!placed) {
                    if (!columns[columnIndex]) {
                        columns[columnIndex] = []
                        placed = true
                    } else {
                        // Check if this event overlaps with any event in this column
                        const overlaps = columns[columnIndex].some((col) =>
                            areIntervalsOverlapping(
                                { start: adjustedStart, end: adjustedEnd },
                                { start: new Date(col.event.start), end: new Date(col.event.end) }
                            )
                        )

                        if (!overlaps) {
                            placed = true
                        } else {
                            columnIndex++
                        }
                    }
                }

                // Add event to its column
                columns[columnIndex].push({ event, end: adjustedEnd })

                // Calculate width and left position based on number of columns
                const width = columnIndex === 0 ? 1 : 1 - (columnIndex * 0.9)
                const left = columnIndex === 0 ? 0 : columnIndex * 0.1

                // Higher columns get higher z-index
                positionedEvents.push({ event: event, top: top, height: height, left: left, width: width, zIndex: 10 + columnIndex })
            })

            // Return the positioned events for this day
            return positionedEvents
        })

        // Return the resulting array of positioned events for each day
        return result
    }, [days, events])

    // > Define a helper function to handle event clicks
    function handleEventClick(event: CalendarEvent, e: React.MouseEvent) {
        e.stopPropagation()
        onEventSelect(event)
    }

    // > Check if there are any all-day events
    const hasAllDayEvents = useMemo(() => allDayEvents.length >= 1, [allDayEvents])

    // > Check if there are any events for the current week
    const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "week")

    // > Return the JSX for the week view component
    return (
        <div className="flex h-full flex-col">
            {/* Header for the week view */}
            {days && <WeekViewHeader days={days} />}

            {/* All-day events section */}
            {hasAllDayEvents && <AllDayEventsSection days={days} allDayEvents={allDayEvents} onEventClick={handleEventClick} weekStart={weekStart} />}

            {/* Time grid section */}
            <div className="grid flex-1 grid-cols-8">
                {/* Time labels */}
                <div className="border-border/70 border-r">
                    {hours.map((hour, index) => (
                        <div key={hour.toString()} className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0">
                            {index > 0 && <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">{format(hour, "h a")}</span>}
                        </div>
                    ))}
                </div>

                {/* Event columns */}
                {days.map((day, dayIndex) => (
                    <div key={day.toString()} className="border-border/70 relative border-r last:border-r-0" data-today={isToday(day) || undefined}>
                        {/* Positioned events */}
                        {processedDayEvents[dayIndex].map((positionedEvent) => <PositionedEvent key={positionedEvent.event.id} positionedEvent={positionedEvent} handleEventClick={handleEventClick} />)}

                        {/* Current time indicator - only show for today's column */}
                        {currentTimeVisible && isToday(day) && <CurrentTimeIndicator currentTimePosition={currentTimePosition} />}

                        {/* Time grid */}
                        <TimeGrid currentDate={day} hours={hours} onEventCreate={onEventCreate} />
                    </div>
                ))}
            </div>
        </div>
    )
}

// TimeGrid component
export function TimeGrid({ hours, currentDate, onEventCreate }: { hours: Date[]; currentDate: Date; onEventCreate: (date: Date) => void  }) {
    // > Define a helper function to handle droppable cell clicks
    const handleDroppableCellClick = (day: Date, hourValue: number, quarter: number) => {
        const startTime = new Date(day)
        startTime.setHours(hourValue)
        startTime.setMinutes(quarter * 15)
        onEventCreate(startTime)
    }

    // > Return the JSX for the time grid component
    return (
        <div>
            {hours.map((hour) => (
                <div key={hour.toString()} className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0">
                    {/* Quarter-hour intervals */}
                    {[0, 1, 2, 3].map((quarter) => <DroppableCell id={`week-cell-${currentDate.toISOString()}-${getHours(hour) + quarter * 0.25}`} key={`${hour.toString()}-${quarter}`} date={currentDate} time={getHours(hour) + quarter * 0.25} className={getDroppableCellClasses(quarter)} onClick={() => handleDroppableCellClick(currentDate, getHours(hour), quarter)} />)}
                </div>
            ))}
        </div>
    );
}

// AllDayEventsSection component
export function AllDayEventsSection({ days, allDayEvents, onEventClick, weekStart }: { days: Date[]; allDayEvents: CalendarEvent[]; onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void, weekStart: Date }) {
    return (
        <div className="border-border/70 bg-muted/50 border-b">
            <div className="grid grid-cols-8">
                <div className="border-border/70 relative border-r">
                    <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                        All day
                    </span>
                </div>
                {days.map((day, dayIndex) => {
                    const dayAllDayEvents = allDayEvents.filter((event) => {
                        const eventStart = new Date(event.start)
                        const eventEnd = new Date(event.end)
                        return (isSameDay(day, eventStart) || (day > eventStart && day < eventEnd) || isSameDay(day, eventEnd))
                    })

                    return (
                        <div key={day.toString()} className="border-border/70 relative border-r p-1 last:border-r-0" data-today={isToday(day) || undefined}>
                            {dayAllDayEvents.map((event) => {
                                // Define the start and end dates for the event
                                const eventStart = new Date(event.start)
                                const eventEnd = new Date(event.end)

                                // Check if this is the first day in the current week view
                                const isFirstVisibleDay = dayIndex === 0 && isBefore(eventStart, weekStart)
                                const shouldShowTitle = isSameDay(day, eventStart) || isFirstVisibleDay

                                return (
                                    <EventItem key={`spanning-${event.id}`} onClick={(e) => onEventClick(event, e)} event={event} view="month" isFirstDay={isSameDay(day, eventStart)} isLastDay={isSameDay(day, eventEnd)}>
                                        {/* Show title if it's the first day of the event or the first visible day in the week */}
                                        <div className={cn("truncate", !shouldShowTitle && "invisible")} aria-hidden={!shouldShowTitle}>
                                            {event.title}
                                        </div>
                                    </EventItem>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// WeekViewHeader component
export function WeekViewHeader({ days }: { days: Date[] }) {
    return (
        <div className="bg-background/80 border-border/70 sticky top-0 z-30 grid grid-cols-8 border-b backdrop-blur-md">
            <div className="text-muted-foreground/70 py-2 text-center text-sm">
                <span className="max-[479px]:sr-only">{format(new Date(), "O")}</span>
            </div>
            {days.map((day) => (
                <div key={day.toString()} className="data-today:text-foreground text-muted-foreground/70 py-2 text-center text-sm data-today:font-medium" data-today={isToday(day) || undefined}>
                    <span className="sm:hidden" aria-hidden="true">{format(day, "E")[0]} {format(day, "d")}</span>
                    <span className="max-sm:hidden">{format(day, "EEE dd")}</span>
                </div>
            ))}
        </div>
    )
}

// PositionedEvent component
export function PositionedEvent({ positionedEvent, handleEventClick }: { positionedEvent: PositionedEvent; handleEventClick: (event: CalendarEvent, e: React.MouseEvent) => void }) {
    return (
        <div key={positionedEvent.event.id} className="absolute z-10 px-0.5" style={{ top: `${positionedEvent.top}px`, height: `${positionedEvent.height}px`, left: `${positionedEvent.left * 100}%`, width: `${positionedEvent.width * 100}%`, zIndex: positionedEvent.zIndex }} onClick={(e) => e.stopPropagation()}>
            <div className="h-full w-full">
                <DraggableEvent event={positionedEvent.event} view="week" onClick={(e) => handleEventClick(positionedEvent.event, e)} showTime={true} height={positionedEvent.height} />
            </div>
        </div>
    )
}
