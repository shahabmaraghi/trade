import { connectDBOr503 } from "@/lib/db"
import { NextResponse } from "next/server"
import { SubscriptionPlan } from "@/models"
import { authMiddleware } from "@/lib/auth"
import type { NextRequest } from "next/server"

// Check if a free plan exists
export async function GET(req: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const { user, isAuthorized } = await authMiddleware(req, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const freePlan = await SubscriptionPlan.findOne({ isFree: true })

    return NextResponse.json({
      hasFree: !!freePlan,
      freePlan: freePlan || null,
    })
  } catch (error) {
    console.error("Error checking free plan:", error)
    return NextResponse.json({ error: "Failed to check free plan" }, { status: 500 })
  }
}
