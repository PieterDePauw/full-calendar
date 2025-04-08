// CalendarView type
export type CalendarView = "month" | "week" | "day" | "agenda"

// EventColor type
export type EventColor = "sky" | "amber" | "violet" | "rose" | "emerald" | "orange" | "red" | "green" | "blue" | "purple" | "pink" | "yellow" | "gray" | "slate" | "zinc" | "neutral" | "stone"

// CalendarEvent interface
export interface CalendarEvent {
    id: string
    title: string
    description?: string
    start: Date
    end: Date
    allDay?: boolean
    color?: EventColor
    location?: string
}

// PositionedEvent interface
export interface PositionedEvent {
    event: CalendarEvent
    top: number
    height: number
    left: number
    width: number
    zIndex: number
}

// DragHandlePositionType interface
export interface DragHandlePositionType {
    x?: number
    y?: number
    data?: { isFirstDay?: boolean; isLastDay?: boolean }
}
