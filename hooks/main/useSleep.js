"use client"

import { useState, useCallback } from "react"

const useSleep = () => {
  const [isSleeping, setIsSleeping] = useState(false)

  const sleep = useCallback((ms) => {
    setIsSleeping(true)
    const timer = setTimeout(() => {
      setIsSleeping(false)
    }, ms)

    return () => clearTimeout(timer)
  }, [])

  return [isSleeping, sleep]
}

export default useSleep
