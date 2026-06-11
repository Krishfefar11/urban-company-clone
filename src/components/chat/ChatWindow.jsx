import { useState, useEffect, useRef, useCallback } from 'react'
import { io as socketIO } from 'socket.io-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiSend, FiMessageSquare, FiX, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import apiFetch from '../../api/apiClient'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'

const fetchMessages = (bookingId) =>
  apiFetch(`/messages/${bookingId}`)

const sendMessage = ({ bookingId, text }) =>
  apiFetch(`/messages/${bookingId}`, { method: 'POST', body: JSON.stringify({ text }) })

const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

/**
 * ChatWindow — in-booking real-time chat.
 *
 * Props:
 *   bookingId {string}   MongoDB booking _id
 *   onClose   {function} optional — called when the X button is clicked
 */
const ChatWindow = ({ bookingId, onClose }) => {
  const { dbUser }   = useAuth()
  const qc           = useQueryClient()
  const socketRef    = useRef(null)
  const bottomRef    = useRef(null)
  const [input, setInput]             = useState('')
  const [messages, setMessages]       = useState([])
  const [connected, setConnected]     = useState(false)
  const [unread, setUnread]           = useState(0)
  const [isOpen, setIsOpen]           = useState(true)

  // Load message history
  const { data, isLoading } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn:  () => fetchMessages(bookingId),
    enabled:  !!bookingId && isOpen,
  })

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages)
      setUnread(0)
    }
  }, [data])

  // Socket.io connection
  useEffect(() => {
    if (!bookingId) return

    const socket = socketIO(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join_booking', bookingId)
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('receive_message', (msg) => {
      setMessages(prev => {
        // avoid duplicates from optimistic updates
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
      if (!isOpen) setUnread(n => n + 1)
    })

    return () => {
      socket.disconnect()
    }
  }, [bookingId])

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setUnread(0)
    }
  }, [messages, isOpen])

  const mutation = useMutation({
    mutationFn: sendMessage,
    onMutate: async ({ text }) => {
      // Optimistic update
      const optimistic = {
        _id:       `opt_${Date.now()}`,
        text,
        sender:    { _id: dbUser?._id, name: dbUser?.name, role: dbUser?.role },
        createdAt: new Date().toISOString(),
        _optimistic: true,
      }
      setMessages(prev => [...prev, optimistic])
      return { optimistic }
    },
    onSuccess: (data, vars, ctx) => {
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m._id === ctx.optimistic._id ? data.message : m))
      qc.invalidateQueries({ queryKey: ['messages', bookingId] })
    },
    onError: (_, __, ctx) => {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== ctx?.optimistic?._id))
    },
  })

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || mutation.isPending) return
    setInput('')
    mutation.mutate({ bookingId, text })
  }, [input, bookingId, mutation])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const myId = dbUser?._id

  return (
    <div className="border border-neutral-100 rounded-2xl overflow-hidden shadow-card bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-neutral-900 cursor-pointer select-none"
        onClick={() => setIsOpen(o => !o)}
      >
        <div className="flex items-center gap-2.5">
          <FiMessageSquare size={15} className="text-white" />
          <span className="text-white font-bold text-sm">Chat with Professional</span>
          {!isOpen && unread > 0 && (
            <span className="bg-brand text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-neutral-500'}`} title={connected ? 'Connected' : 'Reconnecting…'} />
          {isOpen
            ? <FiChevronDown size={16} className="text-neutral-300" />
            : <FiChevronDown size={16} className="text-neutral-300 rotate-180 transition-transform" />
          }
          {onClose && (
            <button onClick={(e) => { e.stopPropagation(); onClose?.() }} className="text-neutral-400 hover:text-white transition-colors ml-1">
              <FiX size={15} />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <>
          {/* Message list */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-neutral-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                <FiMessageSquare size={28} className="text-neutral-300" />
                <p className="text-sm text-neutral-400 font-medium">No messages yet</p>
                <p className="text-xs text-neutral-400">Send a message to your professional</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === myId || msg.sender === myId
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      {!isMe && (
                        <p className="text-xs text-neutral-400 ml-1">{msg.sender?.name || 'Professional'}</p>
                      )}
                      <div className={`
                        px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isMe
                          ? 'bg-neutral-900 text-white rounded-tr-sm'
                          : 'bg-white text-neutral-800 border border-neutral-100 rounded-tl-sm shadow-sm'
                        }
                        ${msg._optimistic ? 'opacity-70' : ''}
                      `}>
                        {msg.text}
                      </div>
                      <p className="text-xs text-neutral-400 px-1">{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-neutral-100">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={500}
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder-neutral-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || mutation.isPending}
              className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
            >
              {mutation.isPending
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FiSend size={15} />
              }
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWindow
