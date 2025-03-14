"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../../api/axios"
import { decodeToken } from "../../utils/token"
import "./Auth.css"

interface LoginProps {
  onLogin: (token: string, role: string) => void
}

interface LoginResponse {
  token: string
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Connect to the backend login endpoint
      const response = await api.post<LoginResponse>("/login", {
        username,
        password,
      })

      const { token } = response.data

      // Decode the JWT token to get the user role
      const payload = decodeToken(token)
      if (payload) {
        const role = payload.role

        onLogin(token, role)

        // Redirect based on role
        if (role === "admin") {
          navigate("/admin-dashboard")
        } else {
          navigate("/user-dashboard")
        }
      } else {
        throw new Error("Invalid token format")
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        setError("An error occurred during login")
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">P</span>
        </div>

        <h1 className="auth-title">LOGIN</h1>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username:
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="auth-link-container">
            <span className="auth-text">Don't have an account?</span>
            <Link to="/register" className="auth-link">
              Register Here
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}

