// Must be used AFTER authenticate middleware
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' })
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}` })
  }
  next()
}

export const requireAdmin        = requireRole('admin')
export const requireProfessional = requireRole('professional', 'admin')
export const requireUser         = requireRole('user', 'professional', 'admin')
