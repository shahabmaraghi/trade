import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Reservation } from "@/models/Reservation"
import { Consultant } from "@/models/Consultant"
import { getCurrentUser } from "@/lib/auth"
import randomString from "@/lib/randomString"

// ZarinPal API endpoints (latest JSON API)
const ZP_SANDBOX = (process.env.ZP_SANDBOX || "0") === "1"
const ZP_BASE = ZP_SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com"
const API_ENDPOINT = `${ZP_BASE}/pg/v4/payment/request.json`

// Merchant ID from environment variables
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

// Callback URL for verification
const CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/reservation/verify`
  : "http://localhost:3200/reservation/verify"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await req.json()
    const { consultantId, date, time, type } = data

    // Validate required fields
    if (!consultantId || !date || !time || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if consultant exists
    const consultant = await Consultant.findById(consultantId)
    if (!consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }

    // Check if the time slot is available
    const existingReservation = await Reservation.findOne({
      consultantId,
      date: new Date(date),
      time,
      status: { $in: ["pending", "confirmed"] },
    })

    if (existingReservation) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 400 })
    }

    // Create a transaction ID
    const transactionId = randomString(32)

    // Create a pending reservation
    const reservation = new Reservation({
      userId: user.id,
      consultantId,
      date: new Date(date),
      time,
      type,
      status: "pending",
      paymentStatus: "pending",
      paymentAmount: data.paymentAmount || consultant.fee || 0,
      paymentTransactionId: transactionId,
    })

    await reservation.save()

    // Prepare payment request data
    const paymentData = {
      merchant_id: MERCHANT_ID,
      amount: reservation.paymentAmount,
      callback_url: `${CALLBACK_URL}/${transactionId}`,
      description: `رزرو مشاوره با ${consultant.name}`,
      metadata: {
        mobile: user.phone || "",
        email: "",
        order_id: reservation._id.toString(),
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

    // Check if request was successful
    if (result.data && result.data.code === 100) {
      return NextResponse.json({
        success: true,
        authority: result.data.authority,
        gatewayUrl: `${ZP_BASE}/pg/StartPay/${result.data.authority}`,
        reservationId: reservation._id,
        transactionId,
      })
    } else {
      console.error("ZarinPal error:", result)
      return NextResponse.json(
        {
          error: "Payment request failed",
          code: result.data?.code || "unknown",
          message: result.errors?.message || "Unknown error",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error initiating payment:", error)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}

