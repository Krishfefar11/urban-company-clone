import express from 'express'
import Professional from '../models/Professional.js'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin, requireProfessional } from '../middleware/role.js'
import { sendProApproval } from '../services/emailService.js'
import logger from '../utils/logger.js'

const router = express.Router()

// GET /api/professionals — paginated list (public, approved only)
router.get('/', async (req, res) => {
  try {
    const { city, service } = req.query
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const skip  = (page - 1) * limit

    let query = { status: 'approved' }
    if (city)    query.city     = { $regex: new RegExp(city, 'i') }
    if (service) query.services = service

    const [pros, total] = await Promise.all([
      Professional.find(query).populate('user', 'name avatar email phone').skip(skip).limit(limit),
      Professional.countDocuments(query),
    ])
    res.json({ success: true, pros, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/professionals/apply
router.post('/apply', authenticate, async (req, res) => {
  try {
    const exists = await Professional.findOne({ user: req.user._id })
    if (exists) return res.status(400).json({ success: false, message: 'Application already exists' })
    const pro = await Professional.create({ ...req.body, user: req.user._id, status: 'pending' })
    res.status(201).json({ success: true, pro })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/professionals/me
router.get('/me', authenticate, requireProfessional, async (req, res) => {
  try {
    const pro = await Professional.findOne({ user: req.user._id }).populate('user', 'name email phone avatar').populate('services')
    if (!pro) return res.status(404).json({ success: false, message: 'Professional profile not found' })
    res.json({ success: true, pro })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/professionals/me
router.put('/me', authenticate, requireProfessional, async (req, res) => {
  try {
    const allowed = ['bio', 'experience', 'city', 'areas', 'availability', 'isOnline', 'services']
    const updates = Object.keys(req.body)
      .filter(k => allowed.includes(k))
      .reduce((acc, k) => ({ ...acc, [k]: req.body[k] }), {})

    const pro = await Professional.findOneAndUpdate({ user: req.user._id }, updates, { new: true })
    res.json({ success: true, pro })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/professionals/admin/pending — admin sees all pending applications (paginated)
router.get('/admin/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const skip  = (page - 1) * limit
    const status = req.query.status || 'pending'

    const [pros, total] = await Promise.all([
      Professional.find({ status }).populate('user', 'name email phone avatar').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Professional.countDocuments({ status }),
    ])
    res.json({ success: true, pros, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/professionals/:id/approve — admin approves / rejects / suspends
router.patch('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['approved', 'rejected', 'suspended', 'pending']
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` })
    }

    const pro = await Professional.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user')
    if (!pro) return res.status(404).json({ success: false, message: 'Professional not found' })

    // Update user role on approval
    if (status === 'approved') {
      await User.findByIdAndUpdate(pro.user._id, { role: 'professional' })
    } else if (status === 'rejected' || status === 'suspended') {
      await User.findByIdAndUpdate(pro.user._id, { role: 'user' })
    }

    // Send email notification
    void sendProApproval(pro.user, status === 'approved')

    logger.info(`[ADMIN] Professional ${pro._id} status set to ${status}`)
    res.json({ success: true, pro })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
