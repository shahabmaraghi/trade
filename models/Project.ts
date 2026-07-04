import { Schema, model, models, type Document, type Model } from "mongoose"
import type { User } from "./User"

export interface IProject extends Document {
  user: typeof User
  platform_name: string
  platform_website: string
  user_description: string
  admin_description?: string
  status: "pending" | "approved" | "rejected" | "caution"
  created_at: Date
  updated_at: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform_name: {
      type: String,
      required: true,
    },
    platform_website: {
      type: String,
      required: true,
    },
    user_description: {
      type: String,
      required: true,
    },
    admin_description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "caution"],
      default: "pending",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

export const Project: Model<IProject> = models.Project || model<IProject>("Project", ProjectSchema)
