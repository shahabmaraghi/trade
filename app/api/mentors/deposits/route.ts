import { type NextRequest, NextResponse } from "next/server"
import { DepositRequest, Mentor } from "@/models"
import { getSession } from "@/lib/mentors/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const mentor = await Mentor.findById(session.userId).select("wallet")
    const requests = await DepositRequest.find({ requesterType: "mentor", requesterId: session.userId })
      .sort({ createdAt: -1 })
      .lean()

    const hasPending = requests.some((r) => r.status === "pending")
    return NextResponse.json({ wallet: mentor?.wallet || 0, hasPending, requests })
  } catch (error) {
    console.error("Error fetching mentor deposits:", error)
    return NextResponse.json({ error: "Failed to fetch deposit requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { amount } = await req.json()
    const amt = Math.floor(Number(amount) || 0)
    if (amt < 200_000) return NextResponse.json({ error: "min_200000" }, { status: 400 })

    const mentor = await Mentor.findById(session.userId).select("wallet")
    if (!mentor) return NextResponse.json({ error: "mentor_not_found" }, { status: 404 })

    const existingPending = await DepositRequest.findOne({ requesterType: "mentor", requesterId: mentor._id, status: "pending" })
    if (existingPending) {
      return NextResponse.json({ error: "pending_exists" }, { status: 400 })
    }

    if ((mentor.wallet || 0) < amt) {
      return NextResponse.json({ error: "insufficient_wallet" }, { status: 400 })
    }

    const dr = await DepositRequest.create({
      requesterType: "mentor",
      requesterId: mentor._id,
      amount: amt,
      status: "pending",
    })

    return NextResponse.json({ success: true, request: dr })
  } catch (error) {
    console.error("Error creating mentor deposit request:", error)
    return NextResponse.json({ error: "Failed to create deposit request" }, { status: 500 })
  }
}
