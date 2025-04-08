"use client"

// Import modules
import { create } from "zustand"

// Create a global store with zustand to store the calendar date
export const useCalendarDate = create<{ currentDate: Date; setCurrentDate: (date: Date) => void }>((set) => ({
    // > Define the initial state of the calendar date
    currentDate: new Date(),
    // > Define a function to set the current date
    setCurrentDate: (currentDate) => set({ currentDate: currentDate })
}))
