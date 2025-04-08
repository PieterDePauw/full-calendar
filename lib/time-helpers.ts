// Import modules
import { format, getHours, getMinutes } from "date-fns";

// Define a helper function to format the time for the input field
export function formatTimeForInput(date: Date): string {
  // > Get the hours from the date object and format them to 2 digits
  const hours = (date.getHours()).toString().padStart(2, "0")
  // > Get the minutes from the date object, round them to the nearest 15 minutes, and format them to 2 digits
  const minutes = (Math.floor(date.getMinutes() / 15) * 15).toString().padStart(2, "0")
  // > Return the formatted time string
  return `${hours}:${minutes}`
}

// Define a helper function to format the time with optional minutes using custom formatting
// 'h' - hours (1-12)
// 'a' - am/pm
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
export function formatTimeWithOptionalMinutes(date: Date) {
  return format(date, getMinutes(date) === 0 ? "ha" : "h:mma").toLowerCase()
}

// Define a helper function to add hours to a specified date
export function addHoursToDate(date: Date, hours: number): Date {
  // > If the hours value is not an integer, throw an error
  if (!Number.isInteger(hours)) { throw new Error("To add hours to the date, the value for hours must be an integer"); }
  // > If the hours value is an integer, create a new date object
  const result = new Date(date)
  // > Add the specified number of hours to the date
  result.setHours(result.getHours() + hours)
  // > Return the new date object
  return result
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
