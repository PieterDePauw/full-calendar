"use client"

// Import modules
import React, { useMemo } from "react"
import { addHours, areIntervalsOverlapping, differenceInMinutes, eachHourOfInterval, format, getHours, getMinutes, isSameDay, startOfDay } from "date-fns"
import { DraggableEvent, DroppableCell, EventItem, checkIfMultiDayEvent, useCurrentTimeIndicator, WeekCellsHeight, type CalendarEvent, generateDroppableCell } from "@/components/full-calendar"

// DayViewProps interface
interface DayViewProps {
    currentDate: Date
    events: CalendarEvent[]
    onEventSelect: (event: CalendarEvent) => void
    onEventCreate: (startTime: Date) => void
}

// PositionedEvent interface
interface PositionedEvent {
    event: CalendarEvent
    top: number
    height: number
    left: number
    width: number
    zIndex: number
}

// DayView component
export function DayView({ currentDate, events, onEventSelect, onEventCreate, }: DayViewProps) {
    // Get all of the hours in the current date
    const hours = useMemo(() => eachHourOfInterval({ start: startOfDay(currentDate), end: addHours(startOfDay(currentDate), 23) }), [currentDate])

    // Filter events that are happening on the current date
    // biome-ignore
    const dayEvents = useMemo(() => events.filter((event) => isSameDay(currentDate, new Date(event.start)) || isSameDay(currentDate, new Date(event.end)) || (currentDate > new Date(event.start) && currentDate < new Date(event.end))).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()), [currentDate, events])

    // Filter all-day events, including those explicitly marked as all-day events or events that span multiple days
    // biome-ignore
    const allDayEvents = useMemo(() => dayEvents.filter((event) => event.allDay || checkIfMultiDayEvent(event)), [dayEvents])

    // > Check if there are any all-day events
    const hasAllDayEvents = useMemo(() => allDayEvents.length >= 0, [allDayEvents])

    // Get only single-day time-based events
    // biome-ignore
    const timeEvents = useMemo(() => dayEvents.filter((event) => !event.allDay && !checkIfMultiDayEvent(event)), [dayEvents])

    // Process events to calculate positions
    // biome-ignore
    const positionedEvents = useMemo(() => {
        const result: PositionedEvent[] = []
        const dayStart = startOfDay(currentDate)

        // Sort events by start time and duration
        const sortedEvents = [...timeEvents].sort((a, b) => {
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

        // Track columns for overlapping events
        const columns: { event: CalendarEvent; end: Date }[][] = []

        sortedEvents.forEach((event) => {
            const eventStart = new Date(event.start)
            const eventEnd = new Date(event.end)

            // Adjust start and end times if they're outside this day
            const adjustedStart = isSameDay(currentDate, eventStart)
                ? eventStart
                : dayStart
            const adjustedEnd = isSameDay(currentDate, eventEnd)
                ? eventEnd
                : addHours(dayStart, 24)

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

            // First column takes full width, others are indented by 10% and take 90% width
            const width = columnIndex === 0 ? 1 : 0.9
            const left = columnIndex === 0 ? 0 : columnIndex * 0.1

            result.push({
                event,
                top,
                height,
                left,
                width,
                zIndex: 10 + columnIndex, // Higher columns get higher z-index
            })
        })

        return result
    }, [currentDate, timeEvents])

    // > Define a helper function to handle event clicks
    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation()
        onEventSelect(event)
    }

    // > Use the useCurrentTimeIndicator hook to get the current time position and visibility
    const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "day")

    return (
        <>
            {/* {hasAllDayEvents && (
                <div className="border-border/70 bg-muted/50 border-t">
                    <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
                        <div className="relative">
                            <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                                All day
                            </span>
                        </div>
                        <div className="border-border/70 relative border-r p-1 last:border-r-0">
                            {allDayEvents.map((event) => {
                                const eventStart = new Date(event.start)
                                const eventEnd = new Date(event.end)
                                const isFirstDay = isSameDay(currentDate, eventStart)
                                const isLastDay = isSameDay(currentDate, eventEnd)

                                return (
                                    <EventItem
                                        key={`spanning-${event.id}`}
                                        onClick={(e) => handleEventClick(event, e)}
                                        event={event}
                                        view="month"
                                        isFirstDay={isFirstDay}
                                        isLastDay={isLastDay}
                                    >
                                        <div>{event.title}</div>
                                    </EventItem>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )} */}
            {hasAllDayEvents && <AllDayEventsSection allDayEvents={allDayEvents} onEventClick={handleEventClick} currentDate={currentDate} />}

            {/* Time grid */}
            <div className="border-border/70 grid flex-1 grid-cols-[3rem_1fr] border-t sm:grid-cols-[4rem_1fr]">
                {/*
                <div>
                     {hours.map((hour, index) => (
                        <div
                            key={hour.toString()}
                            className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0"
                        >
                            {index > 0 && (
                                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                                    {format(hour, "h a")}
                                </span>
                            )}
                        </div>
                    ))}
                </div>*/}

                <HourLabels hours={hours} />

                <div className="relative">
                    {/* Positioned events */}
                    {positionedEvents && <EventsGrid positionedEvents={positionedEvents} onEventClick={handleEventClick} />}
                    {/* {positionedEvents.map((positionedEvent) => (
                        <div
                            key={positionedEvent.event.id}
                            className="absolute z-10 px-0.5"
                            style={{
                                top: `${positionedEvent.top}px`,
                                height: `${positionedEvent.height}px`,
                                left: `${positionedEvent.left * 100}%`,
                                width: `${positionedEvent.width * 100}%`,
                                zIndex: positionedEvent.zIndex,
                            }}
                        >
                            <div className="h-full w-full">
                                <DraggableEvent
                                    event={positionedEvent.event}
                                    view="day"
                                    onClick={(e) => handleEventClick(positionedEvent.event, e)}
                                    showTime
                                    height={positionedEvent.height}
                                />
                            </div>
                        </div>
                    ))} */}

                    {/* Current time indicator */}
                    {currentTimeVisible && <CurrentTimeIndicator currentTimePosition={currentTimePosition} />}
                    {/* {currentTimeVisible && (
                        <div
                            className="pointer-events-none absolute right-0 left-0 z-20"
                            style={{ top: `${currentTimePosition}%` }}
                        >
                            <div className="relative flex items-center">
                                <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
                                <div className="bg-primary h-[2px] w-full"></div>
                            </div>
                        </div>
                    )} */}

                    {/* Time grid */}
                    {hours && <TimeGrid hours={hours} currentDate={currentDate} onEventCreate={onEventCreate} />}
                </div>
            </div>
        </>
    )
}

// AllDayEventsSection component
export function AllDayEventsSection({ allDayEvents, onEventClick, currentDate }: { allDayEvents: CalendarEvent[]; onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void; currentDate: Date }) {
    return (
        <div className="border-border/70 bg-muted/50 border-t">
            <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
                <div className="relative">
                    <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                        All day
                    </span>
                </div>
                <div className="border-border/70 relative border-r p-1 last:border-r-0">
                    {allDayEvents.map((event) =>
                        <EventItem key={`spanning-${event.id}`} onClick={(e) => onEventClick(event, e)} event={event} view="month" isFirstDay={isSameDay(currentDate, new Date(event.start))} isLastDay={isSameDay(currentDate, new Date(event.end))}>
                            <div>{event.title}</div>
                        </EventItem>
                    )}
                </div>
            </div>
        </div>
    )
}

// HourLabels component
export function HourLabels({ hours }: { hours: Date[] }) {
    return (
        <div>
            {hours.map((hour, idx) => (
                <div key={hour.toString()} className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0">
                    {idx > 0 && <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">{format(hour, "h a")}</span>}
                </div>
            ))}
        </div>
    )
}

// CurrentTimeIndicator component
export function CurrentTimeIndicator({ currentTimePosition }: { currentTimePosition: number }) {
    return (
        <div className="pointer-events-none absolute right-0 left-0 z-20" style={{ top: `${currentTimePosition}%` }}>
            <div className="relative flex items-center">
                <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
                <div className="bg-primary h-[2px] w-full"></div>
            </div>
        </div>
    )
}

// TimeGrid component
export function TimeGrid({ hours, currentDate, onEventCreate }: { hours: Date[]; currentDate: Date; onEventCreate: (startTime: Date) => void }) {
    // > Return the JSX for the time grid component
    return (
        <div className="absolute inset-0 z-0">
            {hours.map((hour) => (
                <div key={hour.toString()} className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0">
                    {/* Quarter-hour intervals */}
                    {[0, 1, 2, 3].map((quarter) => {
                        return (
                            <DroppableCell
                                key={`${hour.toString()}-${quarter}`}
                                id={`day-cell-${currentDate.toISOString()}-${getHours(hour) + quarter * 0.25}`}
                                date={currentDate}
                                time={getHours(hour) + quarter * 0.25}
                                className={generateDroppableCell(quarter)}
                                onClick={() => {
                                    const startTime = new Date(currentDate)
                                    startTime.setHours(getHours(hour))
                                    startTime.setMinutes(quarter * 15)
                                    onEventCreate(startTime)
                                }}
                            />
                        )
                    })}
                </div>

            ))}
        </div>
    )
}

// EventsGrid component
export function EventsGrid({ positionedEvents, onEventClick }: { positionedEvents: PositionedEvent[]; onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void }) {
    return positionedEvents.map((positionedEvent) => (
        <div key={positionedEvent.event.id} className="absolute z-10 px-0.5" style={{ top: `${positionedEvent.top}px`, height: `${positionedEvent.height}px`, left: `${positionedEvent.left * 100}%`, width: `${positionedEvent.width * 100}%`, zIndex: positionedEvent.zIndex }}>
            <div className="h-full w-full">
                <DraggableEvent event={positionedEvent.event} view="day" onClick={(e) => onEventClick(positionedEvent.event, e)} showTime={true} height={positionedEvent.height} />
            </div>
        </div>
    ))
}
