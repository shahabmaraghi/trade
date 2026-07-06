import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Analysis } from "@/models"
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

    // Get analyses created by the user
    const analyses = await Analysis.find({ authorId: userData.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Analysis.countDocuments({ authorId: userData.id })

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
    console.error("Error fetching user analyses:", error)
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
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
    const { title, description, image, type, tags, isPremium } = data

    // Create new analysis
    const analysis = new Analysis({
      title,
      description,
      image: image || "/placeholder.svg",
      authorId: userData.id,
      type: type || "technical",
      tags: tags || [],
      isPremium: isPremium || false,
    })

    await analysis.save()

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis._id,
        title: analysis.title,
        description: analysis.description,
        image: analysis.image,
        type: analysis.type,
        tags: analysis.tags,
        isPremium: analysis.isPremium,
        createdAt: analysis.createdAt,
      },
    })
  } catch (error) {
    console.error("Error creating analysis:", error)
    return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 })
  }
}
