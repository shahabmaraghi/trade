import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Analysis, User } from "@/models"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()


    const id = (await params).id
    const analysis = await Analysis.findById(id).lean()

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    // Get author information
    const author = await User.findById(analysis.authorId).select("fullName image").lean()

    return NextResponse.json({
      ...analysis,
      author: author
        ? {
            name: author.fullName,
            image: author.image || `/placeholder.svg?height=40&width=40&query=user avatar`,
          }
        : null,
    })
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
  }
}
