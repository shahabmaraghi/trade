import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for SubscriptionTransaction document
 */
export interface ISubscriptionTransaction extends Document {
  userId: mongoose.Types.ObjectId
  planId: mongoose.Types.ObjectId
  amount: number
  status: "pending" | "completed" | "failed" | "refunded"
  paymentMethod: string
  authority: string
  transactionId?: string
  startDate?: Date
  endDate?: Date
  metadata?: Map<string, string>
  createdAt: Date
  updatedAt: Date
}

/**
 * Subscription Transaction Schema
 * Records payment transactions for subscription purchases
 */
const subscriptionTransactionSchema = new Schema<ISubscriptionTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: [true, "Plan ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
    },
    authority: {
      type: String,
      required: [true, "Authority is required"],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true },
)

// Indexes for faster queries
subscriptionTransactionSchema.index({ userId: 1 })
subscriptionTransactionSchema.index({ status: 1 })
subscriptionTransactionSchema.index({ createdAt: -1 })

// Check if model exists before creating
export const SubscriptionTransaction =
  (mongoose.models.SubscriptionTransaction as mongoose.Model<ISubscriptionTransaction>) ||
  mongoose.model<ISubscriptionTransaction>("SubscriptionTransaction", subscriptionTransactionSchema)
