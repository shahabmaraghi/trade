import { type NextRequest, NextResponse } from "next/server"
import { Consultant } from "@/models/Consultant"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { Reservation } from "@/models/Reservation"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const consultant = await Consultant.findById((await params).id)

    if (!consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }

    return NextResponse.json(consultant)
  } catch (error) {
    console.error("Error fetching consultant:", error)
    return NextResponse.json({ error: "Failed to fetch consultant" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    // Check if user is authenticated and is admin
    const user = await getCurrentUser()
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.name || !data.specialty || !data.bio || data.fee === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const consultant = await Consultant.findByIdAndUpdate((await params).id, data, { new: true, runValidators: true })

    if (!consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }

    return NextResponse.json(consultant)
  } catch (error) {
    console.error("Error updating consultant:", error)
    return NextResponse.json({ error: "Failed to update consultant" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    // Check if user is authenticated and is admin
    const user = await getCurrentUser()
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const consultantId = (await params).id
    
    // Delete all reservations for this consultant
    await Reservation.deleteMany({ consultantId })
    
    // Delete the consultant
    const consultant = await Consultant.findByIdAndDelete(consultantId)

    if (!consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "مشاور و تمامی رزروهای مرتبط با موفقیت حذف شدند"
    })
  } catch (error) {
    console.error("Error deleting consultant:", error)
    return NextResponse.json({ 
      error: "خطا در حذف مشاور. لطفاً دوباره تلاش کنید." 
    }, { status: 500 })
  }
}
