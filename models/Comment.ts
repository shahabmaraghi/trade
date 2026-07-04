import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for Comment document
 */
export interface IComment extends Document {
  content: string
  userId: mongoose.Types.ObjectId
  contentType: "blogPost" | "analysis"
  contentId: mongoose.Types.ObjectId
  isApproved: boolean
  parentId: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Comment Schema
 * Represents user comments on blog posts and analyses
 */
const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    contentType: {
      type: String,
      enum: ["blogPost", "analysis"],
      required: [true, "Content type is required"],
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: [true, "Content ID is required"],
      refPath: "contentType",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true },
)

// Indexes for faster queries
commentSchema.index({ userId: 1 })
commentSchema.index({ contentType: 1, contentId: 1 })
commentSchema.index({ isApproved: 1 })
commentSchema.index({ parentId: 1 })

// Check if model exists before creating
export const Comment = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema)
