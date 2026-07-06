import { connectDB } from "@/lib/db"
import { NextResponse, type NextRequest } from "next/server"
import { Analysis } from "@/models"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    // Check if user is authenticated and is admin
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = (await params).id

    // Find analysis by ID
    const analysis = await Analysis.findById(id).populate("authorId", "fullName role")

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    // Check if user is authenticated and is admin
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = (await params).id
    const body = await req.json()

    // Find and update analysis
    const analysis = await Analysis.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description,
        image: body.image,
        authorId: body.authorId,
        likes: body.likes,
        type: body.type,
        isPremium: body.isPremium,
        tags: body.tags,
      },
      { new: true },
    ).populate("authorId", "fullName role")

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Analysis updated successfully",
      analysis,
    })
  } catch (error) {
    console.error("Error updating analysis:", error)
    return NextResponse.json({ error: "Failed to update analysis" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    // Check if user is authenticated and is admin
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = (await params).id

    // Find and delete analysis
    const analysis = await Analysis.findByIdAndDelete(id)

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Analysis deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting analysis:", error)
    return NextResponse.json({ error: "Failed to delete analysis" }, { status: 500 })
  }
}
