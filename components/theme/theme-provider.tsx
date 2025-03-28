"use client"

// Import modules
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

// ThemeProvider component
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
