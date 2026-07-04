import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for user statistics
 */
interface UserStats {
  total: number
  new: number
  active: number
}

/**
 * Interface for subscription statistics
 */
interface SubscriptionStats {
  total: number
  active: number
  expired: number
  revenue: number
}

/**
 * Interface for content statistics
 */
interface ContentStats {
  totalPosts: number
  totalAnalyses: number
  newPosts: number
  newAnalyses: number
}

/**
 * Interface for engagement statistics
 */
interface EngagementStats {
  pageViews: number
  likes: number
  comments: number
}

/**
 * Interface for DashboardStats document
 */
export interface IDashboardStats extends Document {
  date: Date
  userStats: UserStats
  subscriptionStats: SubscriptionStats
  contentStats: ContentStats
  engagementStats: EngagementStats
  createdAt: Date
  updatedAt: Date
}

/**
 * Dashboard Stats Schema
 * Stores aggregated statistics for the dashboard
 */
const dashboardStatsSchema = new Schema<IDashboardStats>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    userStats: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
    },
    subscriptionStats: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      expired: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },
    contentStats: {
      totalPosts: { type: Number, default: 0 },
      totalAnalyses: { type: Number, default: 0 },
      newPosts: { type: Number, default: 0 },
      newAnalyses: { type: Number, default: 0 },
    },
    engagementStats: {
      pageViews: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
)

// Index for faster queries
dashboardStatsSchema.index({ date: -1 })

// Check if model exists before creating
export const DashboardStats =
  mongoose.models.DashboardStats || mongoose.model<IDashboardStats>("DashboardStats", dashboardStatsSchema)
