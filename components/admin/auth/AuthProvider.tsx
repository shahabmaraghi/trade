"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  phone: string
  fullName?: string
  role: string
  subscription?: {
    plan: {
      id: string
      title: string
      price: number
      features: string[]
    }
    expiryDate?: string
    isActive: boolean
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isPremium: boolean
  login: (phone: string, password?: string) => Promise<any>
  register: (phone: string, fullName?: string, password?: string, referrer?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (phone: string, password?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
        credentials: "include", // Important: include credentials to store cookies
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Login failed")
      }

      const data = await response.json()
      setUser(data.user)
      return data.user
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (phone: string, fullName?: string, password?: string, referrer?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, fullName, password, referrer }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Registration failed")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include", // Important: include credentials to send cookies
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return userData
      } else {
        // Handle unauthorized or other errors
        if (response.status === 401) {
          setUser(null)
        }
        return null
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
      return null
    }
  }

  const isAuthenticated = !!user
  const isPremium = !!user?.subscription?.isActive && user?.subscription?.plan?.title !== "رایگان"

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isPremium,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
