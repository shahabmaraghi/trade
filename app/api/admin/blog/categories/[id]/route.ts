import { connectToDatabase } from "@/lib/db"
import { BlogCategory } from "@/models/BlogCategory"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated, isAdmin } from "@/lib/access-control"
import mongoose from "mongoose"

// GET a specific category by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID format" }, { status: 400 })
    }

    const category = await BlogCategory.findById(id).lean()

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error: any) {
    console.error("Error fetching blog category:", error)
    return NextResponse.json({ error: "Failed to fetch blog category" }, { status: 500 })
  }
}

// PUT (update) a category
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const data = await request.json()

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID format" }, { status: 400 })
    }

    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if slug already exists (excluding current category)
    const existingCategory = await BlogCategory.findOne({
      slug: data.slug,
      _id: { $ne: id },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 })
    }

    // Update category
    const updatedCategory = await BlogCategory.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(updatedCategory)
  } catch (error: any) {
    console.error("Error updating blog category:", error)
    return NextResponse.json({ error: "Failed to update blog category" }, { status: 500 })
  }
}

// DELETE a category
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID format" }, { status: 400 })
    }

    const deletedCategory = await BlogCategory.findByIdAndDelete(id)

    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting blog category:", error)
    return NextResponse.json({ error: "Failed to delete blog category" }, { status: 500 })
  }
}
