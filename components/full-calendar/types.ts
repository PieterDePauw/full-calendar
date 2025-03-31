export type CalendarView = "month" | "week" | "day" | "agenda"

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

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange"

export interface DragHandlePositionType {
  x?: number
  y?: number
  data?: {
    isFirstDay?: boolean
    isLastDay?: boolean
  }
}
