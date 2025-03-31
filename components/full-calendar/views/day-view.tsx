"use client"

// Import modules
import React, { Fragment, useMemo } from "react"
import { addHours, eachHourOfInterval, format, getHours, isSameDay, startOfDay } from "date-fns"
import { DraggableEvent, DroppableCell, EventItem, checkIfMultiDayEvent, useCurrentTimeIndicator, type CalendarEvent, type PositionedEvent, generateDroppableCell, positionEvents } from "@/components/full-calendar"

// DayViewProps interface
interface DayViewProps {
    currentDate: Date
    events: CalendarEvent[]
    onEventSelect: (event: CalendarEvent) => void
    onEventCreate: (startTime: Date) => void
}

// DayView component
export function DayView({ currentDate, events, onEventSelect, onEventCreate, }: DayViewProps) {
    // > Get all of the hours in the current date
    // biome-ignore
    const hours = useMemo(() => eachHourOfInterval({ start: startOfDay(currentDate), end: addHours(startOfDay(currentDate), 23) }), [currentDate])

    // > Filter events that are happening on the current date
    // biome-ignore
    const dayEvents = useMemo(() => events.filter((event) => isSameDay(currentDate, new Date(event.start)) || isSameDay(currentDate, new Date(event.end)) || (currentDate > new Date(event.start) && currentDate < new Date(event.end))).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()), [currentDate, events])

    // > Filter all-day events, including those explicitly marked as all-day events or events that span multiple days
    // biome-ignore
    const allDayEvents = useMemo(() => dayEvents.filter((event) => event.allDay || checkIfMultiDayEvent(event)), [dayEvents])

    // > Check if there are any all-day events
    const hasAllDayEvents = useMemo(() => allDayEvents.length >= 0, [allDayEvents])

    // > Get only single-day time-based events
    // biome-ignore
    const timeEvents = useMemo(() => dayEvents.filter((event) => !event.allDay && !checkIfMultiDayEvent(event)), [dayEvents])

    // > Process events to calculate positions
    // biome-ignore
    // const positionedEvents = useMemo(() => {
    //     // >> Define a result array to hold positioned events
    //     const result: PositionedEvent[] = []

    //     // >> Define the start of the day
    //     const dayStart: Date = startOfDay(currentDate)

    //     // >> Sort events by start time and duration
    //     const sortedEvents: CalendarEvent[] = sortEventsByStartTimeAndDuration(timeEvents)

    //     // >> Define an array to hold columns for overlapping events
    //     const columns: { event: CalendarEvent; end: Date }[][] = []

    //     // >> Loop through each event to calculate its position
    //     sortedEvents.forEach((event) => {
    //         // >>> Get the start and end times of the event
    //         const eventStart = new Date(event.start)
    //         const eventEnd = new Date(event.end)

    //         // >>> Adjust start and end times if they're outside this day
    //         const adjustedStart = isSameDay(currentDate, eventStart)
    //             ? eventStart
    //             : dayStart
    //         const adjustedEnd = isSameDay(currentDate, eventEnd)
    //             ? eventEnd
    //             : addHours(dayStart, 24)

    //         // >>> Calculate the start time and the end time as hours in decimals
    //         const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60
    //         const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60

    //         // >>> Calculate top position and height
    //         const top = startHour * WeekCellsHeight
    //         const height = (endHour - startHour) * WeekCellsHeight

    //         // >>> Find a column for this event
    //         let columnIndex = 0
    //         let placed = false

    //         while (!placed) {
    //             if (!columns[columnIndex]) {
    //                 columns[columnIndex] = []
    //                 placed = true
    //             } else {
    //                 // Check if this event overlaps with any event in this column
    //                 const overlaps = columns[columnIndex].some((col) =>
    //                     areIntervalsOverlapping(
    //                         { start: adjustedStart, end: adjustedEnd },
    //                         { start: new Date(col.event.start), end: new Date(col.event.end) }
    //                     )
    //                 )

    //                 if (!overlaps) {
    //                     placed = true
    //                 } else {
    //                     columnIndex++
    //                 }
    //             }
    //         }

    //         // Add event to its column
    //         columns[columnIndex].push({ event, end: adjustedEnd })

    //         // First column takes full width, others are indented by 10% and take 90% width
    //         const width = columnIndex === 0 ? 1 : 0.9
    //         const left = columnIndex === 0 ? 0 : columnIndex * 0.1

    //         // Higher columns get higher z-index
    //         const adjustedZIndex = 10 + columnIndex

    //         // Add event to result
    //         result.push({ event, top, height, left, width, zIndex: adjustedZIndex })
    //     })

    //     // >> Return the result array holding the positioned events
    //     return result
    // }, [currentDate, timeEvents])

    // > Process events to calculate positions
    const positionedEvents = useMemo(() => positionEvents(timeEvents, currentDate), [currentDate, timeEvents])

    // > Define a helper function to handle event clicks
    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation()
        onEventSelect(event)
    }

    // > Use the useCurrentTimeIndicator hook to get the current time position and visibility
    const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "day")

    // > Return the JSX for the day view component
    return (
        <Fragment>
            {/* All-day events section */}
            {hasAllDayEvents && <AllDayEventsSection allDayEvents={allDayEvents} onEventClick={handleEventClick} currentDate={currentDate} />}
            {/* Time grid */}
            <div className="border-border/70 grid flex-1 grid-cols-[3rem_1fr] border-t sm:grid-cols-[4rem_1fr]">
                {/* Hour labels */}
                <HourLabels hours={hours} />
                {/* Event grid */}
                <div className="relative">
                    {/* Positioned events */}
                    {positionedEvents && <EventsGrid positionedEvents={positionedEvents} onEventClick={handleEventClick} />}
                    {/* Current time indicator */}
                    {currentTimeVisible && <CurrentTimeIndicator currentTimePosition={currentTimePosition} />}
                    {/* Time grid */}
                    {hours && <TimeGrid hours={hours} currentDate={currentDate} onEventCreate={onEventCreate} />}
                </div>
            </div>
        </Fragment>
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
