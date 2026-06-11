import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Booking from '../models/Booking.js'
import PromoCode, { PromoUsage } from '../models/PromoCode.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/role.js'
import logger, { logPaymentEvent } from '../utils/logger.js'

const router = express.Router()

const getRazorpay = () => {
  const key_id     = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env')
  }
  return new Razorpay({ key_id, key_secret })
}

// ── POST /api/payments/create-order ──────────────────────────────────────────
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount, bookingId, currency = 'INR' } = req.body
    if (!amount || !bookingId) {
      return res.status(400).json({ message: 'amount and bookingId are required' })
    }
    if (amount <= 0) return res.status(400).json({ message: 'amount must be positive' })

    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100),     // paise
      currency,
      receipt:  `booking_${bookingId}`,
      notes:    { bookingId, userId: req.user._id.toString() },
    })

    // Store Razorpay order ID on booking
    await Booking.findByIdAndUpdate(bookingId, { 'payment.razorpayOrderId': order.id })

    logPaymentEvent('order_created', { bookingId, orderId: order.id, amount })
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (err) {
    logger.error(`Razorpay order error: ${err.message}`)
    res.status(500).json({ message: err.message || 'Payment initialisation failed' })
  }
})

// ── POST /api/payments/verify ────────────────────────────────────────────────
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' })
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      logPaymentEvent('signature_mismatch', { bookingId, orderId: razorpay_order_id })
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' })
    }

    // Mark booking as paid
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        'payment.status':             'paid',
        'payment.razorpayPaymentId':  razorpay_payment_id,
        'payment.razorpayOrderId':    razorpay_order_id,
      },
      { new: true }
    )
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    logPaymentEvent('payment_verified', { bookingId, paymentId: razorpay_payment_id })
    res.json({ success: true, paymentId: razorpay_payment_id, booking })
  } catch (err) {
    logger.error(`Payment verify error: ${err.message}`)
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/payments/apply-promo ───────────────────────────────────────────
router.post('/apply-promo', authenticate, async (req, res) => {
  try {
    const { code, orderAmount } = req.body
    if (!code)        return res.status(400).json({ success: false, message: 'Promo code is required' })
    if (!orderAmount) return res.status(400).json({ success: false, message: 'orderAmount is required' })

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim(), isActive: true })
    if (!promo) return res.status(404).json({ success: false, message: 'Invalid promo code' })

    // Check expiry
    if (new Date() > promo.expiresAt) {
      return res.status(400).json({ success: false, message: 'This promo code has expired' })
    }

    // Check global usage limit
    if (promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit' })
    }

    // Check minimum order amount
    if (orderAmount < promo.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount for this code is ₹${promo.minOrderAmount}` })
    }

    // Check per-user limit
    const userUsage = await PromoUsage.countDocuments({ promoCode: promo._id, user: req.user._id })
    if (userUsage >= promo.perUserLimit) {
      return res.status(400).json({ success: false, message: 'You have already used this promo code' })
    }

    // Calculate discount
    let discountAmount = 0
    if (promo.discountType === 'percentage') {
      discountAmount = Math.round(orderAmount * (promo.discountValue / 100))
      if (promo.maxDiscount) discountAmount = Math.min(discountAmount, promo.maxDiscount)
    } else {
      discountAmount = Math.min(promo.discountValue, orderAmount)
    }

    res.json({
      success: true,
      promoId:        promo._id,
      code:           promo.code,
      discountAmount,
      finalAmount:    orderAmount - discountAmount,
      discountType:   promo.discountType,
      discountValue:  promo.discountValue,
    })
  } catch (err) {
    logger.error(`Apply promo error: ${err.message}`)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/payments/confirm-promo ─────────────────────────────────────────
// Call this after booking is created to increment usage count
router.post('/confirm-promo', authenticate, async (req, res) => {
  try {
    const { promoId, bookingId } = req.body
    if (!promoId || !bookingId) {
      return res.status(400).json({ success: false, message: 'promoId and bookingId required' })
    }

    await Promise.all([
      PromoCode.findByIdAndUpdate(promoId, { $inc: { usedCount: 1 } }),
      PromoUsage.create({ promoCode: promoId, user: req.user._id, bookingId }),
    ])

    res.json({ success: true, message: 'Promo usage recorded' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Admin: create promo code ─────────────────────────────────────────────────
router.post('/promo-codes', authenticate, requireAdmin, async (req, res) => {
  try {
    const promo = await PromoCode.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json({ success: true, promo })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: list all promo codes ──────────────────────────────────────────────
router.get('/promo-codes', authenticate, requireAdmin, async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 })
    res.json({ success: true, promos })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
