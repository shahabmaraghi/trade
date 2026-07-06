"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { safeStorage } from "@/lib/storage"
// import { useAuth } from "@/components/auth/AuthProvider"

export default function VerifyOTPForm() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(120) // 2 minutes in seconds
  const router = useRouter()
  // const { refreshUser } = useAuth()

  useEffect(() => {
    // Get phone from session storage
    const storedPhone = safeStorage.getItem("auth_phone", "session")
    if (!storedPhone) {
      router.replace("/auth/login")
      return
    }
    setPhone(storedPhone)

    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleResendOTP = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "خطا در ارسال مجدد کد تایید")
      }

      // Reset countdown
      setCountdown(120)
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate code
      if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
        throw new Error("لطفا کد 6 رقمی دریافتی را وارد کنید")
      }

      // Verify OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "خطا در تایید کد")
      }

      // Refresh user data in auth context
      // await refreshUser()

      // Check if user exists
      if (data.userExists) {
        // Full navigation ensures the auth cookie is sent on the next request
        window.location.assign("/user")
      } else {
        // User doesn't exist, redirect to registration
        router.push("/auth/register")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد")
    } finally {
      setIsLoading(false)
    }
  }
  
const toPersianDigits = (value: string) =>
  value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])

const toEnglishDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))

const sanitizeCode = (value: string) =>
  toEnglishDigits(value).replace(/\D/g, "").slice(0, 6)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white">
          شماره تلفن همراه
        </Label>
       <Input
  id="phone"
  type="tel"
  value={toPersianDigits(phone)}
  readOnly
  className="bg-gray-800/50 [font-family:var(--font-iransans-fanum)] border-gray-700 text-white text-right opacity-70"
  dir="ltr"
/>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-white">
          کد تایید
        </Label>
        <Input
  id="code"
  type="text"
  inputMode="numeric"
  placeholder="کد ۶ رقمی"
  value={toPersianDigits(code)}
  onChange={(e) => setCode(sanitizeCode(e.target.value))}
  className="bg-gray-800/50 [font-family:var(--font-iransans-fanum)] border-gray-700 text-white placeholder:text-gray-500 text-center"
  maxLength={6}
  required
/>
        <p className="text-sm text-gray-400 text-center">
          {countdown > 0 ? (
            <>زمان باقیمانده: {formatTime(countdown)}</>
          ) : (
            <Button
              type="button"
              variant="link"
              className="text-amber-500 p-0 h-auto"
              onClick={handleResendOTP}
              disabled={isLoading}
            >
              ارسال مجدد کد
            </Button>
          )}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-medium"
        disabled={isLoading}
      >
        {isLoading ? "در حال بررسی..." : "تایید و ادامه"}
      </Button>
    </form>
  )
}
