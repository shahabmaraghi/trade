import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for BlogPost document
 */
export interface IBlogPost extends Document {
  title: string
  slug: string
  content: string
  categoryId: mongoose.Types.ObjectId
  image: string
  status: "published" | "draft"
  author: mongoose.Types.ObjectId
  viewCount: number
  createdAt: Date
  publishedAt?: Date
  updatedAt: Date
}

/**
 * Blog Post Schema
 * Represents blog articles with rich content
 */
const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Post slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please provide a valid slug"],
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: [true, "Category is required"],
    },
    image: {
      type: String,
      default: "/placeholder.svg",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Indexes for faster queries
blogPostSchema.index({ slug: 1 })
blogPostSchema.index({ categoryId: 1 })
blogPostSchema.index({ status: 1 })
blogPostSchema.index({ author: 1 })
blogPostSchema.index({ createdAt: -1 })

// Pre-save hook to set publishedAt date when status changes to published
blogPostSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

// Check if model exists before creating
export const BlogPost = (mongoose.models.BlogPost as mongoose.Model<IBlogPost>) || mongoose.model<IBlogPost>("BlogPost", blogPostSchema)
