import { connectToDatabase } from "@/lib/db"
import { BlogPost } from "@/models/BlogPost"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/access-control"

// GET all posts with pagination, filtering, and sorting
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
    }

    if (category) {
      query.categoryId = category
    }

    if (status) {
      query.status = status
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Get posts with pagination
    const posts = await BlogPost.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name slug")
      .populate("author", "name email")
      .lean()

    // Get total count for pagination
    const total = await BlogPost.countDocuments(query)

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}

// POST new post
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await isAuthenticated(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.slug || !data.content || !data.categoryId) {
      return NextResponse.json({ error: "Title, slug, content, and category are required" }, { status: 400 })
    }

    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug: data.slug })
    if (existingPost) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 })
    }

    // Set author to current user
    data.author = authResult.user._id

    // Set publishedAt date if status is published
    if (data.status === "published") {
      data.publishedAt = new Date()
    }

    // Create new post
    const newPost = new BlogPost(data)
    await newPost.save()

    return NextResponse.json(newPost, { status: 201 })
  } catch (error: any) {
    console.error("Error creating blog post:", error)
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 })
  }
}
