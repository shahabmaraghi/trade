import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionPlan, SubscriptionTransaction } from "@/models"
import { getCurrentUser } from "@/lib/auth"
import { subscribeUserToPlan } from "@/lib/subscription"
import mongoose from "mongoose"

// ZarinPal API endpoints (latest JSON API)
const ZP_SANDBOX = (process.env.ZP_SANDBOX || "0") === "1"
const ZP_BASE = ZP_SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com"
const API_ENDPOINT = `${ZP_BASE}/pg/v4/payment/verify.json`

// Merchant ID from environment variables
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

export async function POST(req: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await req.json()
    const { Authority: authority, Status: status, transactionId } = data

    // Check if payment was successful
    if (status !== "OK") {
      return NextResponse.json({ error: "Payment was not successful", status, data }, { status: 400 })
    }

    const planTransaction = await SubscriptionTransaction.findOne<{ [key: string]: any }>({
      userId: new mongoose.Types.ObjectId(userData.id),
      authority,
      transactionId,
      status: "pending",
    }).lean()

    if (!planTransaction) {
      return NextResponse.json({ error: "Transaction for subscription plan not found" }, { status: 404 })
    }

    const planId = planTransaction.planId

    // Get subscription plan
    const plan = await SubscriptionPlan.findById(planId)
    if (!plan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })
    }

    // Prepare verification data
    const verificationData = {
      merchant_id: MERCHANT_ID,
      authority,
      amount: plan.price,
    }

    // Send verification request to ZarinPal
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(verificationData),
    })

    const result = await response.json()

    console.log("result-verify", result)

    // Check verification result
    const isVerified = result.data && (result.data.code === 100 || result.data.code === 101)
    const refId = result.data?.ref_id || ""

    if (isVerified) {
      // Subscribe user to plan
      const subscription = await subscribeUserToPlan(userData.id, planId?.toString(), "zarinpal", transactionId)

      return NextResponse.json({
        success: true,
        subscription: {
          ...subscription,
          plan,
        },
        refId,
      })
    } else {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          code: result.data?.code || "unknown",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error verifying payment:", error?.toString())
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

