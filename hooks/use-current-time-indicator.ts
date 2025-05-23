"use client"

// Import modules
import { useEffect, useState } from "react"
import { endOfWeek, isSameDay, isWithinInterval, startOfWeek } from "date-fns"
import { WEEK_STARTS_ON } from "@/lib/constants"

// useCurrentTimeIndicator hook: custom hook to calculate the current time position
export function useCurrentTimeIndicator(currentDate: Date, currentView: "day" | "week") {
    // > Use the useState hook to keep track of the current time position
    const [currentTimePosition, setCurrentTimePosition] = useState<number>(0)

    // > Use the useState hook to keep track of the current time visibility
    const [currentTimeVisible, setCurrentTimeVisible] = useState<boolean>(false)

    // > Use the useEffect hook to calculate the current time position
    useEffect(() => {
        // >> Calculate the current time position
        function calculateTimePosition() {
            // >>> Get the current date and time in hours and minutes
            const now = new Date()
            const hours = now.getHours()
            const minutes = now.getMinutes()

            // >>> Calculate the total minutes from the start of the day
            const totalMinutes = hours * 60 + minutes

            // >>> Define the start of the day as a number of minutes
            const dayStartMinutes = 0 // 12am

            // >>> Define the end of the day as a number of minutes
            const dayEndMinutes = 24 * 60 // 12am next day

            // >>> Calculate position as percentage of day
            const position = ((totalMinutes - dayStartMinutes) / (dayEndMinutes - dayStartMinutes)) * 100

            // >>> Assign a variable to check if the current time is visible
            let isCurrentTimeVisible = false

            // >>> If the view is "day", check if the current time is on the same day to determine visibility
            if (currentView === "day") {
                isCurrentTimeVisible = isSameDay(now, currentDate)
            }

            // >>> If the view is "week", check if the current time is within the week to determine visibility
            if (currentView === "week") {
                isCurrentTimeVisible = isWithinInterval(now, { start: startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), end: endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }) })
            }

            // >>> Update the current time position
            setCurrentTimePosition(position)

            // >>> Update the current time visibility
            setCurrentTimeVisible(isCurrentTimeVisible)
        }

        // >> Calculate the initial time position when the component mounts
        calculateTimePosition()

        // >> Update every minute (60000 ms) to keep the current time indicator up to date
        const intervalId = setInterval(calculateTimePosition, 1 * 60 * 1000)

        // >> Return a cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId)
    }, [currentDate, currentView])

    // > Return the current time position and time visibility status
    return { currentTimePosition, currentTimeVisible }
}
