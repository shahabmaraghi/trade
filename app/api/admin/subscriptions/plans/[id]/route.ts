import { connectDB } from "@/lib/db"
import { NextResponse } from "next/server"
import { SubscriptionPlan } from "@/models"
import { authMiddleware } from "@/lib/auth"

// GET a specific subscription plan
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { user, isAuthorized } = await authMiddleware(request as any, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const plan = await SubscriptionPlan.findById((await params).id)

    if (!plan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error fetching subscription plan:", error)
    return NextResponse.json({ error: "Failed to fetch subscription plan" }, { status: 500 })
  }
}

// UPDATE a subscription plan
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { user, isAuthorized } = await authMiddleware(request as any, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || data.price === undefined || data.durationDays === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If this plan is being set as free, check if there's already a free plan
    if (data.isFree) {
      const existingFreePlan = await SubscriptionPlan.findOne({
        isFree: true,
        _id: { $ne: (await params).id },
      })

      if (existingFreePlan) {
        return NextResponse.json(
          {
            error: "Another free plan already exists. Please deactivate it first.",
          },
          { status: 400 },
        )
      }
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      (await params).id,
      {
        $set: {
          name: data.name,
          price: data.price,
          durationDays: data.durationDays,
          durationHours: data.durationHours || 0,
          features: data.features || [],
          permittedPaths: data.permittedPaths || [],
          isFree: data.isFree || false,
        },
      },
      { new: true, runValidators: true },
    )

    if (!updatedPlan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...updatedPlan,
      success: true,
      p: data.permittedPaths,
    })
  } catch (error) {
    console.error("Error updating subscription plan:", error)
    return NextResponse.json({ error: "Failed to update subscription plan" }, { status: 500 })
  }
}

// DELETE a subscription plan
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { user, isAuthorized } = await authMiddleware(request as any, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const {id} = await params

    // Check if this is the free plan
    const plan = await SubscriptionPlan.findById(id)
    if (!plan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })
    }

    if (plan.isFree) {
      return NextResponse.json({ error: "Cannot delete the free subscription plan" }, { status: 400 })
    }

    // Check if any users are using this plan
    const { User } = await import("@/models/User")
    const usersWithPlan = await User.countDocuments({ subscriptionPlan: id })

    if (usersWithPlan > 0) {
      return NextResponse.json({ error: "Cannot delete plan that is in use by users" }, { status: 400 })
    }

    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id)

    if (!deletedPlan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Plan deleted successfully" })
  } catch (error) {
    console.error("Error deleting subscription plan:", error)
    return NextResponse.json({ error: "Failed to delete subscription plan" }, { status: 500 })
  }
}
