"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/admin/ui/card"
import { Button } from "@/components/admin/ui/button"
import { CheckCircle } from "lucide-react"

interface Plan {
  _id: string
  title: string
  description: string
  price: number
  features: string[]
  durationDays: number
  isActive: boolean
}

export function SubscriptionPlans() {
  const { user, isPremium, refreshUser } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/subscriptions/plans")
        if (response.ok) {
          const data = await response.json()
          setPlans(data)
        }
      } catch (error) {
        console.error("Error fetching subscription plans:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  // Subscribe to plan
  const subscribeToPlan = async (planId: string) => {
    if (!user) return

    setIsProcessing(true)
    try {
      // In a real app, this would integrate with a payment gateway
      // For demo purposes, we'll simulate a successful payment
      const response = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          paymentMethod: "credit_card",
          transactionId: `demo_${Date.now()}`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Subscription failed")
      }

      // Refresh user data to update subscription status
      await refreshUser()

      // Show success message
      alert("Subscription successful!")
    } catch (error) {
      console.error("Subscription error:", error)
      alert("Subscription failed. Please try again.")
    } finally {
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  // Get current plan
  const currentPlanId = user?.subscription?.plan?.id

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        <p>Loading subscription plans...</p>
      ) : (
        plans.map((plan) => (
          <Card key={plan._id} className={`${currentPlanId === plan._id ? "border-primary" : ""}`}>
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {plan.price.toLocaleString("fa-IR")} <span className="text-sm font-normal">تومان</span>
              </div>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              {currentPlanId === plan._id ? (
                <Button disabled className="w-full">
                  اشتراک فعلی
                </Button>
              ) : (
                <Button onClick={() => subscribeToPlan(plan._id)} disabled={isProcessing} className="w-full">
                  {isProcessing && selectedPlan === plan._id ? "در حال پردازش..." : "انتخاب اشتراک"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}
