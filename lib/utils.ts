import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  try {
    // Format date to Persian format
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return date.toISOString().split("T")[0] // Fallback to ISO format
  }
}

// Other utility functions...
