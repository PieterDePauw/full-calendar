"use client"

// Import modules
import { useEffect } from "react"
import { type JSONValue } from "@/lib/types"

// Define the useLogError hook
export function useLogError(error: Error & { digest?: string }) {
	// > Use the useEffect hook to log the error to an error reporting service
	useEffect(() => {
		// >> Log the error to the console
		console.error(error)
		/* If you have an error reporting service, you can log the error to it here. */
	}, [error])
}

// Define the useLogDebug hook
export function useLogDebug(element: JSONValue, message = "EventDialog received element:") {
	// > Use the useEffect hook to log the element, whenever it changes, for debugging purposes
	useEffect(() => console.log(message, JSON.stringify(element, null, 2)), [element])
}
