import mongoose, { Schema, type Document, type Model } from "mongoose"

export type DepositStatus = "pending" | "approved" | "rejected"
export type RequesterType = "user" | "mentor"

export interface IDepositRequest extends Document {
  requesterType: RequesterType
  requesterId: mongoose.Types.ObjectId
  amount: number
  status: DepositStatus
  createdAt: Date
  updatedAt: Date
}

const DepositRequestSchema = new Schema<IDepositRequest>(
  {
    requesterType: { type: String, enum: ["user", "mentor"], required: true },
    requesterId: { type: Schema.Types.ObjectId, required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true },
)

export const DepositRequest: Model<IDepositRequest> =
  mongoose.models.DepositRequest || mongoose.model<IDepositRequest>("DepositRequest", DepositRequestSchema)
