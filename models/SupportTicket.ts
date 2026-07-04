import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for SupportTicket document
 */
export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId
  subject: string
  message: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  responses: {
    message: string
    isAdmin: boolean
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

/**
 * SupportTicket Schema
 * Represents support tickets submitted by users
 */
const supportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    responses: [
      {
        message: {
          type: String,
          required: true,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
)

// Indexes for faster queries
supportTicketSchema.index({ userId: 1 })
supportTicketSchema.index({ status: 1 })
supportTicketSchema.index({ priority: 1 })
supportTicketSchema.index({ createdAt: -1 })

// Check if model exists before creating
export const SupportTicket =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>("SupportTicket", supportTicketSchema)
