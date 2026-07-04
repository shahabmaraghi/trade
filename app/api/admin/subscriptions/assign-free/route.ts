import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/auth"
import { assignFreePlanToUser } from "@/lib/subscription"

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthorized } = await authMiddleware(req, "admin")

    if (!isAuthorized || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Assign free plan to user
    const result = await assignFreePlanToUser(userId, user.id)

    return NextResponse.json({
      success: true,
      message: "Free plan assigned successfully",
      subscription: {
        expiryDate: result.expiryDate,
        transactionId: result.transaction._id,
      },
    })
  } catch (error: any) {
    console.error("Error assigning free plan:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to assign free plan",
      },
      { status: 500 },
    )
  }
}
