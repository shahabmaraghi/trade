import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { User } from "@/models/User"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Find user
    const user = await User.findById(decoded.id).select("-password").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get subscription information if available
    const userData = {
      id: user._id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
    }

    if (user.subscriptionPlan) {
      const populatedUser = await User.findById(user._id).select("-password").populate("subscriptionPlan")

      if (populatedUser && populatedUser.subscriptionPlan) {
        const subscription = {
          plan: populatedUser.subscriptionPlan,
          expiryDate: user.subscriptionExpiryDate,
          isActive: user.isSubscriptionActive,
        }

        return NextResponse.json({
          ...userData,
          subscription,
        })
      }
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error in auth/me:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
