import express from 'express'
import { body } from 'express-validator'
import User from '../models/User.js'
import initFirebase from '../config/firebase.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

const registerValidation = [
  body('firebaseUid').notEmpty().withMessage('firebaseUid is required'),
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid 10-digit Indian number'),
]

// POST /api/auth/register  — called after Firebase signup
router.post('/register', registerValidation, validate, async (req, res) => {
  try {
    const { firebaseUid, name, email, phone, role } = req.body
    const exists = await User.findOne({ firebaseUid })
    if (exists) return res.json({ success: true, user: exists })

    const user = await User.create({ firebaseUid, name, email, phone, role: role || 'user' })
    res.status(201).json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/auth/me  — verify token and return user
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, user: req.user })
})

export default router
