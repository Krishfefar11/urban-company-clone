/**
 * bookings.test.js — Unit tests for booking business logic.
 *
 * Tests:
 *   1. Professional auto-assignment filtering logic
 *   2. Booking status transition validation
 *   3. Booking date/time validation
 */

import { jest } from '@jest/globals'

// ── Booking status machine ────────────────────────────────────────────────────
// Mirrors the NEXT_STATUS map used in the bookings route
const VALID_TRANSITIONS = {
  pending:     ['confirmed', 'cancelled'],
  confirmed:   ['on_the_way', 'cancelled'],
  on_the_way:  ['in_progress'],
  in_progress: ['completed'],
  completed:   [],
  cancelled:   [],
}

const isValidTransition = (from, to) =>
  VALID_TRANSITIONS[from]?.includes(to) ?? false

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Booking status transitions', () => {
  it('allows confirmed → on_the_way', () => {
    expect(isValidTransition('confirmed', 'on_the_way')).toBe(true)
  })

  it('allows on_the_way → in_progress', () => {
    expect(isValidTransition('on_the_way', 'in_progress')).toBe(true)
  })

  it('allows in_progress → completed', () => {
    expect(isValidTransition('in_progress', 'completed')).toBe(true)
  })

  it('allows pending → cancelled', () => {
    expect(isValidTransition('pending', 'cancelled')).toBe(true)
  })

  it('rejects completed → any status', () => {
    ['pending', 'confirmed', 'on_the_way', 'in_progress', 'cancelled'].forEach(to => {
      expect(isValidTransition('completed', to)).toBe(false)
    })
  })

  it('rejects cancelled → any status', () => {
    ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed'].forEach(to => {
      expect(isValidTransition('cancelled', to)).toBe(false)
    })
  })

  it('rejects invalid skip: pending → in_progress', () => {
    expect(isValidTransition('pending', 'in_progress')).toBe(false)
  })

  it('rejects going backwards: in_progress → confirmed', () => {
    expect(isValidTransition('in_progress', 'confirmed')).toBe(false)
  })
})

// ── Scheduling validation ─────────────────────────────────────────────────────
const isScheduledInFuture = (dateStr) => new Date(dateStr) > new Date()

const hasConflict = (existingBookings, newStart, bufferHours = 2) => {
  const start = new Date(newStart)
  const bufferMs = bufferHours * 60 * 60 * 1000

  return existingBookings.some(b => {
    const existing = new Date(b.scheduledAt)
    return Math.abs(start - existing) < bufferMs
  })
}

describe('Booking scheduling validation', () => {
  it('rejects a scheduledAt in the past', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    expect(isScheduledInFuture(yesterday)).toBe(false)
  })

  it('accepts a scheduledAt in the future', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString()
    expect(isScheduledInFuture(tomorrow)).toBe(true)
  })

  it('detects a scheduling conflict within 2-hour buffer', () => {
    const base = new Date('2026-07-10T10:00:00Z')
    const existing = [{ scheduledAt: base.toISOString() }]
    // 1 hour later — within 2-hour buffer
    const conflicting = new Date(base.getTime() + 60 * 60 * 1000).toISOString()
    expect(hasConflict(existing, conflicting)).toBe(true)
  })

  it('does not flag a conflict outside 2-hour buffer', () => {
    const base = new Date('2026-07-10T10:00:00Z')
    const existing = [{ scheduledAt: base.toISOString() }]
    // 3 hours later — outside 2-hour buffer
    const safe = new Date(base.getTime() + 3 * 60 * 60 * 1000).toISOString()
    expect(hasConflict(existing, safe)).toBe(false)
  })

  it('returns no conflict when there are no existing bookings', () => {
    expect(hasConflict([], new Date().toISOString())).toBe(false)
  })
})

// ── Professional auto-assignment filtering ────────────────────────────────────
const filterEligiblePros = (professionals, city, serviceId, existingBookings, scheduledAt) => {
  return professionals.filter(pro => {
    if (pro.status !== 'approved')      return false
    if (!pro.isAvailable)               return false
    if (pro.city !== city)              return false
    if (!pro.services.includes(serviceId)) return false
    const proBookings = existingBookings.filter(b => b.professionalId === pro._id)
    if (hasConflict(proBookings, scheduledAt)) return false
    return true
  })
}

describe('Professional auto-assignment', () => {
  const SERVICE_ID   = 'svc_cleaning'
  const CITY         = 'Ahmedabad'
  const SCHEDULED_AT = new Date('2026-07-10T11:00:00Z').toISOString()

  const basePro = {
    _id:         'pro_1',
    status:      'approved',
    isAvailable: true,
    city:        CITY,
    services:    [SERVICE_ID],
  }

  it('includes an eligible professional', () => {
    const result = filterEligiblePros([basePro], CITY, SERVICE_ID, [], SCHEDULED_AT)
    expect(result).toHaveLength(1)
    expect(result[0]._id).toBe('pro_1')
  })

  it('excludes a professional from a different city', () => {
    const pro = { ...basePro, city: 'Mumbai' }
    expect(filterEligiblePros([pro], CITY, SERVICE_ID, [], SCHEDULED_AT)).toHaveLength(0)
  })

  it('excludes a professional who is unavailable', () => {
    const pro = { ...basePro, isAvailable: false }
    expect(filterEligiblePros([pro], CITY, SERVICE_ID, [], SCHEDULED_AT)).toHaveLength(0)
  })

  it('excludes a professional with pending/rejected status', () => {
    ['pending', 'rejected'].forEach(status => {
      const pro = { ...basePro, status }
      expect(filterEligiblePros([pro], CITY, SERVICE_ID, [], SCHEDULED_AT)).toHaveLength(0)
    })
  })

  it('excludes a professional who does not offer the requested service', () => {
    const pro = { ...basePro, services: ['svc_beauty'] }
    expect(filterEligiblePros([pro], CITY, SERVICE_ID, [], SCHEDULED_AT)).toHaveLength(0)
  })

  it('excludes a professional with a conflicting booking', () => {
    const conflicting = [{
      professionalId: 'pro_1',
      scheduledAt: new Date('2026-07-10T10:30:00Z').toISOString(),  // 30 min before — within 2hr buffer
    }]
    expect(filterEligiblePros([basePro], CITY, SERVICE_ID, conflicting, SCHEDULED_AT)).toHaveLength(0)
  })

  it('returns multiple eligible professionals', () => {
    const pro2 = { ...basePro, _id: 'pro_2' }
    const result = filterEligiblePros([basePro, pro2], CITY, SERVICE_ID, [], SCHEDULED_AT)
    expect(result).toHaveLength(2)
  })
})
