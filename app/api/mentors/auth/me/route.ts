import { NextResponse } from "next/server"
import { getSession } from "@/lib/mentors/auth"
import Mentor from "@/models/Mentor"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get mentor details including referral code
    const mentor = await Mentor.findById(session.userId).select('name username referralCode')

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        username: session.username,
        name: session.name,
        referralCode: mentor.referralCode,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
