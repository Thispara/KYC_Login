import axios from "axios"

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: "/", // Using root path since your backend is using paths like "/login", "/register"
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors like 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("userRole")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api

