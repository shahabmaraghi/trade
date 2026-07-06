import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { DepositRequest, User, Mentor } from "@/models"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const { id } = await params
    const userData = await getCurrentUser()
    if (!userData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const admin = await isAdmin()
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { action } = await req.json()
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "invalid_action" }, { status: 400 })
    }

    const dr = await DepositRequest.findById(id)
    if (!dr) return NextResponse.json({ error: "not_found" }, { status: 404 })
    if (dr.status !== "pending") {
      return NextResponse.json({ error: "not_pending" }, { status: 400 })
    }

    if (action === "reject") {
      dr.status = "rejected"
      await dr.save()
      return NextResponse.json({ success: true, request: dr })
    }

    // approve: deduct wallet
    if (dr.requesterType === "user") {
      const u = await User.findById(dr.requesterId)
      if (!u) return NextResponse.json({ error: "user_not_found" }, { status: 404 })
      if ((u.wallet || 0) < dr.amount) return NextResponse.json({ error: "insufficient_wallet" }, { status: 400 })
      await User.updateOne({ _id: u._id }, { $inc: { wallet: -dr.amount } })
    } else {
      const m = await Mentor.findById(dr.requesterId)
      if (!m) return NextResponse.json({ error: "mentor_not_found" }, { status: 404 })
      if ((m.wallet || 0) < dr.amount) return NextResponse.json({ error: "insufficient_wallet" }, { status: 400 })
      await Mentor.updateOne({ _id: m._id }, { $inc: { wallet: -dr.amount } })
    }

    dr.status = "approved"
    await dr.save()

    return NextResponse.json({ success: true, request: dr })
  } catch (error) {
    console.error("Error updating deposit request:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
