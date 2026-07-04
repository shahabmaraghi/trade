"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, Users, Gift, TrendingUp, Wallet } from 'lucide-react'
import { useAuth } from "@/components/auth/AuthProvider"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  referralCode: string
  wallet: number
  referredUsers: Array<{
    id: string
    phone: string
    fullName?: string
    createdAt: string
    isActive: boolean
  }>
}

export default function ReferralSystem() {
  const { user } = useAuth()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [referralLink, setReferralLink] = useState("")
  const [wallet, setWallet] = useState<number>(0)
  const [depositAmount, setDepositAmount] = useState<string>("")
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)
  const [hasPending, setHasPending] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReferralStats()
    }
  }, [user])

  useEffect(() => {
    if (stats?.referralCode) {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const url = origin ? `${origin}/auth/register?ref=${stats.referralCode}` : `${stats.referralCode}`
      setReferralLink(url)
    }
  }, [stats?.referralCode])

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch("/api/user/deposits")
        if (res.ok) {
          const data = await res.json()
          setWallet(data.wallet || 0)
          setHasPending(!!data.hasPending)
        }
      } catch {
        // ignore
      }
    }
    if (user) fetchWallet()
  }, [user])

  const fetchReferralStats = async () => {
    try {
      const response = await fetch("/api/user/referrals")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast({
        title: "کپی شد!",
        description: "لینک معرفی در کلیپ‌بورد کپی شد",
      })
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در کپی کردن لینک",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">سیستم معرفی</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          دوستان خود را معرفی کنید و از مزایای ویژه بهره‌مند شوید
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل معرفی‌ها</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">تعداد کل کاربران معرفی شده</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معرفی‌های فعال</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">کاربران فعال معرفی شده</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کیف پول</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-bold">{wallet.toLocaleString()} تومان</div>
              <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <Button disabled={hasPending}>درخواست واریز</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>درخواست برداشت از کیف پول</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-right">
                    <p className="text-sm text-muted-foreground">حداقل مبلغ برداشت: ۲۰۰,۰۰۰ تومان</p>
                    {hasPending && (
                      <p className="text-sm text-red-500">یک درخواست در انتظار دارید. تا تعیین تکلیف امکان ثبت درخواست جدید نیست.</p>
                    )}
                    <input
                      className="border rounded px-3 py-2 w-full text-right"
                      type="number"
                      min={200000}
                      placeholder="مبلغ برداشت (تومان)"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={hasPending}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={depositLoading || hasPending}
                      onClick={async () => {
                        const amt = Math.floor(Number(depositAmount) || 0)
                        if (amt < 200000) {
                          toast({ title: "خطا", description: "حداقل مبلغ برداشت ۲۰۰,۰۰۰ تومان است", variant: "destructive" })
                          return
                        }
                        setDepositLoading(true)
                        try {
                          const res = await fetch("/api/user/deposits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amt }) })
                          const data = await res.json()
                          if (res.ok) {
                            setDepositAmount("")
                            setDepositOpen(false)
                            const r = await fetch("/api/user/deposits")
                            if (r.ok) {
                              const d = await r.json()
                              setWallet(d.wallet || 0)
                              setHasPending(!!d.hasPending)
                            }
                          } else {
                            const error = data.error === "insufficient_wallet" ? "موجودی کافی نیست" : data.error === "pending_exists" ? "درخواست در انتظار دارید" : data.error || "خطا در ثبت درخواست برداشت"
                            toast({ title: "خطا", description: error, variant: "destructive" })
                          }
                        } finally {
                          setDepositLoading(false)
                        }
                      }}
                    >
                      ثبت درخواست
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>کد معرفی شما</CardTitle>
          <CardDescription>
            این کد را با دوستان خود به اشتراک بگذارید تا در هنگام ثبت نام وارد کنند.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="text-center" style={{ fontSize: 24 }} dir="ltr" />
            <Button onClick={copyReferralLink} variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            کد معرفی شما: <span className="font-mono font-bold">{stats?.referralCode}</span>
          </div>
        </CardContent>
      </Card>



      {/* Referred Users */}
      {stats?.referredUsers && stats.referredUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>کاربران معرفی شده</CardTitle>
            <CardDescription>لیست کاربرانی که از طریق شما ثبت نام کرده‌اند</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.referredUsers.map((referredUser) => (
                <div
                  key={referredUser.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {referredUser.fullName || "کاربر بدون نام"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {referredUser.phone}
                    </div>
                    <div className="text-xs text-gray-500">
                      تاریخ ثبت نام: {new Date(referredUser.createdAt).toLocaleDateString("fa-IR")}
                    </div>
                  </div>
                  <Badge variant={referredUser.isActive ? "default" : "secondary"}>
                    {referredUser.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}