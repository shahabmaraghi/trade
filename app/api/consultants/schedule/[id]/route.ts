import { type NextRequest, NextResponse } from "next/server"
import { Consultant } from "@/models/Consultant"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    // Check if user is authenticated and is admin
    const user = await getCurrentUser()
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const data = await req.json()
    const { schedule } = data

    // Validate schedule data
    if (!schedule || typeof schedule !== "object") {
      return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 })
    }

    // Update consultant schedule
    const consultant = await Consultant.findByIdAndUpdate((await params).id, { schedule }, { new: true, runValidators: true })

    if (!consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }

    return NextResponse.json(consultant)
  } catch (error) {
    console.error("Error updating consultant schedule:", error)
    return NextResponse.json({ error: "Failed to update consultant schedule" }, { status: 500 })
  }
}
