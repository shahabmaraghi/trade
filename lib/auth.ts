import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"

// Secret key for JWT signing (Edge compatible)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key_for_development")

export interface TokenData {
  /** @deprecated Its ObjectId type*/
  _id: any
  id: string
  phone: string
  role: string
  subscriptionPlan: string
  subscriptionExpiry?: string
  hasActiveSubscription: boolean
  exp?: number // Added expiration time field
}

export async function signToken(payload: TokenData): Promise<string> {
  try {
    // Calculate expiration time (7 days from now)
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7

    // Add exp to the payload
    const tokenPayload = {
      ...payload,
      exp: expirationTime,
    }

    const token = await new SignJWT(tokenPayload as any)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Date.now() / 1000)
      .setExpirationTime(expirationTime) // Use the same expiration time
      .sign(JWT_SECRET)

    return token
  } catch (error) {
    console.error("Error signing token:", error)
    throw new Error("Failed to sign token")
  }
}

const AUTH_COOKIE_NAME = "auth_token"
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function resolveAuthCookieDomain(host?: string): string | undefined {
  if (process.env.NODE_ENV !== "production") {
    return undefined
  }

  const configured = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim()
  if (configured && configured !== "undefined" && configured !== "null") {
    return configured.startsWith(".") ? configured : `.${configured}`
  }

  const hostname = host?.split(":")[0]
  if (hostname?.endsWith("hirmandtrade.ir")) {
    return ".hirmandtrade.ir"
  }

  return undefined
}

export function getAuthCookieOptions(token: string, host?: string) {
  const domain = resolveAuthCookieDomain(host)

  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
    ...(domain ? { domain } : {}),
  }
}

export function applyAuthCookie(response: NextResponse, token: string, host?: string) {
  response.cookies.set(getAuthCookieOptions(token, host))
  return response
}

export function clearAuthCookie(response: NextResponse, host?: string) {
  const domain = resolveAuthCookieDomain(host)

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    sameSite: "lax",
    ...(domain ? { domain } : {}),
  })

  return response
}

export async function verifyToken(token: string): Promise<TokenData | null> {
  try {
    const { payload } = await jwtVerify<TokenData>(token, JWT_SECRET)

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < currentTime) {
      return null // Token has expired
    }

    const ObjectId = await import("bson").then((module) => module.ObjectId)

    return {
      ...payload,
      _id: new ObjectId(payload.id),
    } as TokenData
  } catch {
    return null
  }
}

export async function getAdminFromSession(): Promise<TokenData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) return null

  const userData = await verifyToken(token)

  if (userData?.role !== "admin") {
    return null
  }

  return userData
}

export async function getUserFromSession(): Promise<TokenData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) return null

  return await verifyToken(token)
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const user = await getUserFromSession()
    if (!user) return false
    return !!user.hasActiveSubscription && 
           !!(user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date())
  } catch {
    return false
  }
}

export async function hasPremiumAccess(userId: string): Promise<boolean> {
  // Currently, premium access is equivalent to having an active subscription
  return hasActiveSubscription(userId)
}

export async function getCurrentUser(): Promise<TokenData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) return null

  return await verifyToken(token)
}

export async function isAdmin(): Promise<boolean> {
  const user = await getAdminFromSession()
  return user !== null
}

export async function authMiddleware(
  req: Request,
  requiredRole?: string,
): Promise<{ user: TokenData | null; isAuthorized: boolean }> {
  const cookieHeader = req.headers.get("cookie")
  if (!cookieHeader) {
    return { user: null, isAuthorized: false }
  }

  const cookiesMap = Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => {
      const [key, value] = cookie.split("=")
      return [key, value]
    }),
  )

  const token = cookiesMap["auth_token"]
  if (!token) {
    return { user: null, isAuthorized: false }
  }

  const user = await verifyToken(token)
  if (!user) {
    return { user: null, isAuthorized: false }
  }

  const isAuthorized = requiredRole ? user.role === requiredRole : true
  return { user, isAuthorized }
}
