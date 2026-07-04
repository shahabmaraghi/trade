import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for Analysis document
 */
export interface IAnalysis extends Document {
  title: string
  description: string
  image: string
  authorId: mongoose.Types.ObjectId
  likes: number
  type: "technical" | "fundamental" | "market" | "other"
  isPremium: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Analysis Schema
 * Represents financial/market analyses with rich content
 */
const analysisSchema = new Schema<IAnalysis>(
  {
    title: {
      type: String,
      required: [true, "Analysis title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Analysis description is required"],
    },
    image: {
      type: String,
      default: "/placeholder.svg",
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    type: {
      type: String,
      enum: ["technical", "fundamental", "market", "other"],
      default: "technical",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Indexes for faster queries
analysisSchema.index({ authorId: 1 })
analysisSchema.index({ type: 1 })
analysisSchema.index({ isPremium: 1 })
analysisSchema.index({ createdAt: -1 })
analysisSchema.index(
  {
    title: "text",
    description: "text",
    tags: "text",
  },
  {
    weights: {
      title: 10,
      tags: 5,
      description: 1,
    },
    name: "analysis_text_index",
  },
)

// Check if model exists before creating
export const Analysis = (mongoose.models.Analysis as mongoose.Model<IAnalysis>) || mongoose.model<IAnalysis>("Analysis", analysisSchema)
