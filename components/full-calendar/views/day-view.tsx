"use client"

// Import modules
import { Fragment, useMemo, type MouseEvent } from "react"
import { addHours, eachHourOfInterval, getHours, isSameDay, startOfDay } from "date-fns"
import { DraggableEvent, DroppableCell, EventItem, CurrentTimeIndicator, checkIfMultiDayEvent, useCurrentTimeIndicator, useCalendarDate, type CalendarEvent, type PositionedEvent, getDroppableCellClasses, positionEvents, getAllEventsForDay, formatTimeLabel } from "@/components/full-calendar"

// DayView component
export function DayView({ events, onEventSelect, onEventCreate, }: { events: CalendarEvent[]; onEventSelect: (event: CalendarEvent) => void; onEventCreate: (startTime: Date) => void }) {
    // > Get the current date
    const { currentDate } = useCalendarDate()

    // > Get all of the hours in the current date
    // biome-ignore
    const hours = useMemo(() => eachHourOfInterval({ start: startOfDay(currentDate), end: addHours(startOfDay(currentDate), 23) }), [currentDate])

    // > Filter events that are happening on the current date
    // biome-ignore
    // const dayEvents = useMemo(() => events.filter((event) => isSameDay(currentDate, new Date(event.start)) || isSameDay(currentDate, new Date(event.end)) || (currentDate > new Date(event.start) && currentDate < new Date(event.end))).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()), [currentDate, events])

    // > Filter events that are happening on the current date
    // biome-ignore
    // const dayEvents = useMemo(() => getAllEventsForDay(events, currentDate), [currentDate, events])

    // > Get only single-day time-based events and process these events to calculate their positions
    // biome-ignore
    // const positionedEvents = useMemo(() => positionEvents(dayEvents.filter((event) => !event.allDay && !checkIfMultiDayEvent(event)), currentDate), [currentDate, dayEvents])

    // > Get only single-day time-based events and process these events to calculate their positions
    // biome-ignore
    const positionedEvents = useMemo(() => positionEvents(getAllEventsForDay(events, currentDate).filter((event) => !event.allDay && !checkIfMultiDayEvent(event)), currentDate), [currentDate, events])

    // > Filter all-day events, including those explicitly marked as all-day events or events that span multiple days
    // biome-ignore
    const allDayEvents = useMemo(() => getAllEventsForDay(events, currentDate).filter((event) => event.allDay || checkIfMultiDayEvent(event)), [currentDate, events])

    // > Check if there are any all-day events
    const hasAllDayEvents = useMemo(() => allDayEvents.length >= 1, [allDayEvents])

    // > Use the useCurrentTimeIndicator hook to get the current time position and visibility
    const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "day")

    // > Define a helper function to handle event clicks
    const handleEventClick = (event: CalendarEvent, e: MouseEvent) => {
        e.stopPropagation()
        onEventSelect(event)
    }

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
export function AllDayEventsSection({ allDayEvents, onEventClick, currentDate }: { allDayEvents: CalendarEvent[]; onEventClick: (event: CalendarEvent, e: MouseEvent) => void; currentDate: Date }) {
    // > If there are no all-day events, return null (i.e., don't render anything)
    if (!allDayEvents || allDayEvents.length === 0) return null

    // > Return the JSX for the all-day events section
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
                        <EventItem key={`spanning-${event.id}`} onClick={(e) => onEventClick(event, e)} event={event} currentView="month" isFirstDay={isSameDay(currentDate, new Date(event.start))} isLastDay={isSameDay(currentDate, new Date(event.end))}>
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
                    {idx > 0 && <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">{formatTimeLabel(hour)}</span>}
                </div>
            ))}
        </div>
    )
}

// TimeGrid component
export function TimeGrid({ hours, currentDate, onEventCreate }: { hours: Date[]; currentDate: Date; onEventCreate: (startTime: Date) => void }) {
    // > Define a helper function to handle droppable cell clicks
    function handleDroppableCellClick(hour: Date, quarter: number) {
        return () => {
            const startTime = new Date(currentDate)
            startTime.setHours(getHours(hour))
            startTime.setMinutes(quarter * 15)
            onEventCreate(startTime)
        }
    }

    // > Return the JSX for the time grid component
    return (
        <div className="absolute inset-0 z-0">
            {hours.map((hour) => (
                <div key={`${hour}`} className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0">
                    {/* Quarter-hour intervals */}
                    {[0, 1, 2, 3].map((quarter) => {
                        const time = getHours(hour) + quarter * 0.25
                        const className = getDroppableCellClasses(quarter)
                        return <DroppableCell key={`${hour}-${quarter}`} id={`day-cell-${currentDate.toISOString()}-${time}`} date={currentDate} time={time} className={className} onClick={handleDroppableCellClick(hour, quarter)} />
                    })}
                </div>

            ))}
        </div>
    )
}

// EventsGrid component
export function EventsGrid({ positionedEvents, onEventClick }: { positionedEvents: PositionedEvent[]; onEventClick: (event: CalendarEvent, e: MouseEvent) => void }) {
    return positionedEvents.map((positionedEvent) => (
        <div key={positionedEvent.event.id} className="absolute z-10 px-0.5" style={{ top: `${positionedEvent.top}px`, height: `${positionedEvent.height}px`, left: `${positionedEvent.left * 100}%`, width: `${positionedEvent.width * 100}%`, zIndex: positionedEvent.zIndex }}>
            <div className="h-full w-full">
                <DraggableEvent event={positionedEvent.event} currentView="day" onClick={(e) => onEventClick(positionedEvent.event, e)} showTime={true} height={positionedEvent.height} />
            </div>
        </div>
    ))
}
