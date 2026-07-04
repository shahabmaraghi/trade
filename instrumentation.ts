export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {

    const { connectDB } = await import('./lib/db');

    // Dynamically import all Mongoose models
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
  }
}
