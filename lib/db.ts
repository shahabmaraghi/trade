interface MongooseCache {
  conn: typeof import("mongoose") | null
  promise: Promise<typeof import("mongoose")> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

function getCache(): MongooseCache {
  if (!global._mongooseCache) {
    global._mongooseCache = { conn: null, promise: null }
  }
  return global._mongooseCache
}

async function getMongooseModule() {
  if (typeof window !== "undefined") {
    return null
  }

  const mongoose = await import("mongoose")

  if (typeof process.emitWarning !== "function") {
    process.emitWarning = (warning: string | Error, ...args: unknown[]) => {
      console.warn(warning, ...args)
    }
  }

  mongoose.set("strictQuery", true)
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

  if (!process.env.MONGODB_URI?.trim()) {
    console.error("MONGODB_URI is not set")
    throw new Error("MONGODB_URI is not configured")
  }

  const mongoose = await getMongooseModule()
  if (!mongoose) {
    throw new Error("Mongoose is not available on the server")
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((instance) => {
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

export async function connectDBOr503(): Promise<Response | null> {
  try {
    await connectDB()
    return null
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error("Database connection failed:", detail)
    return Response.json(
      {
        error: "Database unavailable",
        detail,
        hint:
          detail === "MONGODB_URI is not configured"
            ? "Set MONGODB_URI in Liara environment variables"
            : "Check MongoDB connection string and private network",
      },
      { status: 503 },
    )
  }
}

export const connectToDatabase: () => Promise<void> = connectDB
export const connectToDatabaseOr503 = connectDBOr503

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
  return getMongooseModule()
}
