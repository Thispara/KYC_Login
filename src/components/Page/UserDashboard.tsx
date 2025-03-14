"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import "./UserDashboard.css"

interface UserDashboardProps {
  onLogout: () => void
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onLogout }) => {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null)
  const [kycStatus, setKycStatus] = useState<string>("Loading...")
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")

    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: { Authorization: `Bearer ${token}` }
    })

    // ✅ ดึงข้อมูลผู้ใช้
    axiosInstance.get("/user")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))

    // ✅ ดึงสถานะ KYC
    axiosInstance.get("/kyc/status")
      .then((res) => setKycStatus(res.data.status))
      .catch(() => setKycStatus("Error fetching status"))

  }, [])

  // ✅ WebSocket
  useEffect(() => {
    if (!user) return;
    const ws = new WebSocket(`ws://localhost:8080?userId=${user.id}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [...prev, data.message]);
    };

    return () => ws.close();
  }, [user]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">P</div>
        <h1>User Dashboard</h1>
      </header>
      <main className="dashboard-content">
        <h2>Welcome, {user?.username || "Guest"}!</h2>
        <p>Your KYC Status: <strong>{kycStatus}</strong></p>

        <h3>Notifications</h3>
        <ul>
          {notifications.map((noti, index) => (
            <li key={index}>{noti}</li>
          ))}
        </ul>
      </main>
      <button onClick={onLogout} className="logout-button">
          Logout
        </button>
    </div>
  )
}

export default UserDashboard