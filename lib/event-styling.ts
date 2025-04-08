// event-styling.ts
import { type ClassValue } from "clsx";
import { type CalendarView, type EventColor } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Returns Tailwind utility classes for the provided `EventColor`.
 */
export function getEventColorClasses(color: EventColor | string = "sky"): string {
  switch (color) {
    case "sky":
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
    case "amber":
      return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8";
    case "violet":
      return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8";
    case "rose":
      return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8";
    case "emerald":
      return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8";
    case "orange":
      return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8";
    default:
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
  }
}

/**
 * Generates border-radius classes based on whether the event is first, last, or single-day.
 */
export function getBorderRadiusClasses(isFirstDay: boolean, isLastDay: boolean): string {
  if (isFirstDay && isLastDay) return "rounded-l rounded-r";
  if (isFirstDay) return "rounded-l rounded-r-none";
  if (isLastDay) return "rounded-r rounded-l-none";
  return "rounded-none";
}

/**
 * Returns a combined wrapper class for an event, including color and rounding.
 */
export function getEventWrapperClasses({ isFirstDay, isLastDay, eventColor, className }: { isFirstDay: boolean; isLastDay: boolean; eventColor?: EventColor; className?: ClassValue }): string {
  return cn("focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full overflow-hidden px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2", getEventColorClasses(eventColor), getBorderRadiusClasses(isFirstDay, isLastDay), className);
}

/**
 * Returns classes for Day/Week events, adjusting layout for short events.
 */
export function getDayWeekEventClasses({ durationInMinutes, view, className }: { durationInMinutes: number; view: CalendarView; className: ClassValue }): string {
  return cn("py-1", durationInMinutes < 45 ? "items-center" : "flex-col", view === "week" ? "text-[10px] sm:text-xs" : "text-xs", className);
}

/**
 * Returns classes for Month-view events.
 */
export function getMonthEventClasses({ className }: { className: ClassValue }): string {
  return cn("mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs", className);
}

/**
 * Returns classes for Agenda-view events.
 */
export function getAgendaEventClasses({ eventColor, className }: { eventColor?: EventColor; className?: ClassValue }): string {
  return cn("focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded p-2 text-left transition outline-none focus-visible:ring-[3px] data-past-event:line-through data-past-event:opacity-90", getEventColorClasses(eventColor), className);
}

/**
 * Returns classes to indicate 15-minute intervals (quarters) in a Day/Week cell.
 */
export function getDroppableCellClasses(quarter: number): string {
  return cn("absolute h-[calc(var(--week-cells-height)/4)] w-full", quarter === 0 && "top-0", quarter === 1 && "top-[calc(var(--week-cells-height)/4)]", quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]", quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]");
}
