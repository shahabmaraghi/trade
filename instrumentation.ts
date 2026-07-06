export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { connectDB } = await import("./lib/db")
      await connectDB()
    } catch (error) {
      console.error("Failed to initialize database during startup:", error)
    }
  }
}
