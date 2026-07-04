import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for AnalysisLike document
 */
export interface IAnalysisLike extends Document {
  userId: mongoose.Types.ObjectId
  analysisId: mongoose.Types.ObjectId
  createdAt: Date
}

/**
 * AnalysisLike Schema
 * Tracks which users have liked which analyses
 */
const analysisLikeSchema = new Schema<IAnalysisLike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: "Analysis",
      required: [true, "Analysis ID is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create a compound index to ensure a user can only like an analysis once
analysisLikeSchema.index({ userId: 1, analysisId: 1 }, { unique: true })

// Create indexes for faster queries
analysisLikeSchema.index({ userId: 1 })
analysisLikeSchema.index({ analysisId: 1 })

// Check if model exists before creating
export const AnalysisLike =
  mongoose.models.AnalysisLike || mongoose.model<IAnalysisLike>("AnalysisLike", analysisLikeSchema)
