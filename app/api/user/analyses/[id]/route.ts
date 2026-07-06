import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Analysis } from "@/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = (await params).id
    const analysis = await Analysis.findOne({ _id: id, authorId: userData.id })

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: analysis._id,
      title: analysis.title,
      description: analysis.description,
      image: analysis.image,
      type: analysis.type,
      tags: analysis.tags,
      isPremium: analysis.isPremium,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = (await params).id
    const data = await req.json()
    const { title, description, image, type, tags, isPremium } = data

    // Find and update the analysis
    const analysis = await Analysis.findOneAndUpdate(
      { _id: id, authorId: userData.id },
      {
        title,
        description,
        image: image || "/placeholder.svg",
        type: type || "technical",
        tags: tags || [],
        isPremium: isPremium || false,
      },
      { new: true },
    )

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found or not authorized" }, { status: 404 })
    }

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
        updatedAt: analysis.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error updating analysis:", error)
    return NextResponse.json({ error: "Failed to update analysis" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = (await params).id
    const analysis = await Analysis.findOneAndDelete({ _id: id, authorId: userData.id })

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting analysis:", error)
    return NextResponse.json({ error: "Failed to delete analysis" }, { status: 500 })
  }
}
