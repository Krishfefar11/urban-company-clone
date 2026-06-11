// Auth is Firebase-only. No bcrypt, no JWT, no custom password hashing.
// All tokens are Firebase ID tokens verified via Firebase Admin SDK.
import initFirebase from '../config/firebase.js'
import User from '../models/User.js'

// Verify Firebase ID token from Authorization header
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const token = header.split('Bearer ')[1]
    const admin = initFirebase()
    const decoded = await admin.auth().verifyIdToken(token)

    // Attach user from DB — auto-create on first request if missing.
    // This handles Google OAuth, any signup path where /auth/register was
    // never called, and future auth methods without any code change.
    let user = await User.findOne({ firebaseUid: decoded.uid })
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name:  decoded.name  || decoded.email?.split('@')[0] || 'User',
        email: decoded.email || '',
        role:  'user',
        isActive: true,
      })
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' })

    req.user = user
    next()
  } catch (err) {
    console.error('Auth error:', err.message)
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

// Optional auth — attach user if token present, but don't block
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const token = header.split('Bearer ')[1]
      const admin = initFirebase()
      const decoded = await admin.auth().verifyIdToken(token)
      req.user = await User.findOne({ firebaseUid: decoded.uid })
    }
  } catch (_) {}
  next()
}
