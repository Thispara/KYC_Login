import type React from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  isAuthenticated: boolean
  redirectPath?: string
  children?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, redirectPath = "/user-dashboard", children,}) => {
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return children;
}

export default ProtectedRoute

