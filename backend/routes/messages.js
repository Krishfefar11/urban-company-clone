import express from 'express'
import Message  from '../models/Message.js'
import Booking  from '../models/Booking.js'
import { authenticate } from '../middleware/auth.js'
import { io } from '../server.js'
import logger from '../utils/logger.js'

const router = express.Router()

// ── GET /api/messages/:bookingId ─────────────────────────────────────────────
// Returns all messages for a booking (user or assigned professional only)
router.get('/:bookingId', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    // Access check: only the booking owner or the assigned professional
    const userId  = req.user._id.toString()
    const isOwner = booking.user.toString() === userId
    const isPro   = booking.professional?.toString() === userId
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isPro && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const messages = await Message.find({ booking: req.params.bookingId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 })

    // Mark unread messages as read for this user
    await Message.updateMany(
      { booking: req.params.bookingId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    )

    res.json({ success: true, messages })
  } catch (err) {
    logger.error(`GET /messages/${req.params.bookingId}: ${err.message}`)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/messages/:bookingId ────────────────────────────────────────────
// Send a message. Also emits via Socket.io to all clients in `booking_<id>` room.
router.post('/:bookingId', authenticate, async (req, res) => {
  try {
    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'text is required' })
    if (text.trim().length > 500) return res.status(400).json({ success: false, message: 'Message too long (max 500 chars)' })

    const booking = await Booking.findById(req.params.bookingId)
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    const userId  = req.user._id.toString()
    const isOwner = booking.user.toString() === userId
    const isPro   = booking.professional?.toString() === userId
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isPro && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const message = await Message.create({
      booking: req.params.bookingId,
      sender:  req.user._id,
      text:    text.trim(),
      readBy:  [req.user._id],
    })

    const populated = await message.populate('sender', 'name avatar role')

    // Real-time broadcast to the booking room
    io.to(`booking_${req.params.bookingId}`).emit('receive_message', populated)

    res.status(201).json({ success: true, message: populated })
  } catch (err) {
    logger.error(`POST /messages/${req.params.bookingId}: ${err.message}`)
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
