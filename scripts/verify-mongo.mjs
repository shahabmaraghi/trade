import mongoose from "mongoose"

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/TChart"

try {
  await mongoose.connect(uri)
  console.log(`Connected to MongoDB: ${mongoose.connection.host}`)
  await mongoose.disconnect()
  process.exit(0)
} catch (error) {
  console.error("MongoDB connection failed:", error.message)
  process.exit(1)
}
