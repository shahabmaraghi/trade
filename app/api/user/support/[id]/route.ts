import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { SupportTicket } from "@/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = (await params).id
    const ticket = await SupportTicket.findOne({ _id: id, userId: userData.id })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching support ticket:", error)
    return NextResponse.json({ error: "Failed to fetch support ticket" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = (await params).id
    const data = await req.json()
    const { message } = data

    // Find the ticket
    const ticket = await SupportTicket.findOne({ _id: id, userId: userData.id })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Add response to ticket
    ticket.responses.push({
      message,
      isAdmin: false,
      createdAt: new Date(),
    })

    // If ticket was closed, reopen it
    if (ticket.status === "closed") {
      ticket.status = "open"
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
