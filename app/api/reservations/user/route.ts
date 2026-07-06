import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Reservation } from "@/models/Reservation"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError


    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status")

    // Build query
    const query: any = { userId: user.id }

    if (status && status !== "pending") {
      query.status = status
    } else {
      query.status = { $ne: "pending" }
    }

    // Fetch user's reservations
    const reservations = await Reservation.find(query)
      .populate("consultantId", "name specialty image fee")
      .sort({ date: 1, time: 1 })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching user reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}
