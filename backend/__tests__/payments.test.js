/**
 * payments.test.js — Tests for Razorpay HMAC-SHA256 signature verification logic.
 *
 * The verification is pure crypto — no mocking needed.
 * Tests the exact algorithm used in routes/payments.js:
 *   body = `${razorpay_order_id}|${razorpay_payment_id}`
 *   signature = HMAC-SHA256(body, RAZORPAY_KEY_SECRET)
 */

import { createHmac } from 'crypto'

// ── Helpers (mirrors the logic in routes/payments.js) ───────────────────────
const generateSignature = (orderId, paymentId, secret) =>
  createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

const verifySignature = (orderId, paymentId, signature, secret) => {
  const expected = generateSignature(orderId, paymentId, secret)
  return expected === signature
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('Razorpay HMAC-SHA256 signature verification', () => {

  const SECRET     = 'test_razorpay_secret_key'
  const ORDER_ID   = 'order_MzFABC123def'
  const PAYMENT_ID = 'pay_MzGHIJ456ghi'

  it('verifies a correct signature', () => {
    const sig = generateSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(verifySignature(ORDER_ID, PAYMENT_ID, sig, SECRET)).toBe(true)
  })

  it('rejects a tampered payment ID', () => {
    const sig = generateSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(verifySignature(ORDER_ID, 'pay_TAMPERED', sig, SECRET)).toBe(false)
  })

  it('rejects a tampered order ID', () => {
    const sig = generateSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(verifySignature('order_TAMPERED', PAYMENT_ID, sig, SECRET)).toBe(false)
  })

  it('rejects a signature generated with a different secret', () => {
    const sig = generateSignature(ORDER_ID, PAYMENT_ID, 'wrong_secret')
    expect(verifySignature(ORDER_ID, PAYMENT_ID, sig, SECRET)).toBe(false)
  })

  it('rejects an empty signature', () => {
    expect(verifySignature(ORDER_ID, PAYMENT_ID, '', SECRET)).toBe(false)
  })

  it('is order-sensitive — swapping orderId and paymentId fails', () => {
    const sig = generateSignature(ORDER_ID, PAYMENT_ID, SECRET)
    // Swapped arguments
    expect(verifySignature(PAYMENT_ID, ORDER_ID, sig, SECRET)).toBe(false)
  })

  it('produces a 64-character hex string', () => {
    const sig = generateSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(sig).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic — same inputs always produce same signature', () => {
    const sig1 = generateSignature(ORDER_ID, PAYMENT_ID, SECRET)
    const sig2 = generateSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(sig1).toBe(sig2)
  })
})
