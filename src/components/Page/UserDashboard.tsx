"use client"

import type React from "react"
import { useEffect, useState } from "react"
import api from "../../api/axios"
import { getUserIdFromToken } from "../../utils/token"
import "./UserDashboard.css"

interface UserDashboardProps {
  onLogout: () => void
}

interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
}

interface KycStatus {
  id: number
  user_id: string
  file_path: string
  status: string
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null)
  const [kycStatus, setKycStatus] = useState<string>("Loading...")
  const [notifications, setNotifications] = useState<string[]>([])
  const userId = getUserIdFromToken()

  useEffect(() => {
    // Fetch user data
    api
      .get("/user")
      .then((res) => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          setUser(res.data.data[0])
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error)
        setUser(null)
      })

    // Fetch KYC status
    api
      .get("/kyc/status")
      .then((res) => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          setKycStatus(res.data.data[0].status)
        }
      })
      .catch((error) => {
        console.error("Error fetching KYC status:", error)
        setKycStatus("Error fetching status")
      })
  }, [])

  // WebSocket connection
  useEffect(() => {
    if (!userId) return

    // Connect to WebSocket
    const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}?userId=${userId}`)

    ws.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setNotifications((prev) => [...prev, data.message])
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    return () => {
      ws.close()
    }
  }, [userId])

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">P</div>
        <h1>User Dashboard</h1>
      </header>
      <main className="dashboard-content">
        <h2>Welcome, {user?.username || "Guest"}!</h2>
        <p>
          Your KYC Status: <strong>{kycStatus}</strong>
        </p>

        <h3>Notifications</h3>
        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          <ul>
            {notifications.map((noti, index) => (
              <li key={index}>{noti}</li>
            ))}
          </ul>
        )}
      </main>
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>
    </div>
  )
}

export default UserDashboard

