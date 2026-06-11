import express from 'express'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/role.js'
import logger from '../utils/logger.js'

const router = express.Router()

// GET /api/users/me — returns user + computed stats
router.get('/me', authenticate, async (req, res) => {
  try {
    const [bookingCount, reviewCount] = await Promise.all([
      Booking.countDocuments({ user: req.user._id }),
      Review.countDocuments({ user: req.user._id }),
    ])
    res.json({
      success: true,
      user: {
        ...req.user.toObject(),
        bookingCount,
        reviewCount,
      },
    })
  } catch (err) {
    // Fallback: return user without stats rather than erroring
    res.json({ success: true, user: req.user })
  }
})

// PUT /api/users/me
router.put('/me', authenticate, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'city', 'avatar', 'addresses']
    const updates = Object.keys(req.body)
      .filter(k => allowed.includes(k))
      .reduce((acc, k) => ({ ...acc, [k]: req.body[k] }), {})

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/users/fcm-token — store FCM device token
router.post('/fcm-token', authenticate, async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ success: false, message: 'token required' })
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { fcmTokens: token } }
    )
    res.json({ success: true, message: 'FCM token saved' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/users/verify-phone — mark phone as verified
router.patch('/verify-phone', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { phoneVerified: true }, { new: true })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/users (admin only, paginated)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1
    const limit  = parseInt(req.query.limit) || 20
    const skip   = (page - 1) * limit
    const search = req.query.search

    const query = {}
    if (search?.trim()) {
      const re = new RegExp(search.trim(), 'i')
      query.$or = [{ name: re }, { email: re }]
    }
    if (req.query.role) query.role = req.query.role

    const [users, total] = await Promise.all([
      User.find(query).select('-__v').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ])

    res.json({ success: true, users, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/users/:id/role (admin only)
router.patch('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'professional', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/users/:id/status (admin suspend/activate)
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true })
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
