"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { BarChart3, Users, FileText, Settings, Bell, Search, Menu, X, Home, LogOut, User, Shield } from "lucide-react"
import "./DashboardLayout.css"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  onLogout: () => void
  userRole: "admin" | "user"
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, onLogout, userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const adminMenuItems = [
    { path: "/admin-dashboard", icon: <Home size={20} />, label: "Dashboard" },
    { path: "/admin-dashboard/users", icon: <Users size={20} />, label: "Users" },
    { path: "/admin-dashboard/kyc", icon: <FileText size={20} />, label: "KYC Requests" },
    { path: "/admin-dashboard/reports", icon: <BarChart3 size={20} />, label: "Reports" },
    { path: "/admin-dashboard/settings", icon: <Settings size={20} />, label: "Settings" },
  ]

  const userMenuItems = [
    { path: "/user-dashboard", icon: <Home size={20} />, label: "Dashboard" },
    { path: "/user-dashboard/profile", icon: <User size={20} />, label: "Profile" },
    { path: "/user-dashboard/notifications", icon: <Bell size={20} />, label: "Notifications" },
    { path: "/user-dashboard/settings", icon: <Settings size={20} />, label: "Settings" },
  ]

  const menuItems = userRole === "admin" ? adminMenuItems : userMenuItems

  return (
    <div className="dashboard-wrapper">
      {/* Mobile sidebar toggle */}
      <button className="mobile-sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">P</span>
          </div>
          <button className="close-sidebar" onClick={closeSidebar} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">{userRole === "admin" ? <Shield size={20} /> : <User size={20} />}</div>
          <div className="user-details">
            <p className="user-name">{userRole === "admin" ? "Admin User" : "Regular User"}</p>
            <p className="user-role">{userRole === "admin" ? "Administrator" : "User"}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className={location.pathname === item.path ? "active" : ""} onClick={closeSidebar}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>{title}</h1>
          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="notification-button">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
    </div>
  )
}

export default DashboardLayout

