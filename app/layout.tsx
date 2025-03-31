// Import modules
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme/theme-provider"
import "./globals.css"

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

// RootLayout component
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange={true}>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
