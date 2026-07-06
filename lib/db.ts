interface MongooseCache {
  conn: typeof import("mongoose") | null
  promise: Promise<typeof import("mongoose")> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

let mongoose: typeof import("mongoose") | null = null
let isInitialized = false
let isPatched = false

function getCache(): MongooseCache {
  if (!global._mongooseCache) {
    global._mongooseCache = { conn: null, promise: null }
  }
  return global._mongooseCache
}

function patchMongooseForAutoConnect(mongooseInstance: typeof import("mongoose")) {
  if (isPatched) {
    return
  }

  isPatched = true

  async function withDb<T>(operation: () => Promise<T>): Promise<T> {
    await connectDB()
    return operation()
  }

  const originalQueryExec = mongooseInstance.Query.prototype.exec
  mongooseInstance.Query.prototype.exec = function (...args) {
    return withDb(() => originalQueryExec.apply(this, args))
  }

  const originalAggregateExec = mongooseInstance.Aggregate.prototype.exec
  mongooseInstance.Aggregate.prototype.exec = function (...args) {
    return withDb(() => originalAggregateExec.apply(this, args))
  }

  const originalDocumentSave = mongooseInstance.Document.prototype.save
  mongooseInstance.Document.prototype.save = function (...args) {
    return withDb(() => originalDocumentSave.apply(this, args))
  }

  const originalModelCreate = mongooseInstance.Model.create
  mongooseInstance.Model.create = function (...args) {
    return withDb(() => originalModelCreate.apply(this, args))
  }

  const originalInsertMany = mongooseInstance.Model.insertMany
  mongooseInstance.Model.insertMany = function (...args) {
    return withDb(() => originalInsertMany.apply(this, args))
  }
}

async function initMongoose() {
  if (typeof window !== "undefined") {
    return null
  }

  if (!mongoose && !isInitialized) {
    isInitialized = true
    try {
      mongoose = await import("mongoose")

      if (typeof process.emitWarning !== "function") {
        process.emitWarning = (warning: string | Error, ...args: unknown[]) => {
          console.warn(warning, ...args)
        }
      }

      mongoose.set("strictQuery", true)
      patchMongooseForAutoConnect(mongoose)
    } catch (error) {
      console.error("Failed to import mongoose:", error)
    }
  }

  return mongoose
}

export async function connectDB(): Promise<void> {
  if (typeof window !== "undefined") {
    return
  }

  const isBuildTime =
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"

  if (isBuildTime) {
    return
  }

  const cached = getCache()
  if (cached.conn?.connection.readyState === 1) {
    return
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set")
    throw new Error("MONGODB_URI is not configured")
  }

  const mongooseInstance = await initMongoose()
  if (!mongooseInstance) {
    return
  }

  if (!cached.promise) {
    cached.promise = mongooseInstance.connect(process.env.MONGODB_URI).then((instance) => {
      console.log(`MongoDB Connected: ${instance.connection.host}`)
      return instance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

export const connectToDatabase: () => Promise<void> = connectDB

export async function disconnectDB(): Promise<void> {
  if (typeof window !== "undefined") {
    return
  }

  const cached = getCache()
  if (!cached.conn) {
    return
  }

  if (process.env.NODE_ENV === "production") {
    await cached.conn.disconnect()
    cached.conn = null
    cached.promise = null
    console.log("Disconnected from MongoDB")
  }
}

export async function getMongoose() {
  return initMongoose()
}

if (typeof window === "undefined") {
  void initMongoose()
}
