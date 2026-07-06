import { NextResponse } from "next/server"
import { connectDBOr503 } from "@/lib/db"

export const dynamic = "force-dynamic"

function getMongoHostHint(): string | null {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) return null

  try {
    const normalized = uri.replace(/^mongodb\+srv:/, "https:").replace(/^mongodb:/, "http:")
    const url = new URL(normalized)
    return `${url.hostname}:${url.port || "27017"}`
  } catch {
    return "invalid-uri-format"
  }
}

export async function GET() {
  const env = {
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    hasMongoUri: Boolean(process.env.MONGODB_URI?.trim()),
    mongoHost: getMongoHostHint(),
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
