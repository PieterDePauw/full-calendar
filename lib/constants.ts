// Import modules
import { type Day } from "date-fns"
import { type CalendarView } from "@/lib/types"

// Height of calendar events in pixels - used in month, week and day views
export const EVENT_HEIGHT: number = 24

// Vertical gap between events in pixels - controls spacing in month view
export const EVENT_GAP: number = 4

// Height of hour cells in week and day views - controls the scale of time display
export const WEEK_CELLS_HEIGHT: number = 64

// Number of days to show in the agenda view
export const NUMBER_OF_DAYS_TO_DISPLAY_IN_AGENDA: number = 30

// Number of days in a week
export const NUMBER_OF_DAYS_PER_WEEK: number = 7

// Starting day of the week (0 = Sunday, 1 = Monday, etc.)
export const WEEK_STARTS_ON: Day = 1

// Default view for the calendar
export const DEFAULT_VIEW: CalendarView = "month"

// Date/time notation format
export const USE_12_HOUR_CLOCK_NOTATION: boolean = false
