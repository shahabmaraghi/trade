import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for SubscriptionPlan document
 */
export interface ISubscriptionPlan extends Document {
  name: string
  price: number
  durationDays: number
  durationHours: number // Add hours field
  features: string[]
  isFree: boolean // Changed from isDefault
  isActive: boolean
  permittedPaths: string[] // Add this field for path permissions
  createdAt: Date
  updatedAt: Date
}

/**
 * SubscriptionPlan Schema
 * Represents subscription plans available to users
 */
const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Plan price is required"],
      min: 0,
    },
    durationDays: {
      type: Number,
      required: [true, "Plan duration days is required"],
      min: 0,
    },
    durationHours: {
      type: Number,
      required: [true, "Plan duration hours is required"],
      min: 0,
      default: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    permittedPaths: {
      type: [String],
      default: [],
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Index for faster queries
subscriptionPlanSchema.index({ isFree: 1 })
subscriptionPlanSchema.index({ isActive: 1 })

// Check if model exists before creating
export const SubscriptionPlan =
  mongoose.models.SubscriptionPlan || mongoose.model<ISubscriptionPlan>("SubscriptionPlan", subscriptionPlanSchema)
