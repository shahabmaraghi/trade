import mongoose, { Schema, type Document } from "mongoose"

// Define the schedule interface
interface TimeRange {
  start: string
  end: string
}

interface Schedule {
  [key: string]: TimeRange
}

// Define the consultant interface
export interface IConsultant extends Document {
  name: string
  specialty: string
  bio: string
  image?: string
  rating: number
  fee: number // Add fee field
  schedule: Schedule
  offlineAvailable: boolean
  onlineAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

// Create the consultant schema
const consultantSchema = new Schema<IConsultant>(
  {
    name: {
      type: String,
      required: [true, "Consultant name is required"],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, "Specialty is required"],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
    },
    image: {
      type: String,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    fee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      default: 0,
    },
    schedule: {
      type: Map,
      of: {
        start: String,
        end: String,
      },
      default: {},
    },
    offlineAvailable: {
      type: Boolean,
      default: true,
    },
    onlineAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Create indexes for better query performance
consultantSchema.index({ specialty: 1 })
consultantSchema.index({ offlineAvailable: 1 })
consultantSchema.index({ onlineAvailable: 1 })

// Export the model
export const Consultant = mongoose.models.Consultant || mongoose.model<IConsultant>("Consultant", consultantSchema)
