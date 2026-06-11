import express from 'express'
import Booking from '../models/Booking.js'
import User from '../models/User.js'
import Professional from '../models/Professional.js'
import Service from '../models/Service.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/role.js'

const router = express.Router()

// GET /api/admin/stats — platform-wide KPIs
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const now     = new Date()
    const today   = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      totalPros,
      totalBookings,
      todayBookings,
      monthBookings,
      pendingPros,
      totalRevenue,
      monthRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Professional.countDocuments({ status: 'approved' }),
      Booking.countDocuments(),
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ createdAt: { $gte: monthStart } }),
      Professional.countDocuments({ status: 'pending' }),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } },
      ]),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } },
      ]),
    ])

    // Last 7 days bookings count per day
    const weekly = await Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        bookings: { $sum: 1 },
        revenue:  { $sum: '$payment.amount' },
      }},
      { $sort: { _id: 1 } },
    ])

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPros,
        totalBookings,
        todayBookings,
        monthBookings,
        pendingPros,
        totalRevenue:  totalRevenue[0]?.total  || 0,
        monthRevenue:  monthRevenue[0]?.total  || 0,
      },
      weekly,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/admin/bookings — all bookings paginated
router.get('/bookings', authenticate, requireAdmin, async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1
    const limit  = parseInt(req.query.limit) || 20
    const skip   = (page - 1) * limit
    const query  = {}
    if (req.query.status) query.status = req.query.status

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email')
        .populate('service', 'title category')
        .populate({ path: 'professional', populate: { path: 'user', select: 'name' } })
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

export default router
