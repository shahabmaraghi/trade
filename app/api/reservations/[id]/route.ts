import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Reservation } from "@/models/Reservation"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()


    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reservation = await Reservation.findById((await params).id)
      .populate("consultantId", "name specialty image fee")
      .populate("userId", "fullName phone email")

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Check if user is authorized to view this reservation
    if (!(await isAdmin()) && reservation.userId.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()


    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const reservation = await Reservation.findById((await params).id)

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Check if user is authorized to update this reservation
    if (!(await isAdmin()) && reservation.userId.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // If not admin, only allow updating certain fields
    let updateData: any = {}

    if (await isAdmin()) {
      // Admin can update all fields
      updateData = data
    } else {
      // Regular users can only update notes
      updateData = {
        notes: data.notes,
      }
    }

    const updatedReservation = await Reservation.findByIdAndUpdate((await params).id, updateData, {
      new: true,
      runValidators: true,
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()


    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const reservation = await Reservation.findById(id)

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Only admin can delete reservations
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    await Reservation.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting reservation:", error)
    return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 })
  }
}
