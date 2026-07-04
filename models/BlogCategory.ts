import mongoose, { type Document, Schema } from "mongoose"

/**
 * Interface for BlogCategory document
 */
export interface IBlogCategory extends Document {
  name: string
  slug: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * BlogCategory Schema
 * Represents categories for blog posts
 */
const blogCategorySchema = new Schema<IBlogCategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Index for faster queries
blogCategorySchema.index({ slug: 1 })

// Check if model exists before creating
export const BlogCategory =
  (mongoose.models.BlogCategory as mongoose.Model<IBlogCategory>) || mongoose.model<IBlogCategory>("BlogCategory", blogCategorySchema)
