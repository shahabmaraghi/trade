import { NextResponse } from "next/server"
import { SubscriptionPlan } from "@/models"
import { authMiddleware } from "@/lib/auth"
import type { NextRequest } from "next/server"

// GET all subscription plans
export async function GET(req: NextRequest) {
  try {
    const { user, isAuthorized } = await authMiddleware(req, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const plans = await SubscriptionPlan.find().sort({ price: 1 })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 })
  }
}

// CREATE a new subscription plan
export async function POST(req: NextRequest) {
  try {
    const { user, isAuthorized } = await authMiddleware(req, "admin")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.name || data.price === undefined || data.durationDays === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If this plan is set as free, unset any existing free plans
    if (data.isFree) {
      // Check if there's already a free plan
      const existingFreePlan = await SubscriptionPlan.findOne({ isFree: true })
      if (existingFreePlan) {
        return NextResponse.json({ error: "A free plan already exists" }, { status: 400 })
      }
    }

    const newPlan = new SubscriptionPlan({
      name: data.name,
      price: data.price,
      durationDays: data.durationDays,
      durationHours: data.durationHours || 0,
      features: data.features || [],
      permittedPaths: data.permittedPaths || [],
      isFree: data.isFree || false,
    })

    await newPlan.save()

    return NextResponse.json(newPlan, { status: 201 })
  } catch (error) {
    console.error("Error creating subscription plan:", error)
    return NextResponse.json({ error: "Failed to create subscription plan" }, { status: 500 })
  }
}

// Add a new endpoint to check if a free plan exists
export async function HEAD(req: NextRequest) {
  try {
    const { user, isAuthorized } = await authMiddleware(req, "admin")

    if (!isAuthorized) {
      return new Response(null, { status: 401 })
    }

    const freePlan = await SubscriptionPlan.findOne({ isFree: true })

    return new Response(null, {
      status: 200,
      headers: {
        "X-Has-Free-Plan": freePlan ? "true" : "false",
      },
    })
  } catch (error) {
    console.error("Error checking free plan:", error)
    return new Response(null, { status: 500 })
  }
}
