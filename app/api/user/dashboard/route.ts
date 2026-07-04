import { type NextRequest, NextResponse } from "next/server"
import { Analysis, SupportTicket, SubscriptionTransaction } from "@/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const userData = await getCurrentUser()
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user's analyses count
    const analysesCount = await Analysis.countDocuments({ authorId: userData.id })

    // Get user's open support tickets count
    const openTicketsCount = await SupportTicket.countDocuments({
      userId: userData.id,
      status: "open",
    })

    // Get user's latest subscription transaction
    const latestTransaction = await SubscriptionTransaction.findOne({
      userId: userData.id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .populate("planId")
      .lean()

    // Get user's recent analyses
    const recentAnalyses = await Analysis.find({ authorId: userData.id }).sort({ createdAt: -1 }).limit(5).lean()

    // Get user's recent support tickets
    const recentTickets = await SupportTicket.find({ userId: userData.id }).sort({ createdAt: -1 }).limit(5).lean()

    return NextResponse.json({
      stats: {
        analysesCount,
        openTicketsCount,
        subscription: latestTransaction
          ? {
              plan: latestTransaction.planId,
              expiryDate: latestTransaction.endDate,
              isActive: latestTransaction.endDate ? new Date(latestTransaction.endDate) > new Date() : false,
            }
          : null,
      },
      recentAnalyses,
      recentTickets,
    })
  } catch (error) {
    console.error("Error fetching user dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
