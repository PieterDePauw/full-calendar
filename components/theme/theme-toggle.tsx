"use client"

// Import modules
import { useId, useState } from "react"
import { RiMoonClearLine, RiSunLine } from "@remixicon/react"
import { useTheme } from "next-themes"

// ThemeToggle component
export default function ThemeToggle() {
    // > Use the useId hook to generate a unique ID for the input element
    const id = useId()

    // > Use the useTheme hook to get the current theme and setTheme function
    const { theme, setTheme } = useTheme()

    // > Use the useState hook to manage the system state
    const [system, setSystem] = useState(false)

    // > Define the smartToggle function to handle the theme toggle
    /* The smart toggle by @nrjdalal */
    function smartToggle() {
        // >> Determine if the system prefers dark mode
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches

        // >> If the current theme is system, ...
        if (theme === "system") {
            // > If the system prefers dark mode, set the theme to light, or vice versa
            setTheme(prefersDarkScheme ? "light" : "dark")
            // > Set the system state to false to indicate that the user has chosen a theme
            setSystem(false)
        }

        // >> If the current theme is not system, ...
        if (theme !== "system") {
            // >>> If the current theme is light and the system also prefers light mode, or if the current theme is dark and the system also prefers dark mode, ...
            if ((theme === "light" && !prefersDarkScheme) || (theme === "dark" && prefersDarkScheme)) {
                // > Set the theme to the opposite of the current theme (light to dark or dark to light)
                setTheme(theme === "light" ? "dark" : "light")
                // > Set the system state to false to indicate that the user has chosen a theme
                setSystem(false)
            }

            // If the current theme does not match the system preference, set the theme to system to follow the system preference
            setTheme("system")
            setSystem(true)

        }
    }

    // > Return the ThemeToggle component
    return (
        <div className="flex flex-col justify-center">
            <input type="checkbox" name="theme-toggle" id={id} className="peer sr-only" checked={system} onChange={smartToggle} aria-label="Toggle dark mode" />
            <label className="text-muted-foreground hover:text-foreground/80 peer-focus-visible:border-ring peer-focus-visible:ring-ring/50 relative inline-flex size-9 cursor-pointer items-center justify-center rounded transition-[color,box-shadow] outline-none peer-focus-visible:ring-[3px]" htmlFor={id} aria-hidden="true">
                <RiSunLine className="dark:hidden" size={20} aria-hidden="true" />
                <RiMoonClearLine className="hidden dark:block" size={20} aria-hidden="true" />
                <span className="sr-only">Switch to system/light/dark version</span>
            </label>
        </div>
    )
}
