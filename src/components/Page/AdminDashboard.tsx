"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import "./AdminDashboard.css"

interface AdminDashboardProps {
    onLogout: () => void
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [kycRequests, setKycRequests] = useState<
    { id: number; username: string; file_path: string }[]
  >([])

  useEffect(() => {
    const token = localStorage.getItem("token")

    // ✅ ดึงรายการ KYC ที่รออนุมัติ
    axios
      .get("http://localhost:3000/admin/kyc-pending", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setKycRequests(res.data))
      .catch((error) => console.error("Error fetching KYC requests:", error))
  }, [])

  // ✅ ฟังก์ชันกด Approve/Reject
  const handleAction = async (id: number, status: "approved" | "rejected") => {
    const token = localStorage.getItem("token")

    try {
      await axios.post(
        `http://localhost:3000/admin/kyc-action/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // ลบรายการที่เพิ่งอนุมัติออกจาก UI
      setKycRequests((prev) => prev.filter((request) => request.id !== id))
      alert(`KYC ${status} successfully!`)
    } catch (error) {
      console.error(`Error ${status} KYC:`, error)
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">P</div>
        <h1>Admin Dashboard</h1>
      </header>
      <main className="dashboard-content">
        <aside className="dashboard-sidebar">
          <ul>
            <li>Overview</li>
            <li>Status</li>
            <li>Users</li>
          </ul>
        </aside>
        <div className="dashboard-main">
          <h2>Pending KYC Approvals</h2>
          {kycRequests.length === 0 ? (
            <p>No pending KYC requests.</p>
          ) : (
            <ul>
              {kycRequests.map((kyc) => (
                <li key={kyc.id}>
                  <p>User: {kyc.username}</p>
                  <a
                    href={`http://localhost:3000/uploads/${kyc.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </a>
                  <button onClick={() => handleAction(kyc.id, "approved")}>
                    Approve
                  </button>
                  <button onClick={() => handleAction(kyc.id, "rejected")}>
                    Reject
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>
    </div>
  )
}

export default AdminDashboard