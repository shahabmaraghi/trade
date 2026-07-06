import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { SupportTicket } from "@/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const status = searchParams.get("status") || undefined

    // Build query
    const query: any = { userId: userData.id }
    if (status) {
      query.status = status
    }

    // Get tickets created by the user
    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await SupportTicket.countDocuments(query)

    return NextResponse.json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching support tickets:", error)
    return NextResponse.json({ error: "Failed to fetch support tickets" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await req.json()
    const { subject, message, priority } = data

    // Create new support ticket
    const ticket = new SupportTicket({
      userId: userData.id,
      subject,
      message,
      priority: priority || "medium",
      status: "open",
    })

    await ticket.save()

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket._id,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    })
  } catch (error) {
    console.error("Error creating support ticket:", error)
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 })
  }
}
