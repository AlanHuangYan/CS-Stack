import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_token")
  const userToken = localStorage.getItem("token")
  if (config.url?.startsWith("/api/admin") && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`
  }
  return config
})
