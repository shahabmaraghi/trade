import mongoose, { Schema, type Document, type Model } from "mongoose"
import bcrypt from "bcryptjs"

export interface IMentor extends Document {
  username: string
  password: string
  name: string
  referral_percent: number
  referralCode: string
  wallet: number
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export const generalMentorUsername = "general";

const MentorSchema = new Schema<IMentor>({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  referralCode: {
    type: String,
    unique: true,
    trim: true,
  },
  wallet: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  referral_percent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
})

// Hash password before saving
MentorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare passwords
MentorSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

const Mentor: Model<IMentor> = mongoose.models.Mentor || mongoose.model<IMentor>("Mentor", MentorSchema)

export default Mentor
