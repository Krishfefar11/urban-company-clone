import express from 'express'
import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'
import { authenticate } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// ── GET /api/wallet/balance ──────────────────────────────────────────────────
router.get('/balance', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance')
    res.json({ success: true, balance: user.walletBalance || 0 })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/wallet/transactions (paginated) ─────────────────────────────────
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      WalletTransaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('bookingId', 'service scheduledAt'),
      WalletTransaction.countDocuments({ user: req.user._id }),
    ])

    res.json({ success: true, transactions, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/wallet/deduct — deduct balance for booking payment ──────────────
router.post('/deduct', authenticate, async (req, res) => {
  try {
    const { amount, bookingId, description } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' })

    const user = await User.findById(req.user._id)
    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' })
    }

    user.walletBalance -= amount
    await user.save()

    const tx = await WalletTransaction.create({
      user:        req.user._id,
      type:        'debit',
      amount,
      description: description || 'Booking payment',
      bookingId:   bookingId || null,
      balanceAfter: user.walletBalance,
    })

    logger.info(`[WALLET] Deducted ₹${amount} from user ${req.user._id} for booking ${bookingId}`)
    res.json({ success: true, newBalance: user.walletBalance, transaction: tx })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/wallet/credit — admin credits wallet (refund / cashback) ────────
router.post('/credit', authenticate, async (req, res) => {
  try {
    const { amount, description, bookingId } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' })

    const user = await User.findById(req.user._id)
    user.walletBalance += amount
    await user.save()

    const tx = await WalletTransaction.create({
      user:        req.user._id,
      type:        'credit',
      amount,
      description: description || 'Wallet credit',
      bookingId:   bookingId || null,
      balanceAfter: user.walletBalance,
    })

    res.json({ success: true, newBalance: user.walletBalance, transaction: tx })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
