import { useState, useRef, useEffect } from 'react'
import { FiBell, FiX, FiCheckCircle, FiCalendar, FiStar, FiTag, FiInfo } from 'react-icons/fi'

const ICON_MAP = {
  booking:    { icon: FiCalendar,    bg: 'bg-blue-50',   color: 'text-blue-600'  },
  review:     { icon: FiStar,        bg: 'bg-yellow-50', color: 'text-yellow-500'},
  promo:      { icon: FiTag,         bg: 'bg-brand-light',color:'text-brand'     },
  system:     { icon: FiInfo,        bg: 'bg-neutral-100',  color: 'text-neutral-500' },
  completed:  { icon: FiCheckCircle, bg: 'bg-green-50',  color: 'text-green-600'},
}

const SAMPLE = [
  { id: 1, type: 'completed',  title: 'Service completed!',         body: 'Your Home Deep Clean by Ravi Kumar is done.',              time: '2 min ago',  read: false },
  { id: 2, type: 'booking',    title: 'Booking confirmed',           body: 'AC Service on 22 May at 2:00 PM — Suresh Mehta assigned.', time: '1 hr ago',   read: false },
  { id: 3, type: 'promo',      title: 'Limited offer for you 🎉',   body: 'Use URBAN50 for 50% off your next booking.',               time: '3 hrs ago',  read: false },
  { id: 4, type: 'review',     title: 'Rate your last service',      body: 'How was your Full Body Massage with Priti Sharma?',        time: '1 day ago',  read: true  },
  { id: 5, type: 'system',     title: 'Profile verified',            body: 'Your account has been fully verified.',                    time: '2 days ago', read: true  },
]

const NotificationBell = () => {
  const [open,   setOpen]   = useState(false)
  const [items,  setItems]  = useState(SAMPLE)
  const ref = useRef()

  const unread = items.filter(n => !n.read).length

  const markAllRead = () => setItems(ns => ns.map(n => ({ ...n, read: true })))
  const dismiss     = (id) => setItems(ns => ns.filter(n => n.id !== id))
  const markRead    = (id) => setItems(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors">
        <FiBell size={16} className="text-neutral-700" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-0.5">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-neutral-100 rounded-2xl shadow-hover z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100">
            <p className="font-bold text-neutral-900 text-sm">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="text-xs font-semibold text-brand hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-10">
                <FiBell size={28} className="text-neutral-200 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">You're all caught up!</p>
              </div>
            ) : (
              items.map(n => {
                const cfg  = ICON_MAP[n.type] || ICON_MAP.system
                const Icon = cfg.icon
                return (
                  <div key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-50 last:border-0 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={15} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${n.read ? 'text-neutral-700 font-medium' : 'text-neutral-900 font-semibold'}`}>
                          {n.title}
                        </p>
                        <button onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                          className="flex-shrink-0 text-neutral-300 hover:text-neutral-500 transition-colors mt-0.5">
                          <FiX size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                      <p className="text-xs text-neutral-300 mt-1">{n.time}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="px-4 py-3 border-t border-neutral-100 text-center">
              <button className="text-xs font-semibold text-neutral-500 hover:text-neutral-700 transition-colors">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
