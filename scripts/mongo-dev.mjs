import { MongoMemoryServer } from "mongodb-memory-server"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, "..", ".mongodb", "data")
const port = Number(process.env.MONGO_PORT || 27017)

fs.mkdirSync(dbPath, { recursive: true })

const mongod = await MongoMemoryServer.create({
  instance: {
    port,
    dbPath,
    ip: "127.0.0.1",
  },
})

const uri = mongod.getUri("TChart")
console.log(`Local MongoDB running at ${uri}`)
console.log(`Data directory: ${dbPath}`)
console.log("Press Ctrl+C to stop.")

const shutdown = async () => {
  await mongod.stop()
  process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
