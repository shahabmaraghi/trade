/**
 * Database connection state
 */
interface ConnectionState {
  isConnected: boolean
}

/**
 * Track connection state
 */
const connection: ConnectionState = {
  isConnected: false,
}

let mongoose: typeof import('mongoose') | null = null;
let isInitialized = false;

/**
 * Initialize mongoose (server-side only)
 */
async function initMongoose() {
  if (typeof window !== 'undefined') {
    // Client-side - return null or mock
    return null;
  }
  
  if (!mongoose && !isInitialized) {
    isInitialized = true;
    try {
      // Dynamic import for server-side only
      mongoose = await import('mongoose');
      
      // Set up emitWarning if needed
      if (typeof process.emitWarning !== "function") {
        process.emitWarning = (warning: string | Error, ...args: any[]) => {
          console.warn(warning, ...args)
        }
      }
      
      // Set mongoose options
      mongoose.set("strictQuery", true);
    } catch (error) {
      console.error("Failed to import mongoose:", error);
    }
  }
  return mongoose;
}

/**
 * Connect to MongoDB (server-side only)
 */
export async function connectDB(): Promise<void> {
  // Don't attempt to connect on client side
  if (typeof window !== 'undefined') {
    return;
  }

  // Check if we are in build/prerendering environment
  const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isBuildTime) {
    console.log("Skipping MongoDB connection during build phase")
    return
  }

  // Check if we're already connected
  if (connection.isConnected) {
    console.log("Already connected to MongoDB")
    return
  }

  // Initialize mongoose
  const mongooseInstance = await initMongoose();
  if (!mongooseInstance) {
    console.log("Mongoose not available (client-side or failed to import)")
    return;
  }

  // Check if we have a cached connection
  if (mongooseInstance.connections.length > 0) {
    connection.isConnected = mongooseInstance.connections[0].readyState === 1
    if (connection.isConnected) {
      console.log("Using existing MongoDB connection")
      return
    }
  }

  // try {
  //   const db = await mongooseInstance.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/TChart")
  //   connection.isConnected = db.connections[0].readyState === 1
  //   console.log(`MongoDB Connected: ${db.connection.host}`)
  // } catch (error) {
  //   console.error("Error connecting to MongoDB:", error)
  //   throw error
  // }
}

export const connectToDatabase: () => Promise<void> = connectDB

/**
 * Disconnect from MongoDB (server-side only)
 */
export async function disconnectDB(): Promise<void> {
  if (typeof window !== 'undefined') {
    return;
  }

  if (!connection.isConnected) {
    return
  }

  const mongooseInstance = await initMongoose();
  if (!mongooseInstance) {
    return;
  }

  // Only disconnect in production to avoid connection overhead in development
  if (process.env.NODE_ENV === "production") {
    await mongooseInstance.disconnect()
    connection.isConnected = false
    console.log("Disconnected from MongoDB")
  }
}

/**
 * Get mongoose instance (server-side only)
 */
export async function getMongoose() {
  return initMongoose();
}