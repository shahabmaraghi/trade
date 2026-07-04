import { type NextRequest, NextResponse } from "next/server"
import { Analysis, User } from "@/models"

export async function GET(req: NextRequest) {
  try {

    const searchParams = req.nextUrl.searchParams
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "9")))
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    // Add search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i")
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { tags: { $in: [searchRegex] } }]
    }

    // Add type filter
    if (type && ["technical", "fundamental", "market", "other"].includes(type)) {
      query.type = type
    }

    // Get total count first for pagination
    const total = await Analysis.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // If requested page is greater than total pages, return page 1
    const actualPage = page > totalPages && totalPages > 0 ? 1 : page
    const actualSkip = (actualPage - 1) * limit

    // Get analyses with pagination
    const analyses = await Analysis.find(query).sort({ createdAt: -1 }).skip(actualSkip).limit(limit).lean()

    // Fetch author information for each analysis
    const analysesWithAuthors = await Promise.all(
      analyses.map(async (analysis) => {
        const author = await User.findById(analysis.authorId).select("fullName image").lean()
        return {
          ...analysis,
          author: author
            ? {
              name: author.fullName,
              image: author.image || `/placeholder.svg?height=40&width=40&query=user avatar`,
            }
            : {
              name: "کاربر پلاس چارت",
              image: `/placeholder.svg?height=40&width=40&query=user avatar`,
            },
        }
      }),
    )

    return NextResponse.json({
      analyses: analysesWithAuthors,
      pagination: {
        total,
        page: actualPage,
        limit,
        pages: totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching analyses:", error)
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
  }
}
