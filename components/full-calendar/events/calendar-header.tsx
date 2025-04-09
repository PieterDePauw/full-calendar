// Import modules
import { RiCalendarCheckLine } from "@remixicon/react"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { capitalize, getFirstLetter, useCalendarNavigation, useCalendarView, useCalendarViewTitle } from "@/components/full-calendar"

export function CalendarHeader({ className, onEventCreateClick }: { className: string | undefined, onEventCreateClick: () => void }) {
    // > Use the useCalendarView hook to manage the current view
    const { currentView, setCurrentView } = useCalendarView()

    // > Use the useCalendarNavigation hook to manage the current date and navigation
    const { currentDate, handleGoToNext, handleGoToPrevious, handleGoToToday } = useCalendarNavigation()

    // > Use the useCalendarViewTitle hook to manage the view title
    const viewTitle = useCalendarViewTitle({ currentDate })

    return (
        <div className={cn("flex items-center justify-between p-2 sm:p-4", className)}>
            {/* Calendar header with buttons and view selector */}
            <div className="flex items-center gap-1 sm:gap-4">
                <Button variant="outline" className="aspect-square max-[479px]:p-0!" onClick={handleGoToToday}>
                    <RiCalendarCheckLine className="min-[480px]:hidden" size={16} aria-hidden="true" />
                    <span className="max-[479px]:sr-only">Today</span>
                </Button>
                <div className="flex items-center sm:gap-2">
                    <Button variant="ghost" size="icon" onClick={handleGoToPrevious} aria-label="Previous">
                        <ChevronLeftIcon size={16} aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleGoToNext} aria-label="Next">
                        <ChevronRightIcon size={16} aria-hidden="true" />
                    </Button>
                </div>
                <h2 className="text-sm font-semibold sm:text-lg md:text-xl">
                    {viewTitle}
                </h2>
            </div>

            {/* View selector and new event button */}
            <div className="flex items-center gap-2">
                {/* View selector dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild={true}>
                        <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                            <span>
                                <span className="min-[480px]:hidden" aria-hidden="true">
                                    {getFirstLetter(currentView)}
                                </span>
                                <span className="max-[479px]:sr-only">
                                    {capitalize(currentView)}
                                </span>
                            </span>
                            <ChevronDownIcon className="-me-1 opacity-60" size={16} aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-32">
                        <DropdownMenuItem onClick={() => setCurrentView("month")}>
                            <span>Month</span>
                            <DropdownMenuShortcut>M</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentView("week")}>
                            <span>Week</span>
                            <DropdownMenuShortcut>W</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentView("day")}>
                            <span>Day</span>
                            <DropdownMenuShortcut>D</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentView("agenda")}>
                            <span>Agenda</span>
                            <DropdownMenuShortcut>A</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* New event button */}
                <Button className="aspect-square max-[479px]:p-0!" onClick={onEventCreateClick}>
                    <PlusIcon className="opacity-60 sm:-ms-1" size={16} />
                    <span className="max-sm:sr-only">New event</span>
                </Button>
            </div>
        </div>
    )
}
