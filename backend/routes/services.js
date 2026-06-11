import express from 'express'
import Service from '../models/Service.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/role.js'
import logger from '../utils/logger.js'

const router = express.Router()

// GET /api/services?category=&search=&city=&sort=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { category, search, city, sort, page: p, limit: l } = req.query
    const page  = parseInt(p)  || 1
    const limit = parseInt(l)  || 20
    const skip  = (page - 1) * limit

    let query   = { isActive: true }
    let sortObj = { totalReviews: -1 }
    let useTextScore = false

    if (category && category !== 'all') query.category = category
    if (city) query.availableCities = { $in: [new RegExp(city, 'i')] }

    if (search?.trim()) {
      // Use MongoDB text index if available, fallback to regex
      query.$text = { $search: search.trim() }
      sortObj = { score: { $meta: 'textScore' }, ...sortObj }
      useTextScore = true
    }

    const sortMap = {
      rating:     { rating: -1 },
      price_asc:  { 'pricing.0.price': 1 },
      price_desc: { 'pricing.0.price': -1 },
      popular:    { totalReviews: -1 },
    }
    if (!useTextScore && sortMap[sort]) sortObj = sortMap[sort]

    const projection = useTextScore ? { score: { $meta: 'textScore' } } : {}

    const [services, total] = await Promise.all([
      Service.find(query, projection).sort(sortObj).skip(skip).limit(limit),
      Service.countDocuments(query),
    ])

    res.json({ success: true, services, total, page, totalPages: Math.ceil(total / limit), count: services.length })
  } catch (err) {
    // If text index not created yet, fallback gracefully to regex search
    if (err.code === 27 || err.message.includes('text index')) {
      logger.warn('Text index not found, falling back to regex search')
      const { category, search, city, sort, page: p, limit: l } = req.query
      const page  = parseInt(p)  || 1
      const limit = parseInt(l)  || 20
      const skip  = (page - 1) * limit
      const query = { isActive: true }
      if (category && category !== 'all') query.category = category
      if (search?.trim()) query.title = { $regex: search.trim(), $options: 'i' }
      const services = await Service.find(query).sort({ totalReviews: -1 }).skip(skip).limit(limit)
      const total    = await Service.countDocuments(query)
      return res.json({ success: true, services, total, page, totalPages: Math.ceil(total / limit), count: services.length })
    }
    logger.error(`GET /services: ${err.message}`, err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format before hitting Mongoose — avoids CastError 500
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Service not found' })
    }
    const service = await Service.findById(req.params.id)
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' })
    res.json({ success: true, service })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/services (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const service = await Service.create(req.body)
    res.status(201).json({ success: true, service })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/services/:id (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' })
    res.json({ success: true, service })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/services/:id (admin only — soft delete)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' })
    res.json({ success: true, message: 'Service deactivated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
