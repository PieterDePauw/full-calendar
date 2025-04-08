// Import modules
import { type Day } from "date-fns"
import { type CalendarView } from "@/lib/types"

// Height of calendar events in pixels - used in month, week and day views
export const EventHeight: number = 24

// Vertical gap between events in pixels - controls spacing in month view
export const EventGap: number = 4

// Height of hour cells in week and day views - controls the scale of time display
export const WeekCellsHeight: number = 64

// Number of days to show in the agenda view
export const AgendaDaysToShow: number = 30

// Number of days in a week
export const DaysPerWeek: number = 7

// Starting day of the week (0 = Sunday, 1 = Monday, etc.)
export const WeekStartsOn: Day = 1

// Default view for the calendar
export const DEFAULT_VIEW: CalendarView = "month"
