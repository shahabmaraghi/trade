"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"

interface VerificationResult {
  success: boolean
  message: string
  subscription?: {
    plan: {
      name: string
    }
    expiryDate: string
  }
}

export default function PaymentStatus({ transactionId }: { transactionId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [result, setResult] = useState<VerificationResult | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get parameters from URL
        const Authority = searchParams.get("Authority")
        const Status = searchParams.get("Status")

        if (!Authority || !Status) {
          setResult({
            success: false,
            message: "اطلاعات پرداخت ناقص است",
          })
          setVerifying(false)
          return
        }

        // Call API to verify payment
        const response = await fetch("/api/user/subscription/zarinpal/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Authority, Status, transactionId }),
        })

        const data = await response.json()
        setResult(data)
      } catch (error) {
        console.error("Error verifying payment:", error)
        setResult({
          success: false,
          message: "خطا در تایید پرداخت. لطفا با پشتیبانی تماس بگیرید.",
        })
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">وضعیت پرداخت</CardTitle>
          <CardDescription className="text-center">نتیجه پرداخت اشتراک شما</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {verifying ? (
            <div className="w-full space-y-4">
              <div className="flex justify-center">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          ) : result ? (
            <>
              <div className="mb-4">
                {result.success ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>

              <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{result.success ? "موفقیت‌آمیز" : "ناموفق"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              {result.success && result.subscription && (
                <div className="text-center mb-4">
                  <p className="font-medium">اشتراک: {result.subscription.plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    تاریخ انقضا: {new Date(result.subscription.expiryDate).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              )}
            </>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>خطا</AlertTitle>
              <AlertDescription>خطایی در پردازش اطلاعات پرداخت رخ داده است.</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/user/subscription")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            بازگشت به صفحه اشتراک
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
