import { type NextRequest, NextResponse } from "next/server"
import { DepositRequest, User } from "@/models"
import { getCurrentUser } from "@/lib/auth"
import { protectRoute } from "@/lib/access-control"

export async function GET(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const userData = await getCurrentUser()
    if (!userData) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const user = await User.findById(userData.id).select("wallet")
    const requests = await DepositRequest.find({ requesterType: "user", requesterId: userData.id })
      .sort({ createdAt: -1 })
      .lean()

    const hasPending = requests.some((r) => r.status === "pending")
    return NextResponse.json({ wallet: user?.wallet || 0, hasPending, requests })
  } catch (error) {
    console.error("Error fetching user deposits:", error)
    return NextResponse.json({ error: "Failed to fetch deposit requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const userData = await getCurrentUser()
    if (!userData) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { amount } = await req.json()
    const amt = Math.floor(Number(amount) || 0)
    if (amt < 200_000) return NextResponse.json({ error: "min_200000" }, { status: 400 })

    const user = await User.findById(userData.id).select("wallet")
    if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 })

    const existingPending = await DepositRequest.findOne({ requesterType: "user", requesterId: user._id, status: "pending" })
    if (existingPending) {
      return NextResponse.json({ error: "pending_exists" }, { status: 400 })
    }

    if ((user.wallet || 0) < amt) {
      return NextResponse.json({ error: "insufficient_wallet" }, { status: 400 })
    }

    const dr = await DepositRequest.create({
      requesterType: "user",
      requesterId: user._id,
      amount: amt,
      status: "pending",
    })

    return NextResponse.json({ success: true, request: dr })
  } catch (error) {
    console.error("Error creating user deposit request:", error)
    return NextResponse.json({ error: "Failed to create deposit request" }, { status: 500 })
  }
}
