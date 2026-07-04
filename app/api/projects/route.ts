import { type NextRequest, NextResponse } from "next/server"
import { Project, User } from "@/models"

export async function GET(req: NextRequest) {
  try {

    const searchParams = req.nextUrl.searchParams
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "9")))
    const search = searchParams.get("search")
    const skip = (page - 1) * limit

    // Build query - only show approved, rejected, or caution projects (not pending)
    const query: any = {
      status: { $in: ["approved", "rejected", "caution"] },
    }

    // Add search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i")
      query.$or = [
        { platform_name: searchRegex },
        { platform_website: searchRegex },
        { user_description: searchRegex },
        { admin_description: searchRegex },
      ]
    }

    // Get total count first for pagination
    const total = await Project.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // If requested page is greater than total pages, return page 1
    const actualPage = page > totalPages && totalPages > 0 ? 1 : page
    const actualSkip = (actualPage - 1) * limit

    // Get projects with pagination
    const projects = await Project.find(query).sort({ created_at: -1 }).skip(actualSkip).limit(limit).lean()

    // Fetch user information for each project
    const projectsWithUsers = await Promise.all(
      projects.map(async (project) => {
        const user = await User.findById(project.user).select("fullName image").lean()
        return {
          ...project,
          user: user
            ? {
              name: user.fullName,
              // @ts-ignore
              image: user.image || `/placeholder.svg?height=40&width=40&query=user avatar`,
            }
            : {
              name: "کاربر پلاس چارت",
              image: `/placeholder.svg?height=40&width=40&query=user avatar`,
            },
        }
      }),
    )

    return NextResponse.json({
      projects: projectsWithUsers,
      pagination: {
        total,
        page: actualPage,
        limit,
        pages: totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
