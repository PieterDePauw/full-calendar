"use client"

// Import modules
import { useLayoutEffect, useMemo, useRef, useState } from "react"

// useEventVisibility hook: custom hook to calculate the number of visible events based on the container height using a ResizeObserver for efficient updates
export function useEventVisibility({ eventHeight, eventGap }: { eventHeight: number, eventGap: number }): { contentRef: React.RefObject<HTMLDivElement | null>, contentHeight: number | null, getVisibleEventCount: (totalEvents: number) => number } {
    // > Use the useRef hook to keep a reference to the content container
    const contentRef = useRef<HTMLDivElement>(null)

    // > Use the useRef hook to keep a reference to the ResizeObserver
    const observerRef = useRef<ResizeObserver | null>(null)

    // > Use the useState hook to keep track of the content height
    const [contentHeight, setContentHeight] = useState<number | null>(null)

    // > Use the useLayoutEffect hook to measure the content height in a synchronous measurement before paint
    useLayoutEffect(() => {
        // >> If the content container is not available, return early
        if (!contentRef.current) return
        // >> If the content container is available, update the state for the content height to the current height of the content
        function updateHeight() { if (contentRef.current) setContentHeight(contentRef.current.clientHeight) }
        // >> Initial measurement (synchronous)
        updateHeight()
        // >> If it's not yet initialized, use the updateHeight callback to initialize a ResizeObserver to track changes to the height of the content container
        if (!observerRef.current) { observerRef.current = new ResizeObserver(() => { updateHeight() }) }
        // >> Observe the content container for changes in height using the ResizeObserver
        observerRef.current.observe(contentRef.current)
        // >> Clean up function to disconnect observer when component unmounts
        return () => { if (observerRef.current) { observerRef.current.disconnect() } }
    }, [])

    // > Helper function to calculate visible events for a cell based on the total number of events that can fit in the container based on the content height
    const getVisibleEventCount = useMemo(() => {
        // >> Calculate the visible event count based on the total number of events
        return (totalEvents: number): number => {
            // >>> If the content height is not available, show all events
            if (!contentHeight) return totalEvents
            // >>> Calculate the maximum number of events that can fit within the height of the content container
            const maxEvents = Math.floor(contentHeight / (eventHeight + eventGap))
            // >>> If all events fit, show them all
            if (totalEvents <= maxEvents) { return totalEvents }
            // >>> Otherwise, show all events except the last one to allow for overflow or show no events if there is no space
            return maxEvents > 0 ? maxEvents - 1 : 0
        }
    }, [contentHeight, eventHeight, eventGap])

    // > Return the content reference, content height, and the function to calculate the number of visible events, using a type assertion to the EventVisibilityResult type
    return { contentRef, contentHeight, getVisibleEventCount }
}
