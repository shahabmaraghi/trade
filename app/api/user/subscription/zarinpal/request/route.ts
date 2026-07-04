import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionPlan, SubscriptionTransaction } from "@/models"
import { getCurrentUser } from "@/lib/auth"
import mongoose from "mongoose"
import randomString from "@/lib/randomString"

// ZarinPal API endpoints (latest JSON API)
const ZP_SANDBOX = (process.env.ZP_SANDBOX || "0") === "1"
const ZP_BASE = ZP_SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com"
const API_ENDPOINT = `${ZP_BASE}/pg/v4/payment/request.json`

// Merchant ID from environment variables
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

// Callback URL for verification
const CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/user/subscription/verify`
  : "http://localhost:3200/user/subscription/verify"

export async function POST(req: NextRequest) {
  try {
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await req.json()
    const { planId, userRefCode, mentorCode } = data

    // Get subscription plan
    const plan = await SubscriptionPlan.findById(planId)
    if (!plan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 })
    }

    const transactionId = randomString(64)

    // Prepare payment request data
    const paymentData = {
      merchant_id: MERCHANT_ID,
      amount: plan.price,
      callback_url: CALLBACK_URL + "/" + transactionId,
      description: `خرید اشتراک ${plan.name}`,
      metadata: {
        mobile: userData.phone,
        email: "",
        order_id: transactionId,
      },
    }

    // Send request to ZarinPal
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()

    await SubscriptionTransaction.insertOne(
      {
        userId: new mongoose.Types.ObjectId(userData.id),
        planId: plan._id,
        amount: plan.price,
        status: "pending",
        paymentMethod: "ZarinPal",
        authority: result.data.authority,
        transactionId,
        metadata: {
          ...(userRefCode ? { userRefCode: String(userRefCode) } : {}),
          ...(mentorCode ? { mentorCode: String(mentorCode) } : {}),
        },
      },
      { timestamps: true },
    )

    // Check if request was successful
    if (result.data && result.data.code === 100) {
      return NextResponse.json({
        success: true,
        authority: result.data.authority,
        gatewayUrl: `${ZP_BASE}/pg/StartPay/${result.data.authority}`,
        planId,
      })
    } else {
      return NextResponse.json(
        {
          error: "Payment request failed",
          code: result.data?.code || "unknown",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error initiating payment:", error)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}

