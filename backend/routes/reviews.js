import express from 'express'
import Review from '../models/Review.js'
import Service from '../models/Service.js'
import Professional from '../models/Professional.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// POST /api/reviews  — submit review after booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { booking, professional, service, rating, comment } = req.body
    const review = await Review.create({ booking, professional, service, rating, comment, user: req.user._id })

    // Update service & pro average ratings
    const [svcReviews, proReviews] = await Promise.all([
      Review.find({ service }),
      Review.find({ professional }),
    ])
    const avgSvc = svcReviews.reduce((a, r) => a + r.rating, 0) / svcReviews.length
    const avgPro = proReviews.reduce((a, r) => a + r.rating, 0) / proReviews.length

    await Promise.all([
      Service.findByIdAndUpdate(service, { rating: avgSvc.toFixed(1), totalReviews: svcReviews.length }),
      Professional.findByIdAndUpdate(professional, { rating: avgPro.toFixed(1), totalReviews: proReviews.length }),
    ])

    res.status(201).json({ success: true, review })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/reviews/my — fetch current user's reviews
router.get('/my', authenticate, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('service', 'title image').sort({ createdAt: -1 })
    res.json({ success: true, reviews })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/reviews/service/:serviceId
router.get('/service/:serviceId', async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('user', 'name avatar').sort({ createdAt: -1 }).limit(20)
    res.json({ success: true, reviews })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
