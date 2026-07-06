import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Project } from "@/models"
import { getAdminFromSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const admin = await getAdminFromSession()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await Project.findById((await params).id).populate("user", "name email phone")

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const admin = await getAdminFromSession()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, admin_description } = body

    if (!status || !["pending", "approved", "rejected", "caution"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const project = await Project.findById((await params).id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    project.status = status
    if (admin_description) {
      project.admin_description = admin_description
    }

    await project.save()
    return NextResponse.json(project)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
