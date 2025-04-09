// Import modules
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { fontMono, fontSans } from "@/styles/fonts"
import "@/styles/globals.css"

// RootLayout component
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange={true}>
                    {children}
                    <Toaster closeButton={true} richColors={true} position="bottom-right" />
                </ThemeProvider>
            </body>
        </html>
    )
}
