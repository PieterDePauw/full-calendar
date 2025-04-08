// Import modules
import { Geist, Geist_Mono } from "next/font/google"
import "@/styles/globals.css"

// Define the font variable for Geist
const fontSans = Geist({
    variable: "--font-sans",
    subsets: ["latin"],
})

// Define the font variable for Geist_Mono
const fontMono = Geist_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
})

// Export the font variables
export { fontSans, fontMono }
