// Import modules
import { useState, useEffect } from "react"

// useMounted hook
export function useMounted() {
	// > Use the useState hook to create a "mounted" state
	const [mounted, setMounted] = useState(false)
	// > Use the useEffect hook to set the "mounted" state to true when the component is rendered (client-side)
	useEffect(() => setMounted(true), [])
	// > Return the "mounted" state
	return mounted
}
