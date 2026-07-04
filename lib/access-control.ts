import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware, hasActiveSubscription, hasPremiumAccess, type TokenData } from "./auth"
import mongoose from "mongoose"

/**
 * Middleware to protect routes that require authentication
 */
export async function protectRoute(req: NextRequest) {
  const { user, isAuthorized } = await authMiddleware(req)

  if (!user || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null // Continue to route handler
}

/**
 * Middleware to protect routes that require admin role
 */
export async function protectAdminRoute(req: NextRequest) {
  const { user, isAuthorized } = await authMiddleware(req, "admin")

  if (!user || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
  }

  return null // Continue to route handler
}

/**
 * Middleware to protect routes that require subscription
 */
export async function protectSubscriberRoute(req: NextRequest) {
  const { user, isAuthorized } = await authMiddleware(req)

  if (!user || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hasSubscription = await hasActiveSubscription(user.id)
  if (!hasSubscription) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 })
  }

  return null // Continue to route handler
}

/**
 * Middleware to protect routes that require premium subscription
 */
export async function protectPremiumRoute(req: NextRequest) {
  const { user, isAuthorized } = await authMiddleware(req)

  if (!user || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hasPremium = await hasPremiumAccess(user.id)
  if (!hasPremium) {
    return NextResponse.json({ error: "Premium subscription required" }, { status: 403 })
  }

  return null // Continue to route handler
}

/**
 * Middleware to detect if user is admin
 */
export async function isAdmin(token: TokenData | null) {
  if (token?.role === "admin") {
    return true
  }
  return false
}

/**
 * Middleware to detect if user is authenticated
 */
export async function isAuthenticated(req: NextRequest) {
  const { user, isAuthorized } = await authMiddleware(req)
  if (!user || !isAuthorized) {
    return {
      success: false,
      user: null,
    }
  }
  return {
    success: isAuthorized,
    user: {
      ...user,
      _id: new mongoose.Types.ObjectId(user.id),
    },
  }
}

/**
 * Check if a user has access to a specific path based on their subscription plan
 */
export async function hasPathAccess(userId: string, path: string) {
  try {
    const { User } = await import("@/models/User")
    const { SubscriptionPlan } = await import("@/models/SubscriptionPlan")

    const user = await User.findById(userId).populate("subscriptionPlan")

    if (!user || !user.subscriptionPlan) {
      return false
    }

    const plan = await SubscriptionPlan.findById(user.subscriptionPlan)

    if (!plan || !plan.permittedPaths) {
      return false
    }

    // Check if any of the permitted paths match the beginning of the requested path
    return plan.permittedPaths.some((permittedPath: string) => path.startsWith(permittedPath))
  } catch (error) {
    console.error("Error checking path access:", error)
    return false
  }
}

/**
 * Middleware to protect routes based on path permissions
 */
export async function protectPathRoute(req: NextRequest, path: string) {
  const { user, isAuthorized } = await authMiddleware(req)

  if (!user || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hasAccess = await hasPathAccess(user.id, path)
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Access to this path is not included in your subscription plan" },
      { status: 403 },
    )
  }

  return null // Continue to route handler
}
