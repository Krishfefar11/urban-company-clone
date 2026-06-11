import express from 'express'
import { body } from 'express-validator'
import Razorpay from 'razorpay'
import Booking from '../models/Booking.js'
import Professional from '../models/Professional.js'
import User from '../models/User.js'
import Service from '../models/Service.js'
import { authenticate } from '../middleware/auth.js'
import { requireProfessional, requireAdmin } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'

const bookingCreateValidation = [
  body('service').isMongoId().withMessage('Valid service ID required'),
  body('scheduledAt').isISO8601().withMessage('scheduledAt must be a valid ISO date')
    .custom(v => new Date(v) > new Date()).withMessage('scheduledAt must be in the future'),
  body('address.line1').trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('pricingTier.name').optional().isString(),
  body('pricingTier.price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('payment.method').optional().isIn(['online', 'cash']).withMessage('Payment method must be online or cash'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be under 500 characters'),
]
import { io } from '../server.js'
import logger, { logBookingEvent } from '../utils/logger.js'
import { sendPushToUser, PUSH_TEMPLATES } from '../services/pushService.js'
import {
  sendBookingConfirmation,
  sendProfessionalAssigned,
  sendCancellationConfirmation,
  sendBookingAssignedToPro,
  sendRescheduleConfirmation,
} from '../services/emailService.js'

const router = express.Router()

// ── Helper: auto-assign professional ─────────────────────────────────────────
const DAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const findAvailableProfessional = async (serviceId, city, scheduledAt) => {
  const dayKey = DAY_MAP[new Date(scheduledAt).getDay()]
  const hour   = new Date(scheduledAt).getHours()

  // Find all approved, online professionals offering the service in the same city
  const candidates = await Professional.find({
    services: serviceId,
    city:     { $regex: new RegExp(city, 'i') },
    status:   'approved',
    isOnline: true,
    [`availability.${dayKey}`]: true,
  }).populate('user')

  for (const pro of candidates) {
    // Parse startTime / endTime from "HH:MM"
    const [startH] = (pro.availability.startTime || '08:00').split(':').map(Number)
    const [endH]   = (pro.availability.endTime   || '20:00').split(':').map(Number)
    if (hour < startH || hour >= endH) continue   // outside working hours

    // Check for booking conflicts ±2 hours
    const windowStart = new Date(scheduledAt)
    const windowEnd   = new Date(scheduledAt)
    windowStart.setHours(windowStart.getHours() - 2)
    windowEnd.setHours(windowEnd.getHours()   + 2)

    const clash = await Booking.findOne({
      professional: pro._id,
      status:       { $in: ['confirmed', 'on_the_way', 'in_progress'] },
      scheduledAt:  { $gte: windowStart, $lte: windowEnd },
    })
    if (!clash) return pro
  }
  return null
}

// ── POST /api/bookings — create booking ──────────────────────────────────────
router.post('/', authenticate, bookingCreateValidation, validate, async (req, res) => {
  try {
    const { service: serviceId, scheduledAt, address, pricingTier, notes, payment } = req.body

    if (!serviceId)    return res.status(400).json({ success: false, message: 'service is required' })
    if (!scheduledAt)  return res.status(400).json({ success: false, message: 'scheduledAt is required' })
    if (!address?.line1 || !address?.city) return res.status(400).json({ success: false, message: 'address.line1 and address.city are required' })
    if (new Date(scheduledAt) <= new Date()) return res.status(400).json({ success: false, message: 'scheduledAt must be in the future' })

    // Create booking
    const booking = await Booking.create({
      user:       req.user._id,
      service:    serviceId,
      scheduledAt,
      address,
      pricingTier,
      notes,
      payment:    { method: payment?.method || 'online', amount: pricingTier?.price },
      status:     'pending',
    })

    // Auto-assign professional
    const pro = await findAvailableProfessional(serviceId, address.city, scheduledAt)
    if (pro) {
      booking.professional = pro._id
      booking.status = 'confirmed'
      await booking.save()

      // Notify professional via socket + email
      io.to(`pro_${pro._id}`).emit('new_booking_assigned', { bookingId: booking._id })
      const proUser = await User.findById(pro.user)
      const service = await Service.findById(serviceId)
      void sendBookingAssignedToPro(proUser, booking, service)
      void sendProfessionalAssigned(req.user, booking, pro)
      logBookingEvent('assigned', { bookingId: booking._id, proId: pro._id })
    }

    await booking.populate(['service', 'user'])

    // Send booking confirmation email to customer (fire-and-forget)
    const svc = await Service.findById(serviceId)
    void sendBookingConfirmation(req.user, booking, svc)
    logBookingEvent('created', { bookingId: booking._id, userId: req.user._id, service: serviceId })

    // Emit socket update
    io.to(`booking_${booking._id}`).emit('booking_status_changed', { bookingId: booking._id, status: booking.status })

    // Push notification to customer
    const { notification, data } = PUSH_TEMPLATES.bookingConfirmed(booking._id.toString())
    sendPushToUser(req.user._id, notification, data).catch(() => {})

    res.status(201).json({ success: true, booking })
  } catch (err) {
    logger.error(`POST /bookings: ${err.message}`, err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/bookings/my — paginated user bookings ───────────────────────────
router.get('/my', authenticate, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit

    const query = { user: req.user._id }
    if (req.query.status && req.query.status !== 'all') query.status = req.query.status

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('service professional')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ])

    res.json({ success: true, bookings, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/bookings/pro — paginated professional bookings ──────────────────
router.get('/pro', authenticate, requireProfessional, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit

    const query = { professional: req.user._id }
    if (req.query.status) query.status = req.query.status

    const [bookings, total] = await Promise.all([
      Booking.find(query).populate('service user').sort({ scheduledAt: 1 }).skip(skip).limit(limit),
      Booking.countDocuments(query),
    ])

    res.json({ success: true, bookings, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/bookings/:id — single booking ───────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service professional user')
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    // Only owner, assigned pro, or admin can view
    const isOwner = booking.user._id.toString() === req.user._id.toString()
    const isPro   = booking.professional && booking.professional.user?.toString() === req.user._id.toString()
    if (!isOwner && !isPro && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    res.json({ success: true, booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── PATCH /api/bookings/:id/status — pro / admin updates status ──────────────
router.patch('/:id/status', authenticate, requireProfessional, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['confirmed', 'on_the_way', 'in_progress', 'completed']
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` })
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, { status, ...(status === 'completed' ? { completedAt: new Date() } : {}) },
      { new: true }
    )
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    io.to(`booking_${req.params.id}`).emit('booking_status_changed', { bookingId: req.params.id, status })
    logBookingEvent('status_updated', { bookingId: req.params.id, status })

    // Push notification to the customer
    const tpl = {
      on_the_way:  PUSH_TEMPLATES.professionalOnTheWay,
      in_progress: PUSH_TEMPLATES.serviceStarted,
      completed:   PUSH_TEMPLATES.serviceCompleted,
    }[status]
    if (tpl && booking.user) {
      const populated = await Booking.findById(req.params.id).populate('professional')
      const proName = populated?.professional?.user?.name
      const { notification, data } = tpl(req.params.id, proName)
      sendPushToUser(booking.user, notification, data).catch(() => {})
    }

    res.json({ success: true, booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── PATCH /api/bookings/:id/cancel — user cancels + Razorpay refund ──────────
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' })
    }

    booking.status       = 'cancelled'
    booking.cancelReason = req.body.reason || ''

    let refundAmount = 0

    // ── Razorpay refund if paid online ────────────────────────────────────
    if (booking.payment?.status === 'paid' && booking.payment?.method === 'online' && booking.payment?.razorpayPaymentId) {
      try {
        const razorpay = new Razorpay({
          key_id:     process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
        refundAmount = booking.payment.amount || 0
        const refund = await razorpay.payments.refund(booking.payment.razorpayPaymentId, {
          amount: Math.round(refundAmount * 100),  // paise
        })
        booking.payment.status   = 'refunded'
        booking.payment.refundId = refund.id
        logBookingEvent('refund_initiated', { bookingId: booking._id, refundId: refund.id, amount: refundAmount })
      } catch (refundErr) {
        logger.error(`Razorpay refund failed for booking ${booking._id}: ${refundErr.message}`)
        // Don't block cancellation — mark for manual review
        booking.payment.refundError = refundErr.message
      }
    }

    await booking.save()

    // Send cancellation email
    void sendCancellationConfirmation(req.user, booking, refundAmount)
    logBookingEvent('cancelled', { bookingId: booking._id, reason: req.body.reason })

    res.json({ success: true, booking, refundInitiated: refundAmount > 0 })
  } catch (err) {
    logger.error(`CANCEL booking: ${err.message}`, err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── PATCH /api/bookings/:id/reschedule ────────────────────────────────────────
router.patch('/:id/reschedule', authenticate, async (req, res) => {
  try {
    const { scheduledAt } = req.body
    if (!scheduledAt) return res.status(400).json({ success: false, message: 'scheduledAt required' })
    if (new Date(scheduledAt) <= new Date()) return res.status(400).json({ success: false, message: 'scheduledAt must be in the future' })

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule a completed or cancelled booking' })
    }

    // Check for conflict with already-assigned professional
    if (booking.professional) {
      const windowStart = new Date(scheduledAt)
      const windowEnd   = new Date(scheduledAt)
      windowStart.setHours(windowStart.getHours() - 2)
      windowEnd.setHours(windowEnd.getHours()   + 2)

      const clash = await Booking.findOne({
        _id:          { $ne: booking._id },
        professional: booking.professional,
        status:       { $in: ['confirmed', 'on_the_way', 'in_progress'] },
        scheduledAt:  { $gte: windowStart, $lte: windowEnd },
      })
      if (clash) return res.status(409).json({ success: false, message: 'Professional unavailable at this time. Please choose a different slot.' })
    }

    booking.scheduledAt = scheduledAt
    await booking.save()

    void sendRescheduleConfirmation(req.user, booking)
    io.to(`booking_${booking._id}`).emit('booking_rescheduled', { bookingId: booking._id, scheduledAt })
    logBookingEvent('rescheduled', { bookingId: booking._id, scheduledAt })

    res.json({ success: true, booking })
  } catch (err) {
    logger.error(`RESCHEDULE booking: ${err.message}`, err)
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
