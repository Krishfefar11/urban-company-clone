import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi'

const ToastCtx = createContext(null)

const CONFIG = {
  success: { icon: FiCheckCircle,  bar: 'bg-brand',     icon_cls: 'text-brand'    },
  error:   { icon: FiAlertCircle,  bar: 'bg-red-500',   icon_cls: 'text-red-500'  },
  warning: { icon: FiAlertTriangle,bar: 'bg-yellow-400',icon_cls: 'text-yellow-500'},
  info:    { icon: FiInfo,         bar: 'bg-blue-500',  icon_cls: 'text-blue-500' },
}

const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false)
  const cfg = CONFIG[toast.type] || CONFIG.info
  const Icon = cfg.icon

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`relative flex items-start gap-3 bg-white border border-neutral-100 rounded-xl p-4 shadow-md
      transition-all duration-300 max-w-sm w-full overflow-hidden
      ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-100">
        <div className={`h-full ${cfg.bar} animate-toast-shrink`}
          style={{ animationDuration: `${toast.duration || 4000}ms` }} />
      </div>

      <Icon size={16} className={`flex-shrink-0 mt-0.5 ${cfg.icon_cls}`} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-neutral-900 text-sm">{toast.title}</p>}
        {toast.message && <p className={`text-neutral-500 text-sm ${toast.title ? 'mt-0.5' : ''}`}>{toast.message}</p>}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
        aria-label="Dismiss notification"
        className="flex-shrink-0 w-6 h-6 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
      >
        <FiX size={12} className="text-neutral-400" />
      </button>
    </div>
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++idRef.current
    setToasts(ts => [...ts, { id, type, title, message, duration }])
  }, [])

  const removeToast = useCallback(id => {
    setToasts(ts => ts.filter(t => t.id !== id))
  }, [])

  // Convenience shorthands
  const toast = {
    success: (msg, title) => addToast({ type: 'success', title, message: msg }),
    error:   (msg, title) => addToast({ type: 'error',   title, message: msg }),
    warning: (msg, title) => addToast({ type: 'warning', title, message: msg }),
    info:    (msg, title) => addToast({ type: 'info',    title, message: msg }),
    show:    addToast,
  }

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {/* Portal */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

export default ToastProvider
