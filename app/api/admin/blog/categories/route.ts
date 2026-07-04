import { connectToDatabase } from "@/lib/db"
import { BlogCategory } from "@/models/BlogCategory"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated, isAdmin } from "@/lib/access-control"

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get query parameters for pagination and filtering
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    // Build query
    const query = search ? { name: { $regex: search, $options: "i" } } : {}

    // Get categories with pagination
    const categories = await BlogCategory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Get total count for pagination
    const total = await BlogCategory.countDocuments(query)

    return NextResponse.json({
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching blog categories:", error)
    return NextResponse.json({ error: "Failed to fetch blog categories" }, { status: 500 })
  }
}

// POST new category
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await isAuthenticated(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin access
    const adminCheck = await isAdmin(authResult.user)
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    await connectToDatabase()

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if slug already exists
    const existingCategory = await BlogCategory.findOne({ slug: data.slug })
    if (existingCategory) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 })
    }

    // Create new category
    const newCategory = new BlogCategory(data)
    await newCategory.save()

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error: any) {
    console.error("Error creating blog category:", error)
    return NextResponse.json({ error: "Failed to create blog category" }, { status: 500 })
  }
}
