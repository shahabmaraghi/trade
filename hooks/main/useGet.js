import axios from "axios"
import useSWR from "swr"
import { endpoint } from "../../services/syfetch"

export default function useGet(url, params) {
  if (url.startsWith("/")) {
    url = url.substring(1)
  }

  if (params) {
    const queryString = new URLSearchParams(params).toString()
    url = `${url}?${queryString}`
  }

  const fetcher = (url) => axios.get(`${endpoint}/${url}`).then((res) => res.data)
  const { data, isLoading, isValidating, mutate, error } = useSWR(url, fetcher)
  return { data, isLoading, isValidating, mutate, error }
}
