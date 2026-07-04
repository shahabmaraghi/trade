import { type NextRequest, NextResponse } from "next/server"
import { Analysis, AnalysisLike } from "@/models"
import { getCurrentUser } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = (await params).id
    const analysis = await Analysis.findById(id)

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    // Check if user has already liked this analysis
    const existingLike = await AnalysisLike.findOne({
      userId: mongoose.Types.ObjectId.createFromHexString(userData.id),
      analysisId: id,
    })

    if (existingLike) {
      // User has already liked this analysis, so unlike it
      await AnalysisLike.deleteOne({ _id: existingLike._id })

      // Decrement likes count using updateOne
      await Analysis.updateOne(
        { _id: id },
        { $inc: { likes: -1 } }
      )

      // Get updated likes count
      const updatedAnalysis = await Analysis.findById(id).select('likes')

      return NextResponse.json({
        success: true,
        liked: false,
        likes: updatedAnalysis?.likes || 0,
      })
    } else {
      // User hasn't liked this analysis yet, so like it
      await AnalysisLike.create({
        userId: mongoose.Types.ObjectId.createFromHexString(userData.id),
        analysisId: id,
      })

      // Increment likes count using updateOne
      await Analysis.updateOne(
        { _id: id },
        { $inc: { likes: 1 } }
      )

      // Get updated likes count
      const updatedAnalysis = await Analysis.findById(id).select('likes').lean()

      return NextResponse.json({
        success: true,
        liked: true,
        likes: updatedAnalysis?.likes || 0,
      })
    }
  } catch (error) {
    console.error("Error handling analysis like:", error)
    return NextResponse.json({ error: "Failed to process like action" }, { status: 500 })
  }
}

// GET endpoint to check if a user has liked an analysis
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ liked: false }, { status: 200 })
    }

    const id = (await params).id

    // Check if user has already liked this analysis
    const existingLike = await AnalysisLike.findOne({
      userId: mongoose.Types.ObjectId.createFromHexString(userData.id),
      analysisId: id,
    })

    return NextResponse.json({
      liked: !!existingLike,
    })
  } catch (error) {
    console.error("Error checking like status:", error)
    return NextResponse.json({ error: "Failed to check like status" }, { status: 500 })
  }
}
