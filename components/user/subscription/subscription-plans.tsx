"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
 

interface SubscriptionPlan {
  _id: string
  name: string
  price: number
  durationDays: number
  durationHours?: number
  features: string[]
  isDefault: boolean
  isActive: boolean
  isFree?: boolean
}

interface UserSubscription {
  plan: SubscriptionPlan | null
  expiryDate: string | null
  isActive: boolean
}

interface SubscriptionTransaction {
  _id: string
  planId: SubscriptionPlan
  amount: number
  status: string
  paymentMethod: string
  startDate: string
  endDate: string
  createdAt: string
}

export default function UserSubscription() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("plans")
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([])
  const [loading, setLoading] = useState({
    plans: true,
    subscription: true,
    transactions: true,
  })
  const [error, setError] = useState<string | null>(null)
  

  useEffect(() => {
    // Fetch subscription plans
    const fetchPlans = async () => {
      try {
        setLoading((prev) => ({ ...prev, plans: true }))
        const response = await fetch("/api/user/subscriptions/plans")
        if (!response.ok) throw new Error("Failed to fetch subscription plans")
        const data = await response.json()

        // Filter out free plans for regular users
        const filteredPlans = data.filter((plan: SubscriptionPlan) => !plan.isFree)
        setPlans(filteredPlans)
      } catch (err) {
        setError("خطا در دریافت اطلاعات اشتراک‌ها")
        console.error(err)
      } finally {
        setLoading((prev) => ({ ...prev, plans: false }))
      }
    }

    // Fetch user's current subscription
    const fetchUserSubscription = async () => {
      try {
        const response = await fetch("/api/user/dashboard")
        if (!response.ok) throw new Error("Failed to fetch user subscription")
        const data = await response.json()
        setUserSubscription(data.stats.subscription)
      } catch (err) {
        setError("خطا در دریافت اطلاعات اشتراک فعلی")
        console.error(err)
      } finally {
        setLoading((prev) => ({ ...prev, subscription: false }))
      }
    }

    // Fetch subscription history
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/user/subscriptions/history")
        if (!response.ok) throw new Error("Failed to fetch subscription history")
        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading((prev) => ({ ...prev, transactions: false }))
      }
    }

    fetchPlans()
    fetchUserSubscription()
    fetchTransactions()
  }, [])

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch("/api/user/subscription/zarinpal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) throw new Error("Failed to initiate subscription")

      const data = await response.json()

      if (data.gatewayUrl) {
        // Redirect to payment gateway
        window.location.href = data.gatewayUrl
      } else {
        setError("خطا در اتصال به درگاه پرداخت")
      }
    } catch (err) {
      setError("خطا در پردازش درخواست اشتراک")
      console.error(err)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-right">مدیریت اشتراک</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطا</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      

      {/* Current Subscription Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-right">وضعیت اشتراک فعلی</CardTitle>
          <CardDescription className="text-right">جزئیات اشتراک فعلی شما</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.subscription ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ) : userSubscription?.plan ? (
            <div className="space-y-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <h3 className="text-lg font-medium">{userSubscription.plan.name}</h3>
                {userSubscription.isActive ? (
                  <Badge className="bg-green-500">فعال</Badge>
                ) : (
                  <Badge variant="destructive">منقضی شده</Badge>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 text-muted-foreground">
                <span>
                  {userSubscription.expiryDate
                    ? `تاریخ انقضا: ${formatDate(new Date(userSubscription.expiryDate))}`
                    : "بدون تاریخ انقضا"}
                </span>
                <Clock className="h-4 w-4" />
              </div>

              {/* {userSubscription.plan.features && userSubscription.plan.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">ویژگی‌های اشتراک:</h4>
                  <ul className="space-y-1">
                    {userSubscription.plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-end gap-2">
                        <span>{feature}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">شما در حال حاضر هیچ اشتراک فعالی ندارید.</p>
              <Button variant="outline" className="mt-2" onClick={() => setActiveTab("plans")}>
                مشاهده طرح‌های اشتراک
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Plans and History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="plans">طرح‌های اشتراک</TabsTrigger>
          <TabsTrigger value="history">تاریخچه پرداخت</TabsTrigger>
        </TabsList>

        {/* Subscription Plans */}
        <TabsContent value="plans">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading.plans ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="flex flex-col">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-10 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
            ) : plans.length > 0 ? (
              plans.map((plan) => (
                <Card key={plan._id} className="flex flex-col">
                  <CardHeader className="text-right">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold">
                      {plan.price.toLocaleString()} تومان
                      <span className="text-sm font-normal text-muted-foreground">
                        {` / ${plan.durationDays} روز`}
                        {plan.durationHours && plan.durationHours > 0 ? ` و ${plan.durationHours} ساعت` : null}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow text-right">
                    {plan.features && plan.features.length > 0 ? (
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center justify-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">اطلاعات ویژگی‌ها موجود نیست</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan._id)}
                      disabled={userSubscription?.plan?._id === plan._id && userSubscription?.isActive}
                    >
                      {userSubscription?.plan?._id === plan._id && userSubscription?.isActive
                        ? "اشتراک فعلی شما"
                        : "خرید اشتراک"}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center p-6">
                <p className="text-muted-foreground">هیچ طرح اشتراکی در حال حاضر موجود نیست.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">تاریخچه پرداخت‌ها</CardTitle>
              <CardDescription className="text-right">سوابق پرداخت‌های اشتراک شما</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.transactions ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                        <Skeleton className="h-6 w-1/4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="flex justify-between items-center p-4 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.status === "completed" ? "default" : "outline"}>
                          {transaction.status === "completed" ? "موفق" : transaction.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(new Date(transaction.createdAt))}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{transaction.planId.name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.amount.toLocaleString()} تومان</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">هیچ سابقه پرداختی یافت نشد.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
