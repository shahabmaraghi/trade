"use client"
import { CookiesProvider } from "react-cookie"
import type React from "react"
import { DirectionProvider } from "@radix-ui/react-direction"

export default function MainLayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <DirectionProvider dir="rtl">
      <CookiesProvider>{children}</CookiesProvider>
    </DirectionProvider>
  )
}
