// Import modules
import { format, getHours, getMinutes } from "date-fns";
import { USE_12_HOUR_CLOCK_NOTATION } from "@/lib/constants"

// Define a helper function to format the time for the input field
export function formatTimeForInput(date: Date): string {
  // > Get the hours from the date object and format them to 2 digits
  const hours = String(date.getHours()).padStart(2, "0")
  // > Get the minutes from the date object, round them to the nearest 15 minutes, and format them to 2 digits
  const minutes = String(Math.floor(date.getMinutes() / 15) * 15).padStart(2, "0")
  // > Return the formatted time string
  return `${hours}:${minutes}`
}

// Define a helper function to format the time with optional minutes using custom formatting
// 'h' - hours (1-12)
// 'a' - am/pm
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
export function formatTimeWithOptionalMinutes(date: Date) {
  return format(date, getMinutes(date) === 0 ? (USE_12_HOUR_CLOCK_NOTATION ? "ha" : "H:mm") : (USE_12_HOUR_CLOCK_NOTATION ? "h:mma" : "H:mm")).toLowerCase()
}

// Define a helper function to format the date for the toast notification
export function formatForNotification(date: Date) {
  return format(new Date(date), "MMM d, yyyy")
}

// Define a helper function to format the time for the time labels
export function formatTimeLabel(hour: Date) {
  return format(hour, USE_12_HOUR_CLOCK_NOTATION ? "h a" : "HH:mm")
}

// Define a helper function to compare two dates and check if they are the same
export function compareDateTime(dateA: Date, dateB: Date): boolean {
  // > Check if the year of both dates is the same
  const isSameYear = dateA.getFullYear() === dateB.getFullYear()
  // > Check if the month of both dates are the same
  const isSameMonth = dateA.getMonth() === dateB.getMonth()
  // > Check if the day of both dates are the same
  const isSameDay = dateA.getDate() === dateB.getDate()
  // > Check if the hours of both dates are the same
  const isSameHour = dateA.getHours() === dateB.getHours()
  // > Check if the minutes of both dates are the same
  const isSameMinutes = dateA.getMinutes() === dateB.getMinutes()
  // > Return true if any of the above checks are not true
  return !isSameYear || !isSameMonth || !isSameDay || !isSameHour || !isSameMinutes
}

// Define a helper function to get the decimal hour from a specified date/time
export function getDecimalHour(date: Date): number {
  return getHours(date) + getMinutes(date) / 60;
}
