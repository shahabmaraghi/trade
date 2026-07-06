import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Project } from "@/models"
import { getUserFromSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await Project.findOne({
      _id: (await params).id,
      user: user._id,
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
