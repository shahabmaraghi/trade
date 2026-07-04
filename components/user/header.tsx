"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sun, Moon, Rotate3d } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function UserHeader() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/user") return "داشبورد"
    if (pathname.startsWith("/user/analyses")) {
      if (pathname.includes("/new")) return "ایجاد تحلیل جدید"
      if (pathname.includes("/edit")) return "ویرایش تحلیل"
      return "مدیریت تحلیل‌ها"
    }
    if (pathname.startsWith("/user/support")) {
      if (pathname.includes("/new")) return "ایجاد تیکت جدید"
      if (pathname.includes("/")) return "جزئیات تیکت"
      return "پشتیبانی"
    }
    if (pathname.startsWith("/user/subscription")) {
      if (pathname.includes("/verify")) return "تأیید پرداخت"
      return "مدیریت اشتراک"
    }
    return "پنل کاربری"
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2 mr-12 md:mr-0">
          <h1 className="text-xl font-semibold md:text-2xl">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/chart")}>
            ورود به چـارت
          </Button>
          <Button variant="ghost" size="icon" className="text-foreground" onClick={() => router.push("/")}>
            <Rotate3d size={20} />
          </Button>
        </div>
      </div>
    </header>
  )
}
