import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { SupportTicket } from "@/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const id = (await params).id
    const ticket = await SupportTicket.findById(id).populate("userId", "fullName phone")

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching support ticket:", error)
    return NextResponse.json({ error: "Failed to fetch support ticket" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const id = (await params).id
    const data = await req.json()
    const { status, priority } = data

    // Find and update the ticket
    const ticket = await SupportTicket.findByIdAndUpdate(id, { status, priority }, { new: true })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      ticket,
    })
  } catch (error) {
    console.error("Error updating support ticket:", error)
    return NextResponse.json({ error: "Failed to update support ticket" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const id = (await params).id
    const data = await req.json()
    const { message, status } = data

    // Find the ticket
    const ticket = await SupportTicket.findById(id)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Add admin response to ticket
    ticket.responses.push({
      message,
      isAdmin: true,
      createdAt: new Date(),
    })

    // Update status if provided
    if (status) {
      ticket.status = status
    } else if (ticket.status === "open") {
      // If no status provided and ticket is open, set to in-progress
      ticket.status = "in-progress"
    }

    await ticket.save()

    return NextResponse.json({
      success: true,
      ticket,
    })
  } catch (error) {
    console.error("Error responding to support ticket:", error)
    return NextResponse.json({ error: "Failed to respond to support ticket" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const id = (await params).id
    const data = await req.json()
    const { adminResponse, status } = data

    // Find the ticket
    const ticket = await SupportTicket.findById(id)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Add admin response to ticket
    ticket.responses.push({
      message: adminResponse,
      isAdmin: true,
      createdAt: new Date(),
    })

    // Update status if provided
    if (status) {
      ticket.status = status
    }

    await ticket.save()

    return NextResponse.json({
      success: true,
      ticket,
    })
  } catch (error) {
    console.error("Error adding admin response to support ticket:", error)
    return NextResponse.json({ error: "Failed to add admin response" }, { status: 500 })
  }
}
