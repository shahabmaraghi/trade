"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { DirectionProvider } from "@radix-ui/react-direction"

export default function UserLayoutProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <AuthProvider>
      <DirectionProvider dir="rtl">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </DirectionProvider>
    </AuthProvider>
  )
}
