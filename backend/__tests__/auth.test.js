/**
 * auth.test.js — Unit tests for the authenticate middleware.
 *
 * Mocks firebase-admin and the User model.
 * Uses jest.unstable_mockModule with dynamic imports (ESM-safe pattern).
 */

import { jest } from '@jest/globals'

// ── Mock declarations (must happen before any imports) ───────────────────────
const mockVerifyIdToken = jest.fn()
const mockAuth          = jest.fn(() => ({ verifyIdToken: mockVerifyIdToken }))

jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    auth: mockAuth,
  },
}))

const mockUserFindOne = jest.fn()
jest.unstable_mockModule('../models/User.js', () => ({
  default: { findOne: mockUserFindOne },
}))

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeReq = (auth) => ({ headers: { authorization: auth } })
const makeRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json   = jest.fn().mockReturnValue(res)
  return res
}

// ── Test suite ────────────────────────────────────────────────────────────────
describe('authenticate middleware', () => {
  let authenticate

  beforeAll(async () => {
    // Dynamic import AFTER mocks are registered
    const mod = await import('../middleware/auth.js')
    authenticate = mod.authenticate
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockVerifyIdToken.mockReset()
    mockUserFindOne.mockReset()
  })

  it('returns 401 when Authorization header is missing', async () => {
    const req  = makeReq(undefined)
    const res  = makeRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when Authorization header does not start with Bearer', async () => {
    const req  = makeReq('Basic abc123')
    const res  = makeRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when Firebase token is invalid / throws', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('Token invalid'))

    const req  = makeReq('Bearer bad_token')
    const res  = makeRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when user not found in database', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'uid_123' })
    mockUserFindOne.mockResolvedValueOnce(null)

    const req  = makeReq('Bearer valid_token')
    const res  = makeRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 when user account is suspended (isActive: false)', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'uid_suspended' })
    mockUserFindOne.mockResolvedValueOnce({ _id: 'user1', isActive: false, role: 'user' })

    const req  = makeReq('Bearer suspended_token')
    const res  = makeRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next() and attaches req.user when token is valid', async () => {
    const fakeUser = { _id: 'user1', name: 'Krish', isActive: true, role: 'user' }
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'uid_valid' })
    mockUserFindOne.mockResolvedValueOnce(fakeUser)

    const req  = makeReq('Bearer valid_token')
    const res  = makeRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toEqual(fakeUser)
    expect(res.status).not.toHaveBeenCalled()
  })
})
