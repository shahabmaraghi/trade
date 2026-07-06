import { connectDB } from "@/lib/db"
import { NextResponse } from "next/server"
import { SubscriptionPlan } from "@/models"
import type { NextRequest } from "next/server"

// GET all subscription plans
export async function GET(req: NextRequest) {
  try {
    await connectDB()


    const plans = await SubscriptionPlan.find().sort({ price: 1 })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 })
  }
}

// Add a new endpoint to check if a free plan exists
export async function HEAD(req: NextRequest) {
  try {

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
