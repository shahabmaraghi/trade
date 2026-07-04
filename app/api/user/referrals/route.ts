import { NextRequest, NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"
import { User } from "@/models"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Load current user document to read referralCode and wallet
    const currentUser = await User.findOne({ _id: user.id })

    // Determine code used for referrals (use referralCode first, fallback to phone for backward compatibility)
    const myReferralCode = currentUser?.referralCode || user.phone

    // Find users who were referred by this user (support both new referralCode and legacy phone-based referrer)
    const referredUsers = await User.find({ referrer: { $in: [myReferralCode, user.phone] } })
      .select("phone fullName createdAt lastLogin")
      .sort({ createdAt: -1 })

    // Calculate stats
    const totalReferrals = referredUsers.length
    const activeReferrals = referredUsers.filter(
      (u) => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length

    const referralStats = {
      totalReferrals,
      activeReferrals,
      referralCode: myReferralCode,
      wallet: currentUser?.wallet || 0,
      referredUsers: referredUsers.map((u) => ({
        id: u._id?.toString(),
        phone: u.phone,
        fullName: u.fullName,
        createdAt: u.createdAt.toISOString(),
        isActive: u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })),
    }

    return NextResponse.json(referralStats)
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}