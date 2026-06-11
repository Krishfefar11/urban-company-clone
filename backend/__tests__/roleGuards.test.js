/**
 * roleGuards.test.js — Unit tests for role-based middleware.
 *
 * requireRole, requireAdmin, requireProfessional, requireUser
 * from middleware/role.js
 */

import { jest } from '@jest/globals'
import { requireRole, requireAdmin, requireProfessional, requireUser } from '../middleware/role.js'

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json   = jest.fn().mockReturnValue(res)
  return res
}

const makeReq = (user) => ({ user })

// ── Tests ────────────────────────────────────────────────────────────────────
describe('requireRole middleware', () => {

  it('returns 401 when req.user is not set', () => {
    const req  = makeReq(undefined)
    const res  = makeRes()
    const next = jest.fn()

    requireRole('admin')(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 when user role is not in the allowed list', () => {
    const req  = makeReq({ role: 'user' })
    const res  = makeRes()
    const next = jest.fn()

    requireRole('admin')(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next() when user role matches', () => {
    const req  = makeReq({ role: 'admin' })
    const res  = makeRes()
    const next = jest.fn()

    requireRole('admin')(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('allows any of multiple roles', () => {
    const req1 = makeReq({ role: 'professional' })
    const req2 = makeReq({ role: 'admin' })
    const res1 = makeRes()
    const res2 = makeRes()
    const next = jest.fn()

    requireRole('professional', 'admin')(req1, res1, next)
    requireRole('professional', 'admin')(req2, res2, next)

    expect(next).toHaveBeenCalledTimes(2)
  })
})

describe('requireAdmin', () => {
  it('blocks non-admins', () => {
    const req  = makeReq({ role: 'user' })
    const res  = makeRes()
    const next = jest.fn()

    requireAdmin(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('allows admins', () => {
    const req  = makeReq({ role: 'admin' })
    const res  = makeRes()
    const next = jest.fn()

    requireAdmin(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})

describe('requireProfessional', () => {
  it('blocks regular users', () => {
    const req  = makeReq({ role: 'user' })
    const res  = makeRes()
    const next = jest.fn()

    requireProfessional(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('allows professionals', () => {
    const req  = makeReq({ role: 'professional' })
    const res  = makeRes()
    const next = jest.fn()

    requireProfessional(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('allows admins (admin can do everything a professional can)', () => {
    const req  = makeReq({ role: 'admin' })
    const res  = makeRes()
    const next = jest.fn()

    requireProfessional(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})

describe('requireUser', () => {
  it('allows users', () => {
    ['user', 'professional', 'admin'].forEach(role => {
      const req  = makeReq({ role })
      const res  = makeRes()
      const next = jest.fn()

      requireUser(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
