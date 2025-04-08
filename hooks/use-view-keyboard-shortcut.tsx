// Import modules
import { useEffect } from "react"
import { type CalendarView } from "@/lib/types"

// Define a custom hook to handle keyboard shortcuts for switching calendar views
export function useViewKeyboardShortcut({ isEventDialogOpen, setCurrentView }: { isEventDialogOpen: boolean, setCurrentView: React.Dispatch<React.SetStateAction<CalendarView>> }) {
    // > Use the useEffect hook to listen for keydown events to switch between calendar views
    useEffect(() => {
        // >> Define the handleKeyDown function
        function handleKeyDown(e: KeyboardEvent) {
            // >>> If user is typing in an input, a textarea or a contentEditable element or if the event dialog is open, return early
            if (isEventDialogOpen || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable)) { return }
            // >>> Get the key pressed
            const keyPressed = e.key.toLowerCase()
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
