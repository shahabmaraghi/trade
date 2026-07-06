import { connectDBOr503 } from "@/lib/db"
import { NextResponse, type NextRequest } from "next/server"
import { User } from "@/models"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    // Check if user is authenticated and is admin
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const searchPhone = searchParams.get("phone") || ""
    const searchName = searchParams.get("fullName") || ""

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const normalizeDigits = (str: string) =>
      str
        .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 1776)) // Persian ۰-۹
        .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 1632)) // Arabic ٠-٩
        .replace(/[^0-9]/g, "")

    // Build query
    let query: Record<string, any> = {}
    if (searchPhone || searchName) {
      const and: any[] = []
      if (searchPhone) {
        const phoneQuery = normalizeDigits(searchPhone)
        and.push({ phone: { $regex: `${escapeRegex(phoneQuery)}`, $options: "i" } })
      }
      if (searchName) {
        and.push({ fullName: { $regex: escapeRegex(searchName), $options: "i" } })
      }
      query = and.length ? { $and: and } : {}
    } else if (search) {
      // Existing generic search fallback
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Get users with pagination
    const users = await User.find(query)
      .select("_id fullName email phone role createdAt referrer subscriptionExpiry subscriptionPlan")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "subscriptionPlan", select: "_id name" })
      .lean()

    const refCodes = Array.from(new Set((users as any[]).map((u) => u.referrer).filter(Boolean))) as string[]
    let refMap: Record<string, string> = {}
    if (refCodes.length) {
      const refUsers = await User.find({ referralCode: { $in: refCodes } })
        .select("referralCode fullName")
        .lean()
      refMap = Object.fromEntries(refUsers.map((r: any) => [r.referralCode, r.fullName || ""]))
    }

    const usersWithRefName = (users as any[]).map((u) => ({
      ...u,
      referrerName: u.referrer ? refMap[u.referrer] || "" : "",
    }))

    // Get total count for pagination
    const total = await User.countDocuments(query)

    return NextResponse.json({
      users: usersWithRefName,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
