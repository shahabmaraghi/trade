import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Reservation } from "@/models/Reservation"
import { getCurrentUser } from "@/lib/auth"

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

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await req.json()
    const { Authority: authority, Status: status, transactionId } = data

    // Find the reservation by transaction ID
    const reservation = await Reservation.findOne({
      paymentTransactionId: transactionId,
      userId: user.id,
      paymentStatus: "pending",
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Check if payment was successful
    if (status !== "OK") {
      // Update reservation status to failed
      reservation.paymentStatus = "failed"
      await reservation.save()

      return NextResponse.json({ error: "Payment was not successful", status }, { status: 400 })
    }

    // Prepare verification data
    const verificationData = {
      merchant_id: MERCHANT_ID,
      authority,
      amount: reservation.paymentAmount,
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

    // Check verification result
    if (result.data && (result.data.code === 100 || result.data.code === 101)) {
      // Update reservation status
      reservation.paymentStatus = "paid"
      reservation.status = "confirmed"
      await reservation.save()

      return NextResponse.json({
        success: true,
        reservation: reservation,
        refId: result.data?.ref_id || "",
      })
    } else {
      // Update reservation status to failed
      reservation.paymentStatus = "failed"
      await reservation.save()

      return NextResponse.json(
        {
          error: "Payment verification failed",
          code: result.data?.code || "unknown",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

