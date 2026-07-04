import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "@/styles/main/globals.css"
import "@fortawesome/fontawesome-free/css/all.min.css"
import UserLayoutProvider from "@/components/user/user-layout-provider"
import UserSidebar from "@/components/user/sidebar"
import UserHeader from "@/components/user/header"
import { Toaster } from "@/components/ui/toaster"
import "./user.css"

const yekanBakh = localFont({
  src: "../../styles/fonts/YekanBakh-VF.ttf",
  preload: true,
  display: "swap",
})

export const metadata: Metadata = {
  title: "پنل کاربری | پلاس چارت",
  description: "پنل کاربری پلاس چارت - پلتفرم تحلیل و آموزش بازارهای مالی",
}

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body className={yekanBakh.className}>
      <UserLayoutProvider>
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
          <UserSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <UserHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
          <Toaster />
        </div>
      </UserLayoutProvider>
    </body>
  )
}