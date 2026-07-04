import { type NextRequest, NextResponse } from "next/server"
import { SupportTicket } from "@/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const userData = await getCurrentUser()
    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const status = searchParams.get("status") || undefined
    const priority = searchParams.get("priority") || undefined

    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }
    if (priority) {
      query.priority = priority
    }

    // Get all tickets with pagination
    const tickets = await SupportTicket.find(query)
      .populate("userId", "fullName phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

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
