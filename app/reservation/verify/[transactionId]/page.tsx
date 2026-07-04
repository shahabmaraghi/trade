"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/main/ui/card"
import { Button } from "@/components/main/ui/button"
import { Skeleton } from "@/components/main/ui/skeleton"
import { CheckCircle, XCircle, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"
import { safeStorage } from "@/lib/storage"

export default function PaymentVerificationPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservation, setReservation] = useState<any>(null)
  const router = useRouter()
  
  const { transactionId } = use(params)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const authority = urlParams.get("Authority")
        const status = urlParams.get("Status")
        const reservationId = safeStorage.getItem("currentReservationId")

        if (!authority && !status && process.env.NODE_ENV !== "production") {
          // For development/testing, simulate a successful payment
          setSuccess(true)
          setReservation({
            date: new Date().toISOString(),
            time: "14:30",
            type: "online",
            consultant: { name: "مشاور تست" },
          })
          safeStorage.removeItem("currentReservationId")
          setLoading(false)
          return
        }

        if (!authority || !status) {
          setError("اطلاعات پرداخت ناقص است")
          setLoading(false)
          return
        }

        // Send verification request
        const response = await fetch("/api/reservations/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Authority: authority,
            Status: status,
            transactionId,
            reservationId,
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setSuccess(true)
          setReservation(data.reservation)
          // Clear the stored reservation ID
          safeStorage.removeItem("currentReservationId")
        } else {
          setSuccess(false)
          setError(data.error || "خطا در تایید پرداخت")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setSuccess(false)
        setError("خطا در ارتباط با سرور")
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [transactionId])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] min-h-screen py-16">
      <div className="max-w-md mx-auto px-4">
        {loading ? (
          <Card className="border border-gray-800 bg-[#161616]">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : success ? (
          <Card className="border border-gray-800 bg-[#161616]">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-900/20 mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <CardTitle className="text-xl text-white">پرداخت با موفقیت انجام شد</CardTitle>
              <CardDescription>رزرو مشاوره شما با موفقیت ثبت شد</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {reservation && (
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                    <h3 className="font-medium text-amber-400 mb-3">جزئیات رزرو</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 ml-2" />
                        <div>
                          <span className="text-gray-400 ml-1">تاریخ:</span>
                          <span className="text-white">{formatDate(reservation.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 text-gray-400 mt-0.5 ml-2" />
                        <div>
                          <span className="text-gray-400 ml-1">ساعت:</span>
                          <span className="text-white">{reservation.time}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <User className="h-4 w-4 text-gray-400 mt-0.5 ml-2" />
                        <div>
                          <span className="text-gray-400 ml-1">نوع مشاوره:</span>
                          <span className="text-white">{reservation.type === "online" ? "آنلاین" : "حضوری"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-white bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                    <p className="text-amber-400 font-medium mb-2">
                      مشاوران ما راس ساعت اعلام شده با شما تماس خواهند گرفت
                    </p>
                    <p className="text-sm text-gray-400">
                      لطفاً در زمان تعیین شده در دسترس باشید. در صورت نیاز به تغییر زمان، حداقل ۲۴ ساعت قبل با پشتیبانی
                      تماس بگیرید.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
                asChild
              >
                <Link href="/user/reservations">مشاهده رزروهای من</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-900 hover:bg-gray-800 hover:text-white"
                asChild
              >
                <Link href="/">بازگشت به صفحه اصلی</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border border-gray-800 bg-[#161616]">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-900/20 mb-4">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <CardTitle className="text-xl text-white">پرداخت ناموفق</CardTitle>
              <CardDescription>متأسفانه پرداخت شما با مشکل مواجه شد</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 text-center">
                <p className="text-red-400">{error || "خطایی در پردازش پرداخت رخ داده است"}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
                asChild
              >
                <Link href="/reservation">تلاش مجدد</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                asChild
              >
                <Link href="/">بازگشت به صفحه اصلی</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}