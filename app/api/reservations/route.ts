import { type NextRequest, NextResponse } from "next/server"
import { Reservation } from "@/models/Reservation"
import { Consultant } from "@/models/Consultant"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const consultantId = searchParams.get("consultantId")
    const status = searchParams.get("status")
    const paymentStatus = searchParams.get("paymentStatus")

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Build query
    const query: any = {}

    // If not admin, only show user's own reservations
    if (!(await isAdmin())) {
      query.userId = user.id
    } else {
      // Admin can filter by userId
      if (userId) {
        query.userId = userId
      }
    }

    if (consultantId) {
      query.consultantId = consultantId
    }

    if (status) {
      query.status = status
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus
    }

    // Fetch reservations
    const reservations = await Reservation.find(query)
      .populate("consultantId", "name specialty image fee")
      .populate("userId", "fullName phone email")
      .sort({ date: 1, time: 1 })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {

    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.consultantId || !data.date || !data.time || !data.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if consultant exists
    const consultant = await Consultant.findById(data.consultantId)
    if (!consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }

    // Check if the time slot is available
    const existingReservation = await Reservation.findOne({
      consultantId: data.consultantId,
      date: new Date(data.date),
      time: data.time,
      status: { $in: ["pending", "confirmed"] },
    })

    if (existingReservation) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 400 })
    }

    // Create new reservation
    const reservation = new Reservation({
      ...data,
      userId: user.id,
      paymentAmount: data.paymentAmount || consultant.fee || 0,
      paymentStatus: "pending",
      status: "pending",
    })

    await reservation.save()

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 })
  }
}
