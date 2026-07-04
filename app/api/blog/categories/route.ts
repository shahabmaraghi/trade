import { connectToDatabase } from "@/lib/db"
import { BlogCategory } from "@/models/BlogCategory"
import { type NextRequest, NextResponse } from "next/server"

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get categories
    const categories = await BlogCategory.find().sort({ name: 1 }).lean()

    return NextResponse.json({
      categories,
    })
  } catch (error: any) {
    console.error("Error fetching blog categories:", error)
    return NextResponse.json({ error: "Failed to fetch blog categories" }, { status: 500 })
  }
}
