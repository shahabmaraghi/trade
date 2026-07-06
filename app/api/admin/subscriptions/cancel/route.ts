import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { cancelSubscription } from "@/lib/subscription"
import { protectRoute } from "@/lib/access-control"

export async function POST(req: NextRequest) {
    const dbError = await connectDBOr503()
    if (dbError) return dbError
  // Check if user is authenticated
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Cancel subscription
    const result = await cancelSubscription(userData.id)

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
