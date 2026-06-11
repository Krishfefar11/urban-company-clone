import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const STATUS_LABELS = {
  pending:     { label: 'Booking Received',     color: 'text-yellow-600', bg: 'bg-yellow-50',  dot: 'bg-yellow-400' },
  confirmed:   { label: 'Pro Assigned',          color: 'text-blue-600',   bg: 'bg-blue-50',    dot: 'bg-blue-400'   },
  on_the_way:  { label: 'Pro On The Way',        color: 'text-indigo-600', bg: 'bg-indigo-50',  dot: 'bg-indigo-400' },
  in_progress: { label: 'Service In Progress',   color: 'text-orange-600', bg: 'bg-orange-50',  dot: 'bg-orange-400' },
  completed:   { label: 'Service Completed',     color: 'text-green-600',  bg: 'bg-green-50',   dot: 'bg-green-500'  },
  cancelled:   { label: 'Booking Cancelled',     color: 'text-red-600',    bg: 'bg-red-50',     dot: 'bg-red-400'    },
}

export const STATUS_ORDER = ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed']

export function useBookingStatus(bookingId, initialStatus = 'pending') {
  const [status, setStatus]   = useState(initialStatus)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!bookingId) return

    const socket = io(API_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join_booking', bookingId)
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('booking_status_changed', (data) => {
      if (data.bookingId === bookingId) {
        setStatus(data.status)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [bookingId])

  return { status, connected }
}
