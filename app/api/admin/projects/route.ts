import { connectDB } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Project } from "@/models"
import { getAdminFromSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const admin = await getAdminFromSession()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const query = status ? { status } : {}

    const projects = await Project.find(query).populate("user", "name email phone").sort({ created_at: -1 })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
