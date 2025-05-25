"use client"

// Import modules
import React, { useMemo } from "react"
import { addHours, areIntervalsOverlapping, differenceInMinutes, eachDayOfInterval, eachHourOfInterval, endOfWeek, format, getHours, getMinutes, isBefore, isSameDay, isToday, startOfDay, startOfWeek } from "date-fns"
import { DraggableEvent, DroppableCell, EventItem, checkIfMultiDayEvent, formatTimeLabel, CurrentTimeIndicator, useCalendarDate, getDroppableCellClasses, type CalendarEvent, type PositionedEvent, useCurrentTimeIndicator, WEEK_STARTS_ON, WEEK_CELLS_HEIGHT } from "@/components/full-calendar"
import { cn } from "@/lib/utils"

// WeekView component
export function WeekView({ events, onEventSelect, onEventCreate }: { events: CalendarEvent[]; onEventSelect: (event: CalendarEvent) => void; onEventCreate: (startTime: Date) => void }) {
    const { currentDate } = useCalendarDate()
    const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), end: endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }) }), [currentDate])
    const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), [currentDate])
    const hours = useMemo(() => eachHourOfInterval({ start: startOfDay(currentDate), end: addHours(startOfDay(currentDate), 23) }), [currentDate])
    const allDayEvents = useMemo(() => events.filter((event) => event.allDay || checkIfMultiDayEvent(event)).filter((event) => days.some((day) => isSameDay(day, new Date(event.start)) || isSameDay(day, new Date(event.end)) || (day > new Date(event.start) && day < new Date(event.end)))), [events, days])
    const processedDayEvents = useMemo(() => {
        const result = days.map((day) => {
            const dayEvents = events.filter((event) => {
                if (event.allDay || checkIfMultiDayEvent(event)) return false
                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)
                return (isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (eventStart < day && eventEnd > day))
            })

            const sortedEvents = [...dayEvents].sort((a, b) => {
                const aStart = new Date(a.start)
                const bStart = new Date(b.start)
                const aEnd = new Date(a.end)
                const bEnd = new Date(b.end)
                if (aStart < bStart) return -1
                if (aStart > bStart) return 1
                const aDuration = differenceInMinutes(aEnd, aStart)
                const bDuration = differenceInMinutes(bEnd, bStart)
                return bDuration - aDuration
            })

            const positionedEvents: PositionedEvent[] = []
            const dayStart = startOfDay(day)
            const columns: { event: CalendarEvent; end: Date }[][] = []

            sortedEvents.forEach((event) => {
                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)
                const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart
                const adjustedEnd = isSameDay(day, eventEnd) ? eventEnd : addHours(dayStart, 24)
                const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60
                const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60
                const top = startHour * WEEK_CELLS_HEIGHT
                const height = (endHour - startHour) * WEEK_CELLS_HEIGHT

                let columnIndex = 0
                let placed = false

                while (!placed) {
                    if (!columns[columnIndex]) {
                        columns[columnIndex] = []
                        placed = true
                    } else {
                        const overlaps = columns[columnIndex].some((col) => areIntervalsOverlapping({ start: adjustedStart, end: adjustedEnd }, { start: new Date(col.event.start), end: new Date(col.event.end) }))
                        if (!overlaps) {
                            placed = true
                        } else {
                            columnIndex++
                        }
                    }
                }

                columns[columnIndex].push({ event, end: adjustedEnd })

                const width = columnIndex === 0 ? 1 : Math.max(1 - (columnIndex * 0.1), 0.4)
                const left = columnIndex === 0 ? 0 : columnIndex * 0.1

                positionedEvents.push({ event: event, top: top, height: height, left: left, width: width, zIndex: 10 + columnIndex })
            })

            return positionedEvents
        })

        return result
    }, [days, events])

    function handleEventClick(event: CalendarEvent, e: React.MouseEvent) {
        e.stopPropagation()
        onEventSelect(event)
    }

    const hasAllDayEvents = useMemo(() => allDayEvents.length >= 1, [allDayEvents])
    const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "week")

    return (
        <div className="flex h-full flex-col">
            {days && <WeekViewHeader days={days} />}

            {hasAllDayEvents && (
                <div className="border-border/70 bg-muted/50 border-b">
                    <div className="grid grid-cols-8">
                        <div className="border-border/70 relative border-r">
                            <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                                All day
                            </span>
                        </div>
                        {days.map((day) => (
                            <DroppableCell 
                                key={day.toString()} 
                                id={`all-day-${day.toISOString()}`} 
                                date={day} 
                                isAllDayArea={true} 
                                className="border-border/70 relative border-r p-1 last:border-r-0" 
                                data-today={isToday(day) || undefined}
                            >
                                {allDayEvents
                                    .filter(event => isSameDay(day, new Date(event.start)) || (day > new Date(event.start) && day < new Date(event.end)) || isSameDay(day, new Date(event.end)))
                                    .map((event) => {
                                        const eventStart = new Date(event.start)
                                        const eventEnd = new Date(event.end)
                                        const isFirstVisibleDay = isSameDay(day, eventStart)
                                        const isLastVisibleDay = isSameDay(day, eventEnd)

                                        return (
                                            <DraggableEvent 
                                                key={`all-day-${event.id}`} 
                                                event={event} 
                                                currentView="week" 
                                                onClick={(e) => handleEventClick(event, e)} 
                                                isFirstDay={isFirstVisibleDay} 
                                                isLastDay={isLastVisibleDay} 
                                                isAllDay={true}
                                            >
                                                <div className={cn("truncate", !isFirstVisibleDay && "invisible")} aria-hidden={!isFirstVisibleDay}>
                                                    {event.title}
                                                </div>
                                            </DraggableEvent>
                                        )
                                    })
                                }
                            </DroppableCell>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid flex-1 grid-cols-8">
                <div className="border-border/70 border-r">
                    {hours.map((hour, index) => (
                        <div key={hour.toString()} className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0">
                            {index > 0 && <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">{formatTimeLabel(hour)}</span>}
                        </div>
                    ))}
                </div>

                {days.map((day, dayIndex) => (
                    <div key={day.toString()} className="border-border/70 relative border-r last:border-r-0" data-today={isToday(day) || undefined}>
                        {processedDayEvents[dayIndex].map((positionedEvent) => (
                            <div 
                                key={positionedEvent.event.id} 
                                className="absolute z-10 px-0.5" 
                                style={{ 
                                    top: `${positionedEvent.top}px`, 
                                    height: `${positionedEvent.height}px`, 
                                    left: `${positionedEvent.left * 100}%`, 
                                    width: `${positionedEvent.width * 100}%`, 
                                    zIndex: positionedEvent.zIndex 
                                }}
                            >
                                <div className="h-full w-full">
                                    <DraggableEvent 
                                        event={positionedEvent.event} 
                                        currentView="week" 
                                        onClick={(e) => handleEventClick(positionedEvent.event, e)} 
                                        showTime={true} 
                                        height={positionedEvent.height} 
                                    />
                                </div>
                            </div>
                        ))}

                        {currentTimeVisible && isToday(day) && <CurrentTimeIndicator currentTimePosition={currentTimePosition} />}

                        <div className="absolute inset-0 z-0">
                            {hours.map((hour) => (
                                <div key={hour.toString()} className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0">
                                    {[0, 1, 2, 3].map((quarter) => {
                                        const time = getHours(hour) + quarter * 0.25
                                        return (
                                            <DroppableCell 
                                                key={`${hour}-${quarter}`} 
                                                id={`week-cell-${day.toISOString()}-${time}`} 
                                                date={day} 
                                                time={time} 
                                                className={getDroppableCellClasses(quarter)} 
                                                onClick={() => {
                                                    const startTime = new Date(day)
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
                    </div>
                ))}
            </div>
        </div>
    )
}

function WeekViewHeader({ days }: { days: Date[] }) {
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