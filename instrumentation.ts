export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return
  }

  try {
    const { connectDB } = await import("./lib/db")

    await import("./models/User")
    await import("./models/Analysis")
    await import("./models/Comment")
    await import("./models/DashboardStats")
    await import("./models/SubscriptionPlan")
    await import("./models/SubscriptionTransaction")
    await import("./models/BlogPost")
    await import("./models/BlogCategory")
    await import("./models/OTPVerification")
    await import("./models/SupportTicket")
    await import("./models/DepositRequest")
    await import("./models/ChartState")
    await import("./models/Mentor")

    await connectDB()
  } catch (error) {
    console.error(
      "Startup database connection failed; API routes will retry on demand:",
      error,
    )
  }
}
