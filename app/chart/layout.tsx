import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/chart/theme-provider"
import localFont from "next/font/local"
import type { Metadata } from "next"

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
  title: "پلاس چارت",
  description: "پنل معاملاتی پلاس چارت با چت بات هوشمند",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <body className={`${vazirmatn.variable} font-sans bg-background`}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </body>
  )
}
