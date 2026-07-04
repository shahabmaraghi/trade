import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "HIRMAND AI",
  description: "نخستین پلتفرم ترید با دستیار هوش مصنوعی"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl">
      {children}
    </html>
  )
}
