import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { DepositRequest, User, Mentor } from "@/models"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const userData = await getCurrentUser()
    if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const admin = await isAdmin()
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // optional query filters: status, requesterType
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status") || undefined
    const requesterType = searchParams.get("requesterType") || undefined

    const query: any = {}
    if (status) query.status = status
    if (requesterType) query.requesterType = requesterType

    const items = await DepositRequest.find(query).sort({ createdAt: -1 }).lean()

    // add requester info for UI
    const userIds = items.filter(i => i.requesterType === "user").map(i => i.requesterId)
    const mentorIds = items.filter(i => i.requesterType === "mentor").map(i => i.requesterId)

    const [users, mentors] = await Promise.all([
      userIds.length ? User.find({ _id: { $in: userIds } }).select("fullName phone").lean() : [],
      mentorIds.length ? Mentor.find({ _id: { $in: mentorIds } }).select("name username").lean() : [],
    ])

    const usersMap = new Map(users.map(u => [String(u._id), u]))
    const mentorsMap = new Map(mentors.map(m => [String(m._id), m]))

    const rows = items.map((it) => {
      const extra = it.requesterType === "user" ? usersMap.get(String(it.requesterId)) : mentorsMap.get(String(it.requesterId))
      return {
        ...it,
        id: String((it as any)._id),
        requester: it.requesterType === "user"
          ? { type: "user", name: extra?.fullName || "-", phone: extra?.phone || "-" }
          : { type: "mentor", name: extra?.name || "-", username: extra?.username || "-" },
      }
    })

    return NextResponse.json({ items: rows })
  } catch (error) {
    console.error("Error listing deposits:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
