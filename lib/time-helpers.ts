// Import modules
import { format, getHours, getMinutes } from "date-fns";

// Define a helper function to format the time for the input field
export function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = (Math.floor(date.getMinutes() / 15) * 15).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Define a helper function to format the time with optional minutes using custom formatting
export function formatTimeWithOptionalMinutes(date: Date) {
  return format(date, getMinutes(date) === 0 ? "ha" : "h:mma").toLowerCase();
}

// Define a helper function to add hours to a specified date
export function addHoursToDate(date: Date, hours: number): Date {
  if (!Number.isInteger(hours)) throw new Error("To add hours to the date, the value for hours must be an integer");
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

// Define a helper function to compare two dates and check if they are the same
export function compareDateTime(dateA: Date, dateB: Date): boolean {
  const isSameYear = dateA.getFullYear() === dateB.getFullYear();
  const isSameMonth = dateA.getMonth() === dateB.getMonth();
  const isSameDay = dateA.getDate() === dateB.getDate();
  const isSameHour = dateA.getHours() === dateB.getHours();
  const isSameMinutes = dateA.getMinutes() === dateB.getMinutes();
  return !isSameYear || !isSameMonth || !isSameDay || !isSameHour || !isSameMinutes;
}

// Define a helper function to get the decimal hour from a specified date/time
export function getDecimalHour(date: Date): number {
  return getHours(date) + getMinutes(date) / 60;
}
