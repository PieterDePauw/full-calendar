"use client"

// Import modules
import { useState, useEffect } from "react"

// Define the MOBILE_BREAKPOINT constant
const MOBILE_BREAKPOINT = 768

// Define the useIsMobile hook
export function useIsMobile() {
	// > Use the `useState` hook to store the mobile state
	const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

	// > Use the `useEffect` hook to set the mobile state based on the window
	useEffect(() => {
		// Define the media query list
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
		// Define the onChange function to update the mobile state
		const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
		// > Add the change event listener
		mql.addEventListener("change", onChange)
		// >> Set the initial mobile state based on the window width
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
		// >> Return the cleanup function to remove the event listener
		return () => mql.removeEventListener("change", onChange)
	}, [])

	// > Return the mobile state as a boolean
	return !!isMobile
}
