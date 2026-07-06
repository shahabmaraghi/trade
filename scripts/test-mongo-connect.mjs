import fs from "fs"
import mongoose from "mongoose"

const env = fs.readFileSync(".env", "utf8")
const line = env.split(/\r?\n/).find((l) => l.startsWith("MONGODB_URI="))
const uri = line?.slice("MONGODB_URI=".length).trim().replace(/^["']|["']$/g, "")

if (!uri) {
  console.error("No MONGODB_URI")
  process.exit(1)
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  console.log("OK connected to", mongoose.connection.host)
  await mongoose.disconnect()
} catch (error) {
  console.error("FAIL", error instanceof Error ? error.message : error)
  process.exit(1)
}
