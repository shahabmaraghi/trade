import { Syfetch } from "syfetch"
import { Cookies } from "react-cookie"
import { safeStorage } from "@/lib/storage"

const cookie = new Cookies()

export const endpoint =
  process.env.NODE_ENV === "development" ? "http://localhost:3200/v1" : "https://api.hirmandtrade.ir/v1"

export const getAuthToken = () => {
  const localStorageToken = safeStorage.getItem("token")

  const cookieToken = cookie.get("token") ?? ""

  // If there is a token in the cookie, we return it with the `Bearer` prefix
  if (cookieToken !== "") {
    return `Bearer ${cookieToken}`
  }

  // If there is no token in the cookie but there is one in local storage, we return the token from local storage with the `Bearer` prefix
  return typeof localStorageToken === "string" && localStorageToken.length > 0
    ? `Bearer ${localStorageToken}`
    : undefined
}

export const syfetch = new Syfetch({
  endpoint,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: getAuthToken(),
  },
  apiErrorMessagePath: "message",
  onError: (message, error) => {
    console.log("error", message, error)
  },
})
