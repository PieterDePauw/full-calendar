"use client"

// Import modules
import { create } from "zustand"
import { DEFAULT_VIEW } from "@/lib/constants";
import { type CalendarView } from "@/lib/types"

// Create a global store with zustand to store the calendar view
export const useCalendarView = create<{ currentView: CalendarView; setCurrentView: (view: CalendarView) => void }>((set) => ({
    // Define the initial state of the calendar view
    currentView: DEFAULT_VIEW,
    // Define a function to set the current view
    setCurrentView: (currentView) => set({ currentView })
}))

// Create a global store with zustand to store the calendar date
export const useCalendarDate = create<{ currentDate: Date; setCurrentDate: (date: Date) => void }>((set) => ({
    // > Define the initial state of the calendar date
    currentDate: new Date(),
    // > Define a function to set the current date
    setCurrentDate: (currentDate) => set({ currentDate: currentDate })
}))
