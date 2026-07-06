import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { User } from "@/models/User"
import { SubscriptionPlan } from "@/models/SubscriptionPlan"
import { BlogCategory } from "@/models/BlogCategory"

/**
 * API Route to check the status of essential data in the database
 * This route doesn't modify any data, just reports what exists
 *
 * @route GET /api/seed/check
 * @returns {object} Status of essential data in the database
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Connect to the database

    // Check for essential data
    const adminCount = await User.countDocuments({ role: "admin" })
    const userCount = await User.countDocuments()
    const planCount = await SubscriptionPlan.countDocuments()
    const categoryCount = await BlogCategory.countDocuments()

    // Get the default plan
    const defaultPlan = await SubscriptionPlan.findOne({ isDefault: true })

    return NextResponse.json({
      success: true,
      status: {
        hasAdminUser: adminCount > 0,
        totalUsers: userCount,
        subscriptionPlans: planCount,
        hasDefaultPlan: !!defaultPlan,
        blogCategories: categoryCount,
      },
      needsSeeding: adminCount === 0 || planCount === 0 || !defaultPlan,
    })
  } catch (error) {
    console.error("Database check error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check database status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
