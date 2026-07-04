import mongoose, { Schema, type Document } from "mongoose"

// Define the reservation interface
export interface IReservation extends Document {
  userId: mongoose.Types.ObjectId
  consultantId: mongoose.Types.ObjectId
  date: Date
  time: string
  type: "online" | "offline"
  status: "pending" | "confirmed" | "cancelled" | "completed"
  paymentStatus: "pending" | "paid" | "failed"
  paymentAmount: number
  paymentTransactionId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Create the reservation schema
const reservationSchema = new Schema<IReservation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    consultantId: {
      type: Schema.Types.ObjectId,
      ref: "Consultant",
      required: [true, "Consultant ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      // Validate time format (HH:MM)
      validate: {
        validator: (v: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
        message: "Time must be in HH:MM format",
      },
    },
    type: {
      type: String,
      enum: ["online", "offline"],
      required: [true, "Reservation type is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      required: [true, "Payment amount is required"],
      default: 0,
    },
    paymentTransactionId: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true },
)

// Create indexes for better query performance
reservationSchema.index({ userId: 1 })
reservationSchema.index({ consultantId: 1 })
reservationSchema.index({ date: 1 })
reservationSchema.index({ status: 1 })
reservationSchema.index({ paymentStatus: 1 })

// Export the model
export const Reservation = mongoose.models.Reservation || mongoose.model<IReservation>("Reservation", reservationSchema)
