import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { User } from "@/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get fresh user data from database
    const user = await User.findById(userData.id).populate("subscriptionPlan")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if subscription is active
    const isSubscriptionActive = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false

    return NextResponse.json({
      id: user._id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      subscription: {
        plan: {
          id: user.subscriptionPlan._id,
          title: user.subscriptionPlan.name || user.subscriptionPlan.title, // Handle both name formats
          price: user.subscriptionPlan.price,
          features: user.subscriptionPlan.features,
        },
        expiryDate: user.subscriptionExpiry,
        isActive: isSubscriptionActive,
      },
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
