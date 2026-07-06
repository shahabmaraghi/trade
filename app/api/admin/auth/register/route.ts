import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { User, SubscriptionPlan } from "@/models"
import { signToken, applyAuthCookie, type TokenData } from "@/lib/auth"

// Helper function to calculate expiry date
function calculateExpiryDate(days: number, hours: number): Date {
  const now = new Date()
  const expiryDate = new Date(now)
  expiryDate.setDate(now.getDate() + days)
  expiryDate.setHours(now.getHours() + hours)
  return expiryDate
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { phone, fullName, password, referrer, role = "user" } = await req.json()

    // Validate phone number
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    // Validate password for admin users
    if (role === "admin" && (!password || password.length < 6)) {
      return NextResponse.json(
        {
          error: "Password is required for admin users and must be at least 6 characters",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone })
    if (existingUser) {
      return NextResponse.json({ error: "User with this phone number already exists" }, { status: 409 })
    }

    // Get free subscription plan
    const freePlan = await SubscriptionPlan.findOne({ isFree: true })
    if (!freePlan) {
      return NextResponse.json({ error: "Free plan not found" }, { status: 500 })
    }

    // Create new user
    const user = new User({
      phone,
      fullName: fullName || "",
      password: password || undefined, // Only set if provided
      referrer: referrer || "",
      role: role || "user",
      subscriptionPlan: freePlan._id,
      // Calculate expiry date based on free plan duration
      subscriptionExpiry: calculateExpiryDate(freePlan.durationDays, freePlan.durationHours),
      lastLogin: new Date(),
    })

    await user.save()

    // Create token data with subscription status
    const hasActiveSubscription = user.subscriptionExpiry && (new Date(user.subscriptionExpiry) > new Date());
    const tokenData: TokenData = {
      id: user._id?.toString(),
      _id: user._id?.toString(),
      phone: user.phone,
      role: user.role,
      subscriptionPlan: freePlan._id.toString(),
      subscriptionExpiry: user.subscriptionExpiry?.toISOString(),
      hasActiveSubscription: hasActiveSubscription ?? false,
    }

    const token = await signToken(tokenData)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        subscriptionPlan: {
          id: freePlan._id,
          title: freePlan.title,
        },
      },
    })

    applyAuthCookie(response, token, req.headers.get("host") ?? undefined)

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
