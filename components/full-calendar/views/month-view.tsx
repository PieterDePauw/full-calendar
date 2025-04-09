"use client"

// Import modules and types
import { Fragment, useMemo, type CSSProperties, type MouseEvent } from "react"
import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DraggableEvent, DroppableCell, NUMBER_OF_DAYS_PER_WEEK, EVENT_GAP, EVENT_HEIGHT, WEEK_STARTS_ON, EventItem, formatTimeWithOptionalMinutes, getAllEventsForDay, getEventsForDay, getSpanningEventsForDay, sortEvents, useEventVisibility, type CalendarEvent } from "@/components/full-calendar"
import { useMounted } from "@/hooks/use-mounted"

// MonthView component
export function MonthView({ currentDate, events, onEventSelect, onEventCreate }: { currentDate: Date; events: CalendarEvent[]; onEventSelect: (event: CalendarEvent) => void; onEventCreate: (startTime: Date) => void }) {
    // > Get all the days of the month, beginning from the start of the week in which the month starts and ending at the end of the week in which the month ends
    const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: WEEK_STARTS_ON }), end: endOfWeek(endOfMonth(startOfMonth(currentDate)), { weekStartsOn: WEEK_STARTS_ON }) }), [currentDate])

    // > Get all the days of the week, based on the current date
    const weekdays = useMemo(() => Array.from({ length: NUMBER_OF_DAYS_PER_WEEK }).map((_, i) => format(addDays(startOfWeek(new Date(), { weekStartsOn: WEEK_STARTS_ON }), i), "EEE")), [])

    // > Get all the weeks of the month, based on the days of the month
    const weeks = useMemo(() => Array.from({ length: Math.ceil(days.length / NUMBER_OF_DAYS_PER_WEEK) }, (_, i) => days.slice(i * NUMBER_OF_DAYS_PER_WEEK, i * NUMBER_OF_DAYS_PER_WEEK + NUMBER_OF_DAYS_PER_WEEK)), [days])

    // > Define a helper function to handle the event click to select an event
    function handleEventClick(event: CalendarEvent, e: MouseEvent) {
        e.stopPropagation()
        onEventSelect(event)
    }

    // > Use the useMounted hook to check if the component is mounted
    const isMounted = useMounted()

    // > Use the useEventVisibility hook to get the contentRef and getVisibleEventCount
    const { contentRef, getVisibleEventCount } = useEventVisibility({ eventHeight: EVENT_HEIGHT, eventGap: EVENT_GAP })

    return (
        <Fragment>
            <div className="border-border/70 grid grid-cols-7 border-b">
                {weekdays.map((day) => <div key={day} className="text-muted-foreground/70 py-2 text-center text-sm">{day}</div>)}
            </div>
            <div className="grid flex-1 auto-rows-fr">
                {weeks.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className="grid grid-cols-7 [&:last-child>*]:border-b-0">
                        {week.map((day, dayIndex) => {
                            const isCurrentMonth = isSameMonth(day, currentDate)
                            const dayEvents = getEventsForDay(events, day)
                            const spanningEvents = getSpanningEventsForDay(events, day)
                            const allDayEvents = [...spanningEvents, ...dayEvents]
                            const allEvents = getAllEventsForDay(events, day)
                            const visibleCount = isMounted ? getVisibleEventCount(allDayEvents.length) : undefined
                            const hasMore = visibleCount !== undefined && allDayEvents.length > visibleCount
                            const remainingCount = hasMore ? allDayEvents.length - visibleCount : 0

                            return (
                                <div key={day.toString()} className="group border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70 border-r border-b last:border-r-0" data-today={isToday(day) || undefined} data-outside-cell={!isCurrentMonth || undefined}>
                                    <DroppableCell id={`month-cell-${day.toISOString()}`} date={day} onClick={() => { const startTime = new Date(day); startTime.setHours(9, 0, 0); onEventCreate(startTime); }}>
                                        <div className="group-data-today:bg-primary group-data-today:text-primary-foreground mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm">{format(day, "d")}</div>
                                        <div ref={weekIndex === 0 && dayIndex === 0 ? contentRef : null} className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]">
                                            {sortEvents(allDayEvents).map((event, index) => {
                                                const isFirstDay = isSameDay(day, new Date(event.start))
                                                const isLastDay = isSameDay(day, new Date(event.end))
                                                const isHidden = isMounted && visibleCount && index >= visibleCount

                                                if (!visibleCount) {
                                                    return null
                                                }

                                                if (isFirstDay) {
                                                    return (
                                                        <div key={event.id} className="aria-hidden:hidden" aria-hidden={isHidden ? "true" : undefined}>
                                                            <DraggableEvent event={event} currentView="month" onClick={(e) => handleEventClick(event, e)} isFirstDay={isFirstDay} isLastDay={isLastDay} />
                                                        </div>
                                                    )
                                                }

                                                if (!isFirstDay) {
                                                    return (
                                                        <div key={`spanning-${event.id}-${day.toISOString().slice(0, 10)}`} className="aria-hidden:hidden" aria-hidden={isHidden ? "true" : undefined}>
                                                            <EventItem onClick={(e) => handleEventClick(event, e)} event={event} currentView="month" isFirstDay={isFirstDay} isLastDay={isLastDay}>
                                                                <div className="invisible" aria-hidden={true}>
                                                                    {!event.allDay && <span>{formatTimeWithOptionalMinutes(event.start)}</span>}
                                                                    {event.title && <span className="truncate">{event.title}</span>}
                                                                </div>
                                                            </EventItem>
                                                        </div>
                                                    )
                                                }
                                            })}

                                            {/* Additional events in a popover */}
                                            {hasMore && <HasMoreEventsPopover EventHeight={EVENT_HEIGHT} allEvents={allEvents} day={day} remainingCount={remainingCount} handleEventClick={handleEventClick} />}
                                        </div>
                                    </DroppableCell>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </Fragment>
    )
}


// HasMoreEventsPopover
function HasMoreEventsPopover({ EventHeight, allEvents, day, remainingCount, handleEventClick }: { EventHeight: number, allEvents: CalendarEvent[], day: Date, remainingCount: number, handleEventClick: (event: CalendarEvent, e: React.MouseEvent) => void }) {
    // > Use the useMemo hook to create a style object for the popover content
    const style = useMemo(() => ({ "--event-height": `${EventHeight}px` } as CSSProperties), [EventHeight])

    // > Return the JSX for the popover component
    return (
        <Popover modal={true}>
            {/* Trigger to open the popover */}
            <PopoverTrigger asChild={true}>
                <button onClick={(e) => e.stopPropagation()} className="focus-visible:border-ring focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 mt-[var(--event-gap)] flex h-[var(--event-height)] w-full items-center overflow-hidden px-1 text-left text-[10px] backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] sm:px-2 sm:text-xs">
                    <span>+ {remainingCount}{" "}
                        <span className="max-sm:sr-only">more</span>
                    </span>
                </button>
            </PopoverTrigger>

            {/* Content of the popover that lists all events for the current day */}
            <PopoverContent align="center" className="max-w-52 p-3" style={style}>
                <div className="space-y-2">
                    <div className="text-sm font-medium">{
                        format(day, "EEE d")}
                    </div>
                    <div className="space-y-1">
                        {sortEvents(allEvents).map((event) => {
                            return <EventItem key={event.id} currentView="month" onClick={(e) => handleEventClick(event, e)} event={event} isFirstDay={isSameDay(day, new Date(event.start))} isLastDay={isSameDay(day, new Date(event.end))} />
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
