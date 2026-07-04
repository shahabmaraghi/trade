import { User, SubscriptionPlan, SubscriptionTransaction, Mentor } from "@/models"

/**
 * Get all active subscription plans
 */
export async function getSubscriptionPlans() {
  return await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 })
}

/**
 * Get a subscription plan by ID
 */
export async function getSubscriptionPlanById(planId: string) {
  return await SubscriptionPlan.findById(planId)
}

/**
 * Subscribe user to a plan
 */
export async function subscribeUserToPlan(
  userId: string,
  planId: string,
  paymentMethod: string,
  transactionId: string,
) {

  try {
    // Get user and plan
    const user = await User.findById(userId)
    const plan = await SubscriptionPlan.findById(planId)

    if (!user || !plan) {
      throw new Error("User or plan not found")
    }

    // Prevent users from purchasing the free plan
    if (plan.isFree && paymentMethod !== "admin") {
      throw new Error("Free plan cannot be purchased")
    }

    // Calculate subscription expiry date
    const now = new Date()
    const expiryDate = new Date(now)
    expiryDate.setDate(now.getDate() + plan.durationDays)
    expiryDate.setHours(now.getHours() + (plan.durationHours || 0))

    // Read pending transaction to capture metadata for referral handling
    const pendingTx = await SubscriptionTransaction.findOne({
      userId: user._id,
      planId: plan._id,
      transactionId,
      status: "pending",
    })

    if (!pendingTx) {
      throw new Error("Pending transaction not found for referral handling")
    }

    const transaction = await SubscriptionTransaction.updateOne(
      {
        _id: pendingTx._id,
      },
      {
        $set: {
          status: "completed",
          paymentMethod,
          startDate: now,
          endDate: expiryDate,
        },
      },
    )

    if (transaction.modifiedCount === 0) {
      throw new Error("Failed to update transaction data")
    }

    // Update user subscription
    user.subscriptionPlan = plan._id
    user.subscriptionExpiry = expiryDate
    await user.save()

    // Handle referral rewards
    const amount = plan.price || 0

    // 1) User referrer: 15%
    const userRefCode = (pendingTx.metadata?.get("userRefCode") as string) || user.referrer
    if (userRefCode && amount > 0) {
      // First try referralCode field, fallback to phone for backward compatibility
      const refUser = await User.findOne({ referralCode: userRefCode }).lean()
      if (refUser && String(refUser._id) !== String(user._id)) {
        const bonus = Math.round(amount * 0.15)
        if (bonus > 0) {
          await User.updateOne({ _id: refUser._id }, { $inc: { wallet: bonus } })
          await SubscriptionTransaction.updateOne(
            { _id: pendingTx._id },
            { $set: { "metadata.userBonus": String(bonus), "metadata.userRefTarget": refUser._id.toString() } },
          )
        }
      }
    }

    // 2) Mentor referrer: mentor.referral_percent%
    const mentorCode = (pendingTx.metadata?.get("mentorCode") as string | undefined) || user.mentorReferrer
    if (mentorCode && amount > 0) {
      const mentor =
        (await Mentor.findOne({ referralCode: mentorCode })) || (await Mentor.findOne({ username: mentorCode }))
      if (mentor) {
        const percent = Math.max(0, Math.min(100, mentor.referral_percent || 0))
        const bonus = Math.round((amount * percent) / 100)
        if (bonus > 0) {
          await Mentor.updateOne({ _id: mentor._id }, { $inc: { wallet: bonus } })
          await SubscriptionTransaction.updateOne(
            { _id: pendingTx._id },
            { $set: { "metadata.mentorBonus": String(bonus), "metadata.mentorRefTarget": String((mentor as any)._id) } },
          )
        }
      }
    }

    return { success: true, transaction, expiryDate }
  } catch (error) {
    console.error("Error subscribing user to plan:", error)
    throw error
  }
}

/**
 * Assign free plan to user (admin only)
 */
export async function assignFreePlanToUser(userId: string, adminId: string) {

  try {
    // Get user and free plan
    const user = await User.findById(userId)
    const freePlan = await SubscriptionPlan.findOne({ isFree: true })

    if (!user) {
      throw new Error("User not found")
    }

    if (!freePlan) {
      throw new Error("Free plan not found")
    }

    // Calculate subscription expiry date
    const now = new Date()
    const expiryDate = new Date(now)
    expiryDate.setDate(now.getDate() + freePlan.durationDays)
    expiryDate.setHours(now.getHours() + (freePlan.durationHours || 0))

    // Create transaction record
    const transaction = new SubscriptionTransaction({
      userId: user._id,
      planId: freePlan._id,
      amount: 0, // Free plan
      status: "completed",
      paymentMethod: "admin",
      transactionId: `admin_${adminId}_${Date.now()}`,
      startDate: now,
      endDate: expiryDate,
    })

    await transaction.save()

    // Update user subscription
    user.subscriptionPlan = freePlan._id
    user.subscriptionExpiry = expiryDate
    await user.save()

    return { success: true, transaction, expiryDate }
  } catch (error) {
    console.error("Error assigning free plan to user:", error)
    throw error
  }
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string) {

  const user = await User.findById(userId).populate("subscriptionPlan")
  if (!user) {
    throw new Error("User not found")
  }

  const isActive = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) > new Date() : false

  return {
    plan: user.subscriptionPlan,
    expiryDate: user.subscriptionExpiry,
    isActive,
  }
}

/**
 * Get user's subscription history
 */
export async function getUserSubscriptionHistory(userId: string) {

  return await SubscriptionTransaction.find({ userId }).populate("planId").sort({ createdAt: -1 })
}

/**
 * Cancel user's subscription (doesn't end current period, just prevents renewal)
 */
export async function cancelSubscription(userId: string) {

  const user = await User.findById(userId)
  if (!user) {
    throw new Error("User not found")
  }

  // Add a metadata field to indicate cancellation
  await SubscriptionTransaction.findOneAndUpdate(
    { userId: user._id, status: "completed" },
    { $set: { "metadata.cancelled": "true" } },
    { sort: { createdAt: -1 } },
  )

  return { success: true }
}
