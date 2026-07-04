"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { User, Wallet, CreditCard, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface TopBarProps {
  userName: string
}

export function TopBar({ userName }: TopBarProps) {
  const [wallet, setWallet] = useState<number>(0)
  const [depositAmount, setDepositAmount] = useState<string>("")
  const [depositOpen, setDepositOpen] = useState(false)
  const [hasPending, setHasPending] = useState(false)
  const [referralCode, setReferralCode] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // fetch wallet and referral code
    ;(async () => {
      try {
        const [walletRes, userRes] = await Promise.all([
          fetch("/api/mentors/deposits"),
          fetch("/api/mentors/auth/me")
        ])

        if (walletRes.ok) {
          const walletData = await walletRes.json()
          setWallet(walletData.wallet || 0)
          setHasPending(!!walletData.hasPending)
        }

        if (userRes.ok) {
          const userData = await userRes.json()
          setReferralCode(userData.user?.referralCode || "")
        }
      } catch {}
    })()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/mentors/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const copyReferralCode = async () => {
    if (!referralCode) return

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const link = origin ? `${origin}/auth/register?mentor=${referralCode}` : referralCode
      await navigator.clipboard.writeText(link)
      toast({
        title: "کپی شد",
        description: "لینک معرفی منتور به کلیپ‌بورد کپی شد",
      })
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در کپی کردن لینک معرفی",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section - User Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <h1 className="text-base font-semibold text-foreground leading-tight">پلاس چارت </h1>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">پنل مدیریت اساتید</p>
                <span className="text-xs text-muted-foreground">•</span>
                <p className="text-xs font-medium text-primary">{userName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Wallet Balance & Logout */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance Section */}
          <div className="bg-card/50 rounded-md p-2 border border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-foreground">موجودی</span>
              </div>
              <span className="text-sm font-bold text-green-600">{wallet.toLocaleString()}</span>

              {/* Deposit Request Button */}
              <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white border-primary/20"
                    disabled={hasPending}
                  >
                    <CreditCard className="h-3 w-3" />
                    {hasPending ? "در انتظار" : "برداشت"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      درخواست برداشت از کیف پول
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-right">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">حداقل مبلغ برداشت: ۲۰۰,۰۰۰ تومان</p>
                      <p className="text-xs text-muted-foreground mt-1">موجودی فعلی: {wallet.toLocaleString()} تومان</p>
                    </div>
                    {hasPending && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600 font-medium">⚠️ یک درخواست در انتظار دارید</p>
                        <p className="text-xs text-red-500">تا تعیین تکلیف درخواست قبلی، امکان ثبت درخواست جدید نیست.</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">مبلغ برداشت (تومان)</label>
                      <input
                        type="number"
                        min={200000}
                        className="border rounded px-3 py-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="مبلغ برداشت"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={hasPending}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setDepositOpen(false)}
                    >
                      انصراف
                    </Button>
                    <Button
                      disabled={hasPending || !depositAmount || Number(depositAmount) < 200000}
                      onClick={async () => {
                        const amt = Math.floor(Number(depositAmount) || 0)
                        if (amt < 200000) {
                          toast({ title: "خطا", description: "حداقل مبلغ ۲۰۰,۰۰۰ تومان است", variant: "destructive" })
                          return
                        }
                        try {
                          const res = await fetch("/api/mentors/deposits", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ amount: amt }),
                          })
                          const data = await res.json()
                          if (res.ok) {
                            setDepositAmount("")
                            setDepositOpen(false)
                            toast({ title: "✅ ثبت شد", description: "درخواست برداشت ثبت شد" })
                            const r = await fetch("/api/mentors/deposits")
                            if (r.ok) {
                              const d = await r.json()
                              setWallet(d.wallet || 0)
                              setHasPending(!!d.hasPending)
                            }
                          } else {
                            toast({ title: "خطا", description: data.error || "خطا در ثبت درخواست", variant: "destructive" })
                          }
                        } catch {
                          toast({ title: "خطا", description: "ثبت درخواست ناموفق بود", variant: "destructive" })
                        }
                      }}
                    >
                      ثبت درخواست
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Referral Code Copy Button */}
          {referralCode && (
            <Button
              variant="outline"
              onClick={copyReferralCode}
              className="bg-card/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 h-10 px-3"
              size="sm"
              title="کپی کد معرف"
            >
              <span className="flex items-center gap-1">
                <span>کد معرفی: </span>
                <Copy className="h-3 w-3" />
                <span className="text-xs">{referralCode}</span>
              </span>
            </Button>
          )}

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 h-8 px-3"
            size="sm"
          >
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs">خروج</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
