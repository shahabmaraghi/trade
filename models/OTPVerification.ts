import mongoose, { Schema, type Document } from "mongoose"

export interface IOTPVerification extends Document {
  phone: string
  code: string
  createdAt: Date
  expiresAt: Date
}

const otpVerificationSchema = new Schema<IOTPVerification>({
  phone: {
    type: String,
    required: true,
    match: [/^09\d{9}$/, "Please provide a valid Iranian phone number"],
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120, // TTL of 2 minutes (120 seconds)
  },
  expiresAt: {
    type: Date,
    required: true,
  },
})

// Create indexes for faster queries
otpVerificationSchema.index({ phone: 1 })
otpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 }) // Ensure TTL index

export const OTPVerification =
  mongoose.models.OTPVerification || mongoose.model<IOTPVerification>("OTPVerification", otpVerificationSchema)
