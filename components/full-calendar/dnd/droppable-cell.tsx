"use client"

// Import modules
import { useDroppable } from "@dnd-kit/core"
import { useCalendarDnd } from "@/components/full-calendar"
import { cn } from "@/lib/utils"

// Droppable cell component
export function DroppableCell({ id, date, time, children, className, onClick }: { id: string; date: Date; time?: number; children?: React.ReactNode; className?: string; onClick?: () => void }) {
    // > Get the active event from the useCalendarDnd hook
    const { activeEvent } = useCalendarDnd()
    // > Use the useDroppable hook to get the setNodeRef and isOver functions
    const { setNodeRef, isOver } = useDroppable({ id, data: { date, time } })
    // > Format time for display in tooltip (only for debugging)
    const formattedTime = time !== undefined ? `${Math.floor(time)}:${Math.round((time - Math.floor(time)) * 60).toString().padStart(2, "0")}` : null
    // > Return the droppable cell component
    return (
        <div ref={setNodeRef} onClick={onClick} className={cn("data-dragging:bg-accent flex h-full flex-col overflow-hidden px-0.5 py-1 sm:px-1", className)} title={formattedTime ? `${formattedTime}` : undefined} data-dragging={(isOver && activeEvent) ? true : undefined}>
            {children}
        </div>
    )
}
