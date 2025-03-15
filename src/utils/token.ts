// Token utility functions

interface TokenPayload {
    id: string
    role: string
    iat: number
    exp: number
  }
  
  export const decodeToken = (token: string): TokenPayload | null => {
    try {
      const tokenParts = token.split(".")
      if (tokenParts.length !== 3) {
        return null
      }
  
      const payload = JSON.parse(atob(tokenParts[1]))
      return payload
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }
  
  export const getUserIdFromToken = (): string | null => {
    const token = localStorage.getItem("token")
    if (!token) return null
  
    const payload = decodeToken(token)
    return payload?.id || null
  }
  
  export const getUserRoleFromToken = (): string | null => {
    const token = localStorage.getItem("token")
    if (!token) return null
  
    const payload = decodeToken(token)
    return payload?.role || null
  }
  
  export const isTokenExpired = (): boolean => {
    const token = localStorage.getItem("token")
    if (!token) return true
  
    const payload = decodeToken(token)
    if (!payload || !payload.exp) return true
  
    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    return payload.exp * 1000 < Date.now()
  }
  
  