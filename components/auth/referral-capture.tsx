"use client"

import { useEffect } from "react"
import { safeStorage } from "@/lib/storage"

export default function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get("ref")
      const mentor = params.get("mentor")
      if (ref) safeStorage.setItem("referral_code", ref, "local")
      if (mentor) safeStorage.setItem("mentor_referral_code", mentor, "local")
    } catch {}
  }, [])

  return null
}
