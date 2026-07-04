import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IChartState extends Document {
  userId: mongoose.Types.ObjectId // mentorId
  name: string
  chartData: any
  symbol: string
  interval: string
  createdAt: Date
  updatedAt: Date
}

const ChartStateSchema = new Schema<IChartState>({
  userId: { // mentorId
    type: Schema.Types.ObjectId,
    ref: "Mentor",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  chartData: {
    type: Schema.Types.Mixed,
    required: true,
  },
  symbol: {
    required: true,
    type: String,
    default: "BTCUSDT",
  },
  interval: {
    required: true,
    type: String,
    default: "1D",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

ChartStateSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

const ChartState: Model<IChartState> =
  mongoose.models.ChartState || mongoose.model<IChartState>("ChartState", ChartStateSchema)

export default ChartState
