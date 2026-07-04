import mongoose, { type Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"

/**
 * Interface for User document
 */
export interface IUser extends Document {
  phone: string
  fullName?: string
  password?: string
  referrer?: string
  referralCode: string
  wallet?: number
  mentorReferrer?: string
  role: "admin" | "user"
  subscriptionPlan: mongoose.Types.ObjectId
  subscriptionExpiry?: Date
  createdAt: Date
  lastLogin?: Date
  updatedAt: Date
  email?: string
  avatarUrl?: string
  comparePassword: (candidatePassword: string) => Promise<boolean>
}

/**
 * User Schema
 * Represents users in the system with authentication and profile information
 */
const userSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^09\d{9}$/, "Please provide a valid Iranian phone number"],
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      // Password is required for admin users, optional for regular users
      validate: {
        validator: function (this: IUser, value: string) {
          // If role is admin, password is required
          return this.role !== "admin" || (value && value.length >= 6)
        },
        message: "Password is required for admin users and must be at least 6 characters",
      },
    },
    referrer: {
      type: String,
      trim: true,
    },
    mentorReferrer: {
      type: String,
      trim: true,
    },
    referralCode: {
      type: String,
      trim: true,
      unique: true,
    },
    wallet: {
      type: Number,
      default: 0,
      min: 0,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    subscriptionPlan: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    subscriptionExpiry: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password") || !this.password) return next()

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10)
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // If no password is set, authentication fails
  if (!this.password) return false

  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    return false
  }
}

// Index for faster queries
userSchema.index({ phone: 1 })
userSchema.index({ fullName: 1 })
userSchema.index({ role: 1 })
userSchema.index({ subscriptionPlan: 1 })
userSchema.index({ referralCode: 1 }, { unique: true })

// Check if model exists before creating
export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema)
