// Import modules
import { type ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { type EventColor } from "@/lib/types";

/**
 * Returns Tailwind utility classes for the provided `EventColor`.
 */
export function getEventColorClasses(color: EventColor | string = "sky"): string {
  switch (color) {
    case "sky":
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 ...";
    case "amber":
      return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 ...";
    case "violet":
      return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 ...";
    case "rose":
      return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 ...";
    case "emerald":
      return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 ...";
    case "orange":
      return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 ...";
    default:
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 ...";
  }
}

/**
 * Figures out the appropriate border-radius classes based on event position
 * within multi-day sequences (first day, last day, etc.).
 */
export function getBorderRadiusClasses(isFirstDay: boolean, isLastDay: boolean): string {
  if (isFirstDay && isLastDay) return "rounded";
  if (isFirstDay) return "rounded-l rounded-r-none";
  if (isLastDay) return "rounded-r rounded-l-none";
  return "rounded-none";
}

/**
 * Combines style classes for an event’s wrapper, including colors and rounding.
 */
export function getEventWrapperClasses({
  isFirstDay,
  isLastDay,
  eventColor,
  className,
}: {
  isFirstDay: boolean;
  isLastDay: boolean;
  eventColor?: EventColor;
  className?: ClassValue;
}): string {
  return cn(
    "focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full ...",
    getEventColorClasses(eventColor),
    getBorderRadiusClasses(isFirstDay, isLastDay),
    className
  );
}

/**
 * Classes for day/week views. Adjust text size or layout based on short durations.
 */
export function getDayWeekEventClasses({
  durationInMinutes,
  view,
  className,
}: {
  durationInMinutes: number;
  view: string; // or CalendarView
  className: ClassValue;
}): string {
  return cn(
    "py-1",
    durationInMinutes < 45 ? "items-center" : "flex-col",
    view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
    className
  );
}

/**
 * Classes for the month view events.
 */
export function getMonthEventClasses({ className }: { className: ClassValue }) {
  return cn(
    "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
    className
  );
}

/**
 * Classes for the agenda view events.
 */
export function getAgendaEventClasses({
  eventColor,
  className,
}: {
  eventColor?: EventColor;
  className?: ClassValue;
}): string {
  return cn(
    "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded p-2 ...",
    getEventColorClasses(eventColor),
    className
  );
}

/**
 * Classes to show 15-minute intervals in a day/week cell
 * for drag-and-drop or highlighting.
 */
export function getDroppableCellClasses(quarter: number) {
  return cn(
    "absolute h-[calc(var(--week-cells-height)/4)] w-full",
    quarter === 0 && "top-0",
    quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
    quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
    quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]"
  );
}
