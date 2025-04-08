// Import modules
import { useEffect } from "react"
import { useCalendarView } from "@/hooks/use-calendar-view"
import { useCalendarEventManagement } from "@/hooks/use-calendar-event-management"

// Define a custom hook to handle keyboard shortcuts for switching calendar views
export function useViewKeyboardShortcut() {
    // > Use the useCalendarView hook to get the current view and set the current view
    const { setCurrentView } = useCalendarView()

    // > Use the useCalendarEventManagement hook to manage the state of the event dialog
    const { isEventDialogOpen } = useCalendarEventManagement()

    // > Use the useEffect hook to listen for keydown events to switch between calendar views
    useEffect(() => {
        // >> Define the handleKeyDown function
        function handleKeyDown(event: KeyboardEvent) {
            // >>> If user is typing in an input, a textarea or a contentEditable element or if the event dialog is open, return early
            if (isEventDialogOpen || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLElement && event.target.isContentEditable)) { return }
            // >>> Get the key pressed
            const keyPressed = event.key.toLowerCase()
            // >>> Switch view based on key pressed
            switch (keyPressed) {
                case "m":
                    setCurrentView("month")
                    break
                case "w":
                    setCurrentView("week")
                    break
                case "d":
                    setCurrentView("day")
                    break
                case "a":
                    setCurrentView("agenda")
                    break
                default:
                    break
            }
        }
        // >> Add the handleKeyDown to the event listener for keydown
        window.addEventListener("keydown", handleKeyDown)
        // >> Return a function to clean up the event listener
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isEventDialogOpen])
}
