// Calendar view exports
export { AgendaView } from "@/components/full-calendar/views/agenda-view"
export { DayView } from "@/components/full-calendar/views/day-view"
export { MonthView } from "@/components/full-calendar/views/month-view"
export { WeekView } from "@/components/full-calendar/views/week-view"

// Sub-component exports@
export { CalendarDndProvider, useCalendarDnd } from "@/components/full-calendar/dnd/calendar-dnd-context"
export { DraggableEvent } from "@/components/full-calendar/dnd/draggable-event"
export { DroppableCell } from "@/components/full-calendar/dnd/droppable-cell"
export { EventDialog } from "@/components/full-calendar/events/event-dialog"
export { EventItem } from "@/components/full-calendar/events/event-item"
export { EventsPopup } from "@/components/full-calendar/events/events-popup"
export { FullCalendar } from "@/components/full-calendar/events/full-calendar"
export { CalendarHeader } from "@/components/full-calendar/events/calendar-header"
export { CurrentTimeIndicator } from "@/components/full-calendar/events/current-time-indicator"

// Constants and utility exports
export * from "@/lib/constants"
export * from "@/lib/event-styling"
export * from "@/lib/event-queries"
export * from "@/lib/event-positioning"
export * from "@/lib/time-helpers"
export * from "@/lib/capitalization"

// Hook exports
export * from "@/hooks/use-current-time-indicator"
export * from "@/hooks/use-event-visibility"
export * from "@/hooks/use-view-keyboard-shortcut"
export * from "@/hooks/use-calendar-navigation"
export * from "@/hooks/use-calendar-view-title"
export * from "@/hooks/use-calendar-view"
export * from "@/hooks/use-calendar-date"
export * from "@/hooks/use-calendar-event-management"

// Type exports
export type { CalendarEvent, PositionedEvent, CalendarView, EventColor, DragHandlePositionType, JSONValue } from "@/lib/types"
