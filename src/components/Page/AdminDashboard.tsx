"use client"

import type React from "react"
import { useEffect, useState } from "react"
import api from "../../api/axios"
import "./AdminDashboard.css"

interface AdminDashboardProps {
  onLogout: () => void
}

interface KycRequest {
  id: number
  user_id: string
  file_path: string
  status: string
  username?: string
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([])
  const [users, setUsers] = useState<Record<string, string>>({}) // Map of user_id to username

  useEffect(() => {
    // Fetch pending KYC requests
    api
      .get("/admin/kyc-pending")
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setKycRequests(res.data)

          // Get unique user IDs from KYC requests
          const userIds = [...new Set(res.data.map((kyc) => kyc.user_id))]

          // Fetch usernames for each user ID
          userIds.forEach((userId) => {
            api
              .get(`/user-lists/${userId}`)
              .then((userRes) => {
                if (userRes.data && userRes.data.data && userRes.data.data.length > 0) {
                  setUsers((prev) => ({
                    ...prev,
                    [userId]: userRes.data.data[0].username,
                  }))
                }
              })
              .catch((error) => console.error(`Error fetching user ${userId}:`, error))
          })
        }
      })
      .catch((error) => console.error("Error fetching KYC requests:", error))
  }, [])

  // Handle approve/reject action
  const handleAction = async (id: number, status: "approved" | "rejected") => {
    try {
      await api.post(`/kyc-action/${id}`, { status })

      // Remove the processed request from the UI
      setKycRequests((prev) => prev.filter((request) => request.id !== id))
      alert(`KYC ${status} successfully!`)
    } catch (error) {
      console.error(`Error ${status} KYC:`, error)
      alert(`Error: Could not ${status} KYC request`)
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">P</div>
        <h1>Admin Dashboard</h1>
      </header>
      <main className="dashboard-content">
        <h2>Pending KYC Approvals</h2>
        {kycRequests.length === 0 ? (
          <p>No pending KYC requests.</p>
        ) : (
          <ul>
            {kycRequests.map((kyc) => (
              <li key={kyc.id}>
                <p>User: {users[kyc.user_id] || "Loading..."}</p>
                <a href={`/uploads/${kyc.file_path}`} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
                <div className="action-buttons">
                  <button onClick={() => handleAction(kyc.id, "approved")}>Approve</button>
                  <button onClick={() => handleAction(kyc.id, "rejected")}>Reject</button>
                </div>
              </li>
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

export default AdminDashboard

