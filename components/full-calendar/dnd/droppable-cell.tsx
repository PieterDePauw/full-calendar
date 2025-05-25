"use client"

// Import modules
import { useDroppable } from "@dnd-kit/core"
import { useCalendarDnd } from "@/components/full-calendar"
import { cn } from "@/lib/utils"

// DroppableCell component
export function DroppableCell({ 
    id, 
    date, 
    time, 
    children, 
    className, 
    onClick,
    isAllDayArea = false 
}: { 
    id: string
    date: Date
    time?: number
    children?: React.ReactNode
    className?: string
    onClick?: () => void
    isAllDayArea?: boolean 
}) {
    const { activeEvent } = useCalendarDnd()
    const { setNodeRef, isOver } = useDroppable({ 
        id: id, 
        data: { date, time, isAllDayArea } 
    })

    return (
        <div 
            ref={setNodeRef} 
            onClick={onClick} 
            className={cn(
                "data-dragging:bg-accent flex h-full flex-col overflow-hidden px-0.5 py-1 sm:px-1",
                className
            )} 
            data-dragging={(isOver && activeEvent) ? true : undefined}
        >
            {children}
        </div>
    )
}