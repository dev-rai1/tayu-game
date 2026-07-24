import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

// Thin wrapper around a single shared Socket.io connection.
// See docs/SOCKET_EVENTS.md for the event contract.

const SOCKET_URL = import.meta.env.VITE_SOCKET_IO_URL || 'http://localhost:4000'

export function useSocket({ autoConnect = true } = {}) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!autoConnect) return
    const socket = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true })
    socketRef.current = socket
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    return () => socket.disconnect()
  }, [autoConnect])

  const emit = (event, payload) => socketRef.current?.emit(event, payload)
  const on = (event, cb) => {
    socketRef.current?.on(event, cb)
    return () => socketRef.current?.off(event, cb)
  }

  return { socket: socketRef.current, connected, emit, on }
}
