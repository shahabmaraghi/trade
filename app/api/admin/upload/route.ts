import { type NextRequest, NextResponse } from "next/server"
import { uploadFileToS3 } from "@/lib/s3"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read the file as buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename
    const fileExtension = file.name.split(".").pop() || ""
    const fileName = `uploads/consultants/${randomUUID()}.${fileExtension}`

    // Upload to Liara S3
    const url = await uploadFileToS3(buffer, fileName, file.type)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
