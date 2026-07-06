import { NextResponse } from "next/server"
import { connectDBOr503 } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const env = {
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    hasMongoUri: Boolean(process.env.MONGODB_URI?.trim()),
    hasJwtSecret: Boolean(process.env.JWT_SECRET?.trim()),
    hasSmsApiKey: Boolean(process.env.SMS_API_KEY?.trim()),
  }

  const dbError = await connectDBOr503()
  if (dbError) {
    const body = await dbError.json()
    return NextResponse.json(
      {
        ok: false,
        db: "error",
        env,
        ...body,
      },
      { status: 503 },
    )
  }

  return NextResponse.json({
    ok: true,
    db: "connected",
    env,
  })
}
