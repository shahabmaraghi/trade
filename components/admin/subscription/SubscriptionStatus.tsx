"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/admin/ui/card"
import { Button } from "@/components/admin/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"

export function SubscriptionStatus() {
  const { user, isPremium } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return null
  }

  const subscription = user.subscription

  // Format expiry date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "نامشخص"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!confirm("آیا از لغو اشتراک خود اطمینان دارید؟")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel subscription")
      }

      alert("اشتراک شما با موفقیت لغو شد.")
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      alert("خطا در لغو اشتراک. لطفا دوباره تلاش کنید.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>وضعیت اشتراک</CardTitle>
        <CardDescription>اطلاعات اشتراک فعلی شما</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">نوع اشتراک:</span>
            <span>{subscription?.plan?.title || "رایگان"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">وضعیت:</span>
            <div className="flex items-center">
              {subscription?.isActive ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                  <span className="text-green-500">فعال</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                  <span className="text-red-500">غیرفعال</span>
                </>
              )}
            </div>
          </div>

          {subscription?.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="font-medium">تاریخ انقضا:</span>
              <span>{formatDate(subscription.expiryDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {subscription?.isActive && subscription?.plan?.title !== "رایگان" && (
          <Button variant="outline" onClick={cancelSubscription} disabled={isLoading} className="w-full">
            {isLoading ? "در حال پردازش..." : "لغو اشتراک"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
