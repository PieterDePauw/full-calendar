// Calendar view exports
export { AgendaView } from "./views/agenda-view"
export { DayView } from "./views/day-view"
export { MonthView } from "./views/month-view"
export { WeekView } from "./views/week-view"

// Sub-component exports@
export { CalendarDndProvider, useCalendarDnd } from "./dnd/calendar-dnd-context"
export { DraggableEvent } from "./dnd/draggable-event"
export { DroppableCell } from "./dnd/droppable-cell"
export { EventDialog } from "./events/event-dialog"
export { EventItem } from "./events/event-item"
export { EventsPopup } from "./events/events-popup"
export { FullCalendar } from "./events/full-calendar"

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

// Type exports
export type { CalendarEvent, PositionedEvent, CalendarView, EventColor, DragHandlePositionType, JSONValue } from "@/lib/types"
