import { useState, useCallback } from 'react'

// In production this would fetch from GET /api/notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'booking_confirmed',  title: 'Booking Confirmed',       body: 'Your AC Deep Clean is confirmed for tomorrow 10:00 AM.', time: '2m ago',  read: false },
  { id: 2, type: 'pro_assigned',       title: 'Professional Assigned',    body: 'Rajesh Kumar will arrive at 10:00 AM. Rating: ⭐ 4.8',    time: '5m ago',  read: false },
  { id: 3, type: 'promo',              title: 'Limited Offer 🎁',         body: 'Use code SAVE100 — ₹100 off on orders above ₹599.',      time: '1h ago',  read: false },
  { id: 4, type: 'booking_completed',  title: 'Service Completed',        body: 'Rate your experience with Rajesh Kumar.',                 time: '2d ago',  read: true  },
  { id: 5, type: 'reminder',           title: 'Upcoming Booking',         body: 'Salon at Home is scheduled for today at 3:00 PM.',        time: '3d ago',  read: true  },
]

export function useNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  return { notifications, unreadCount, markRead, markAllRead }
}
