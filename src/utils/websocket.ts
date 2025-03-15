// WebSocket utility for handling real-time notifications

let websocket: WebSocket | null = null

export const connectWebSocket = (userId: string, onMessage: (data: any) => void) => {
  // Close existing connection if any
  if (websocket) {
    websocket.close()
  }

  // Create new WebSocket connection
  websocket = new WebSocket(`ws://localhost:8080?userId=${userId}`)

  websocket.onopen = () => {
    console.log("WebSocket connected")
  }

  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error("Error parsing WebSocket message:", error)
    }
  }

  websocket.onerror = (error) => {
    console.error("WebSocket error:", error)
  }

  websocket.onclose = () => {
    console.log("WebSocket disconnected")
    websocket = null
  }

  return websocket
}

export const disconnectWebSocket = () => {
  if (websocket) {
    websocket.close()
    websocket = null
  }
}

export const isWebSocketConnected = () => {
  return websocket !== null && websocket.readyState === WebSocket.OPEN
}

