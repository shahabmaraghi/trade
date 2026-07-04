import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export interface SessionData {
  userId: string
  username: string
  name: string
}

export async function createSession(data: SessionData) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set("mentor-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return token
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("mentor-session")

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token.value, secret)
    return payload as SessionData
  } catch (error) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("mentor-session")
}
