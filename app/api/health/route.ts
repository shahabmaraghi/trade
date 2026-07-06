import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const env = {
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    hasMongoUri: Boolean(process.env.MONGODB_URI?.trim()),
    hasJwtSecret: Boolean(process.env.JWT_SECRET?.trim()),
    hasSmsApiKey: Boolean(process.env.SMS_API_KEY?.trim()),
  }

  try {
    await connectDB()
    return NextResponse.json({
      ok: true,
      db: "connected",
      env,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        db: "error",
        env,
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    )
  }
}
