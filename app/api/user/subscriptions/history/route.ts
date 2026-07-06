import { connectDBOr503 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUserSubscriptionHistory } from "@/lib/subscription"
import { protectRoute } from "@/lib/access-control"

export async function GET(req: NextRequest) {
    const dbError = await connectDBOr503()
    if (dbError) return dbError
  // Check if user is authenticated
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get subscription history
    const history = await getUserSubscriptionHistory(userData.id)

    return NextResponse.json(history.filter(h => h.status !== "pending"))
  } catch (error) {
    console.error("Error fetching subscription history:", error)
    return NextResponse.json({ error: "Failed to fetch subscription history" }, { status: 500 })
  }
}
