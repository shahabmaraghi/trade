"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requirePremium?: boolean
  fallbackUrl?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requirePremium = false,
  fallbackUrl = "/auth/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isPremium } = useAuth()
  const router = useRouter()

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    router.push(fallbackUrl)
    return null
  }

  // Check admin role
  if (requireAdmin && (!user || user.role !== "admin")) {
    router.push("/dashboard")
    return null
  }

  // Check premium subscription
  if (requirePremium && !isPremium) {
    router.push("/subscription")
    return null
  }

  return <>{children}</>
}
