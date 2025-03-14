"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import RegisterSuccess from "./components/Auth/RegisterSuccess"
import UserDashboard from "./components/Page/UserDashboard"
import AdminDashboard from "./components/Page/AdminDashboard"
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import { isTokenExpired, getUserRoleFromToken } from "./utils/token"
import "./App.css"

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check if user is authenticated on app load
    const verifyToken = async () => {
      // Check if token exists and is not expired
      if (!isTokenExpired()) {
        const role = getUserRoleFromToken()
        setIsAuthenticated(true)
        setUserRole(role)
      } else {
        // Token is invalid or expired
        localStorage.removeItem("token")
        localStorage.removeItem("userRole")
      }

      setIsLoading(false)
    }

    verifyToken()
  }, [])

  const handleLogin = (token: string, role: string) => {
    localStorage.setItem("token", token)
    localStorage.setItem("userRole", role)
    setIsAuthenticated(true)
    setUserRole(role)
  }

  const handleLogout = async () => {
    // No logout endpoint in the backend, just clear local storage
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    setIsAuthenticated(false)
    setUserRole(null)
  }

  if (isLoading) {
    return <div className="loading-app">Loading application...</div>
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={userRole === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/register/success" element={<RegisterSuccess />} />

        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && userRole === "user"} redirectPath="/login">
              <UserDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && userRole === "admin"} redirectPath="/login">
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App

