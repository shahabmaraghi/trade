"use client"

import { useCookies } from "react-cookie"
import { useEffect, useState } from "react"

const useAuth = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["token"])
  const [isAuthenticated, setIsAuthenticated] = useState(!!cookies.token)

  useEffect(() => {
    setIsAuthenticated(!!cookies.token)
  }, [cookies.token])

  const login = (token) => {
    setCookie("token", token, { path: "/" })
  }

  const logout = () => {
    removeCookie("token", { path: "/" })
  }

  return {
    isAuthenticated,
    login,
    logout,
  }
}

export default useAuth
