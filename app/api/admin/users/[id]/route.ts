import { NextResponse } from "next/server"
import { User, SubscriptionPlan } from "@/models"
import { authMiddleware } from "@/lib/auth"

// GET a specific user
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, isAuthorized } = await authMiddleware(request as any, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const userData = await User.findById((await params).id).populate("subscriptionPlan")

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't return the password
    const userResponse = userData.toObject()
    delete userResponse.password

    return NextResponse.json(userResponse)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// UPDATE a user
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, isAuthorized } = await authMiddleware(request as any, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const data = await request.json()

    // Find the user first
    const existingUser = await User.findById((await params).id)
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Handle subscription plan update if provided
    if (data.subscriptionPlanId) {
      const plan = await SubscriptionPlan.findById(data.subscriptionPlanId)
      if (!plan) {
        return NextResponse.json({ error: "Subscription plan not found" }, { status: 400 })
      }
      existingUser.subscriptionPlan = plan._id
    }

    // Update subscription expiry if provided
    if (data.subscriptionExpiry) {
      existingUser.subscriptionExpiry = new Date(data.subscriptionExpiry)
    }

    // Update other fields
    if (data.phone) existingUser.phone = data.phone
    if (data.fullName !== undefined) existingUser.fullName = data.fullName
    if (data.referrer !== undefined) existingUser.referrer = data.referrer
    if (data.role) existingUser.role = data.role

    // Only update password if provided
    if (data.password) {
      existingUser.password = data.password
    }

    await existingUser.save()

    // Don't return the password
    const userResponse = existingUser.toObject()
    delete userResponse.password

    return NextResponse.json(userResponse)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE a user
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, isAuthorized } = await authMiddleware(request as any, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const { id } = await params

    // Check if user exists
    const existingUser = await User.findById(id)
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting the last admin
    if (existingUser.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" })
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last admin user" }, { status: 400 })
      }
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
