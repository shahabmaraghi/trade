import { jwtVerify, SignJWT } from "jose"
import { serialize } from "cookie"
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

function getAuthCookieDomain(): string | undefined {
  // Only pin the cookie domain in production; on localhost a domain like
  // ".hirmandtrade.ir" would make the browser reject the cookie entirely.
  if (process.env.NODE_ENV !== "production") return undefined

  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim()
  if (!domain) return undefined

  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

export function getAuthCookieOptions() {
  const options: {
    httpOnly: boolean
    path: string
    secure: boolean
    maxAge: number
    sameSite: "lax"
    domain?: string
  } = {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  }

  const domain = getAuthCookieDomain()
  if (domain) {
    options.domain = domain
  }

  return options
}

/** Set auth cookie on a NextResponse (preferred in API routes). */
export function applyAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: "auth_token",
    value: token,
    ...getAuthCookieOptions(),
  })

  return response
}

/** Clear auth cookie on a NextResponse. */
export function clearAuthCookie(response: NextResponse): NextResponse {
  // Clear the host-only cookie (covers localhost and cookies set without a domain)
  response.cookies.delete({ name: "auth_token", path: "/" })

  // Also clear the domain-wide cookie variant if one is configured (production)
  const domain = getAuthCookieDomain()
  if (domain) {
    response.cookies.set({
      name: "auth_token",
      value: "",
      path: "/",
      domain,
      maxAge: 0,
    })
  }

  return response
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

// Function to create the auth cookie string (legacy — prefer applyAuthCookie)
export function setAuthCookie(token: string) {
  const { maxAge, ...options } = getAuthCookieOptions()
  const cookie = serialize("auth_token", token, {
    ...options,
    maxAge,
  })

  return cookie
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

/** Edge-safe JWT verification for middleware/proxy (no bson dependency). */
export async function verifyTokenPayload(token: string): Promise<TokenData | null> {
  try {
    const { payload } = await jwtVerify<TokenData>(token, JWT_SECRET)

    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < currentTime) {
      return null
    }

    return payload as TokenData
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
