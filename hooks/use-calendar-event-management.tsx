"use client"

// Import modules
import { create } from "zustand"
import { type CalendarEvent } from "@/lib/types"

// Define the store interface (i.e. shape of the state + actions)
interface CalendarEventStore {
    // State values
    isEventDialogOpen: boolean
    selectedEvent: CalendarEvent | null
    // State setters
    setIsEventDialogOpen: (open: boolean) => void
    setSelectedEvent: (event: CalendarEvent | null) => void
    // Actions
    handleResetSelectedEvent: () => void
    handleEventCreateClick: () => void
    handleDialogClose: () => void
}

// Create the global store with Zustand
export const useCalendarEventManagement = create<CalendarEventStore>((set, get) => ({
    // Initial state
    isEventDialogOpen: false,
    selectedEvent: null,

    // State setters
    setIsEventDialogOpen: (open) => set({ isEventDialogOpen: open }),
    setSelectedEvent: (event) => set({ selectedEvent: event }),

    // Actions (replicating the hook’s logic):
    handleResetSelectedEvent: () => set({ selectedEvent: null }),
    handleEventCreateClick: () => set({ selectedEvent: null, isEventDialogOpen: true }),
    handleDialogClose: () => set({ selectedEvent: null, isEventDialogOpen: false }),
}))
