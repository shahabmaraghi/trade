import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { Project } from "@/models"
import { getUserFromSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await Project.find({ user: user._id }).sort({ created_at: -1 })
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { platform_name, platform_website, user_description } = body

    if (!platform_name || !platform_website || !user_description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const project = new Project({
      user: user._id,
      platform_name,
      platform_website,
      user_description,
      status: "pending",
    })

    await project.save()
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
