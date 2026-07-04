import type React from "react"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ConfigProviderWrapper from "./ConfigProviderWrapper"
import { AuthProvider } from "@/components/admin/auth/AuthProvider"
import { App } from "antd"
import NextTopLoader from "nextjs-toploader"

const yekanBakh = localFont({ src: "../../styles/fonts/YekanBakh-VF.ttf", preload: true })

export const metadata = {
  title: "پنل مدیریت پلاس چارت",
  description: "پنل مدیریت پلاس چارت"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body className={yekanBakh.className}>
      <ConfigProviderWrapper fontFamily={yekanBakh.style.fontFamily}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <App>
            <NextTopLoader color="#ffd700" showSpinner={false} />
            <AuthProvider>{children}</AuthProvider>
          </App>
        </ThemeProvider>
      </ConfigProviderWrapper>
    </body>
  )
}
