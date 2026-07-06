import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { subscribeUserToPlan } from "@/lib/subscription"
import { protectRoute } from "@/lib/access-control"

export async function POST(req: NextRequest) {
    const dbError = await connectDBOr503()
    if (dbError) return dbError
  // Check if user is authenticated
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const { planId, paymentMethod, transactionId } = await req.json()

    // Validate required fields
    if (!planId || !paymentMethod) {
      return NextResponse.json({ error: "Plan ID and payment method are required" }, { status: 400 })
    }

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Subscribe user to plan
    const result = await subscribeUserToPlan(userData.id, planId, paymentMethod, transactionId)

    return NextResponse.json({
      success: true,
      subscription: {
        planId,
        expiryDate: result.expiryDate,
        transactionId,
      },
    })
  } catch (error) {
    console.error("Error subscribing to plan:", error)
    return NextResponse.json({ error: "Failed to subscribe to plan" }, { status: 500 })
  }
}
