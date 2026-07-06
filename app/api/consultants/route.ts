import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Consultant } from "@/models/Consultant"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    await connectDB()


    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const specialty = searchParams.get("specialty")
    const offlineAvailable = searchParams.get("offlineAvailable")
    const onlineAvailable = searchParams.get("onlineAvailable")

    // Build query
    const query: any = { active: true }

    if (specialty) {
      query.specialty = specialty
    }

    if (offlineAvailable) {
      query.offlineAvailable = offlineAvailable === "true"
    }

    if (onlineAvailable) {
      query.onlineAvailable = onlineAvailable === "true"
    }

    // Fetch consultants
    const consultants = await Consultant.find(query).sort({ rating: -1 })

    return NextResponse.json(consultants)
  } catch (error) {
    console.error("Error fetching consultants:", error)
    return NextResponse.json({ error: "Failed to fetch consultants" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()


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

    // Create new consultant
    const consultant = new Consultant({
      ...data,
      rating: 5.0,
      reviewCount: 0,
    })

    await consultant.save()

    return NextResponse.json(consultant, { status: 201 })
  } catch (error) {
    console.error("Error creating consultant:", error)
    return NextResponse.json({ error: "Failed to create consultant" }, { status: 500 })
  }
}
