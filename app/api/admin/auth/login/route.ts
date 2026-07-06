import { type NextRequest, NextResponse } from "next/server"
import { User } from "@/models"
import { signToken, applyAuthCookie, type TokenData } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()

    // Validate phone number
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ phone }).populate("subscriptionPlan")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is admin and verify password
    if (user.role === "admin") {
      if (!password) {
        return NextResponse.json({ error: "Password is required for admin login" }, { status: 400 })
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 })
      }
    }

    // Update last login
    await user.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    // Create token data with subscription status
    const hasActiveSubscription = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
    const tokenData: TokenData = {
      _id: user._id,
      // @ts-ignore
      id: user._id?.toString(),
      phone: user.phone,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan?._id?.toString() || "",
      subscriptionExpiry: user.subscriptionExpiry?.toISOString(),
      hasActiveSubscription: hasActiveSubscription ?? false,
    }

    // Sign token
    const token = await signToken(tokenData);

    // Return response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan
          ? {
            id: user.subscriptionPlan._id,
            // @ts-ignore
            title: user.subscriptionPlan.title,
          }
          : null,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    })

    applyAuthCookie(response, token, req.headers.get("host") ?? undefined)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
