import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/access-control"
import { v4 as uuidv4 } from "uuid"
import { uploadFileToS3 } from "@/lib/s3"

// POST for image upload
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await isAuthenticated(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 },
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename with original extension
    const originalName = file.name
    const extension = originalName.split(".").pop()
    const filename = `blog/${uuidv4()}.${extension}`

    // Upload to Liara S3
    const fileUrl = await uploadFileToS3(buffer, filename, file.type)

    return NextResponse.json({ url: fileUrl })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
