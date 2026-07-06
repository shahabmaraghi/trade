import { connectDBOr503 } from "@/lib/db"
import { BlogPost } from "@/models/BlogPost"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated, isAdmin } from "@/lib/access-control"
import mongoose from "mongoose"
import { deleteFileFromS3, isS3Url, extractFileKeyFromUrl } from "@/lib/s3"

// GET a specific post by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const { id } = await params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 })
    }

    const post = await BlogPost.findById(id).populate("categoryId", "name slug").populate("author", "name email").lean()

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error: any) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 })
  }
}

// PUT (update) a post
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const authResult = await isAuthenticated(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const { id } = await params
    const data = await request.json()

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 })
    }

    // Validate required fields
    if (!data.title || !data.slug || !data.content || !data.categoryId) {
      return NextResponse.json({ error: "Title, slug, content, and category are required" }, { status: 400 })
    }

    // Get existing post
    const existingPost = await BlogPost.findById(id).populate("author")

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is author or admin
    const isAuthor =
      typeof existingPost.author === "undefined"
        ? false
        : existingPost.author._id.toString() === authResult.user._id.toString()
    const userIsAdmin = await isAdmin(authResult.user)

    if (!isAuthor && !userIsAdmin) {
      return NextResponse.json({ error: "Forbidden: You can only edit your own posts" }, { status: 403 })
    }

    // Check if slug already exists (excluding current post)
    const slugExists = await BlogPost.findOne({
      slug: data.slug,
      _id: { $ne: id },
    })

    if (slugExists) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 })
    }

    // Set publishedAt date if status is changing to published
    if (data.status === "published" && existingPost.status !== "published") {
      data.publishedAt = new Date()
    }

    // Check if image has changed and delete old image from S3 if needed
    if (data.image && existingPost.image && data.image !== existingPost.image && isS3Url(existingPost.image)) {
      try {
        await deleteFileFromS3(extractFileKeyFromUrl(existingPost.image))
      } catch (error) {
        console.error("Error deleting old image from S3:", error)
        // Continue with update even if image deletion fails
      }
    }

    // Update post
    const updatedPost = await BlogPost.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .populate("categoryId", "name slug")
      .populate("author", "name email")

    return NextResponse.json(updatedPost)
  } catch (error: any) {
    console.error("Error updating blog post:", error)
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 })
  }
}

// DELETE a post
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const authResult = await isAuthenticated(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const { id } = await params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 })
    }

    // Get existing post
    const existingPost = await BlogPost.findById(id)

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is author or admin
    const isAuthor = existingPost.author.toString() === authResult.user._id.toString()
    const userIsAdmin = await isAdmin(authResult.user)

    if (!isAuthor && !userIsAdmin) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own posts" }, { status: 403 })
    }

    // Delete post image from S3 if it exists
    if (existingPost.image && isS3Url(existingPost.image)) {
      try {
        await deleteFileFromS3(extractFileKeyFromUrl(existingPost.image))
      } catch (error) {
        console.error("Error deleting image from S3:", error)
        // Continue with post deletion even if image deletion fails
      }
    }

    // Delete post
    await BlogPost.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "Post deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 })
  }
}
