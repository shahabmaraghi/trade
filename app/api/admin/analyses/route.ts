import { NextResponse, type NextRequest } from "next/server"
import { Analysis } from "@/models"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Get analyses with pagination
    const analyses = await Analysis.find({})
      .populate("authorId", "fullName role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Analysis.countDocuments({})

    return NextResponse.json({
      analyses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching analyses:", error)
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get request body
    const body = await req.json()

    // Create new analysis
    const analysis = new Analysis({
      title: body.title,
      description: body.description,
      image: body.image,
      authorId: body.authorId,
      type: body.type,
      isPremium: body.isPremium,
      tags: body.tags,
    })

    await analysis.save()

    // Populate author information
    await analysis.populate("authorId", "fullName role")

    return NextResponse.json(
      {
        message: "Analysis created successfully",
        analysis,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating analysis:", error)
    return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 })
  }
}
