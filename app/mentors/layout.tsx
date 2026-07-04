import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import localFont from "next/font/local"
import "./mentors.css"

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
})

export const metadata: Metadata = {
  title: "پنل مدیریت اساتید",
  description: "پنل مدیریت منتورینگ اساتید",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body className={vazirmatn.className}>
      <Suspense fallback={null}>
        {children}
        <Toaster />
      </Suspense>
    </body>
  )
}
