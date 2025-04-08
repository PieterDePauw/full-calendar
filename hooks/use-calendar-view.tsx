"use client"

// Import modules
import { create } from "zustand"
import { DEFAULT_VIEW } from "@/lib/constants";
import { type CalendarView } from "@/lib/types"


/**
 * Manages the current calendar view state with Zustand.
 * You could expand this store to hold more shared calendar state if needed.
 */
export const useCalendarView = create<{ currentView: CalendarView; setCurrentView: (view: CalendarView) => void }>(
    (set) => ({
        // Define the initial state of the calendar view
        currentView: DEFAULT_VIEW,
        // Define a function to set the current view
        setCurrentView: (view) => set({ currentView: view }),
    }))
