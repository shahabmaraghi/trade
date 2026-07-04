"use client"
// A universal storage utility for Next.js (client-safe)
// Falls back to cookies if localStorage/sessionStorage is unavailable
// @ts-ignore
import Cookies from "js-cookie"

export const safeStorage = {
  getItem(key: string, type: "local" | "session" = "local"): string | null {
    if (typeof window !== "undefined") {
      try {
        if (type === "local") {
          const v = window.localStorage.getItem(key)
          return v !== null ? v : (Cookies.get(key) || null)
        }
        if (type === "session") {
          const v = window.sessionStorage.getItem(key)
          return v !== null ? v : (Cookies.get(key) || null)
        }
      } catch {}
    }
    return Cookies.get(key) || null
  },
  setItem(key: string, value: string, type: "local" | "session" = "local") {
    if (typeof window !== "undefined") {
      try {
        if (type === "local") window.localStorage.setItem(key, value)
        if (type === "session") window.sessionStorage.setItem(key, value)
      } catch {}
    }
    Cookies.set(key, value, { expires: 30, path: "/" })
  },
  removeItem(key: string, type: "local" | "session" = "local") {
    if (typeof window !== "undefined") {
      try {
        if (type === "local") window.localStorage.removeItem(key)
        if (type === "session") window.sessionStorage.removeItem(key)
      } catch {}
    }
    Cookies.remove(key, { path: "/" })
  }
}
