import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  FiArrowLeft, FiArrowRight, FiCheck,
  FiMapPin, FiClock, FiCreditCard, FiDollarSign, FiAlertCircle,
} from 'react-icons/fi'
import { fetchServiceById } from '../../api/services.js'
import { createBooking } from '../../api/bookings.js'
import { useAuth } from '../../context/AuthContext.jsx'

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i + 1)
  return {
    label: i === 0 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
    sub:   d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    date:  d,
  }
})

const SLOTS    = ['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM']
const SLOT_HOURS = [7,8,9,10,11,12,13,14,15,16,17,18]
const STEPS    = ['Plan', 'Date & Time', 'Address', 'Payment']

const Booking = () => {
  const { serviceId } = useParams()
  const navigate      = useNavigate()
  const { dbUser, isAuthenticated, loading: authLoading } = useAuth()

  // Guard: must be logged in to book
  if (!authLoading && !isAuthenticated) {
    navigate(`/login?redirect=/booking/${serviceId}`, { replace: true })
    return null
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['service', serviceId],
    queryFn:  () => fetchServiceById(serviceId),
    enabled:  !!serviceId,
  })

  const svc = data?.service

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (res) => navigate(`/booking/confirmation/${res.booking._id}`),
  })

  const [step,    setStep]    = useState(0)
  const [plan,    setPlan]    = useState(0)
  const [dateIdx, setDateIdx] = useState(0)
  const [slot,    setSlot]    = useState(null)

  const defaultAddr = dbUser?.addresses?.find(a => a.isDefault) || dbUser?.addresses?.[0]
  const [address, setAddress] = useState({
    line1:   defaultAddr?.line1   || '',
    line2:   defaultAddr?.line2   || '',
    city:    defaultAddr?.city    || dbUser?.city || 'Ahmedabad',
    pincode: defaultAddr?.pincode || '',
  })
  const [payment, setPayment] = useState('online')

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" aria-label="Loading booking">
      <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (isError || !svc) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-1">
        <FiAlertCircle size={24} className="text-red-400" />
      </div>
      <p className="text-base font-semibold text-neutral-700">Service not found</p>
      <button onClick={() => navigate('/services')} className="btn btn-outline btn-sm">Browse services</button>
    </div>
  )

  const pricing  = svc.pricing || []
  const price    = pricing[plan]?.price || 0
  const planName = pricing[plan]?.name || ''

  const canNext = [
    true,
    slot !== null,
    address.line1.trim().length > 0 && address.city.trim().length > 0,
    true,
  ]

  const handleBook = () => {
    const selectedDate = new Date(DATES[dateIdx].date)
    selectedDate.setHours(SLOT_HOURS[slot], 0, 0, 0)
    mutation.mutate({
      service:     serviceId,
      scheduledAt: selectedDate.toISOString(),
      address,
      pricingTier: { name: planName, price },
      payment:     { method: payment },
    })
  }

  return (
    <div className="bg-white min-h-screen">

      {/* Step header */}
      <div className="border-b border-neutral-100 sticky top-14 md:top-16 z-[100] bg-white">
        <div className="page-container py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
              aria-label={step > 0 ? 'Previous step' : 'Go back'}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors flex-shrink-0"
            >
              <FiArrowLeft size={17} className="text-neutral-700" />
            </button>

            {/* Progress */}
            <div className="flex items-center gap-1 flex-1 overflow-hidden" role="list" aria-label="Booking steps">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1 min-w-0" role="listitem">
                  <div className={`flex items-center gap-1.5 min-w-0 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i < step
                        ? 'bg-brand text-white'
                        : i === step
                        ? 'bg-neutral-900 text-white'
                        : 'border border-neutral-300 text-neutral-400'
                    }`}>
                      {i < step ? <FiCheck size={10} /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium truncate hidden sm:block ${i === step ? 'text-neutral-900' : 'text-neutral-400'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px flex-1 mx-1 ${i < step ? 'bg-brand' : 'bg-neutral-200'}`} aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-6 flex flex-col lg:flex-row gap-6 pb-28">

        {/* Main step content */}
        <div className="flex-1">

          {/* Step 0 — Plan */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-1">Choose a plan</h2>
              <p className="text-sm text-neutral-500 mb-5">{svc.title}</p>
              {pricing.length === 0 ? (
                <div className="border border-neutral-100 rounded-xl p-8 text-center text-neutral-400 text-sm">
                  No pricing tiers configured for this service.
                </div>
              ) : (
                <div className="space-y-2.5" role="radiogroup" aria-label="Pricing plans">
                  {pricing.map((p, i) => (
                    <button
                      key={i}
                      role="radio"
                      aria-checked={plan === i}
                      onClick={() => setPlan(i)}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all duration-150 text-left ${
                        plan === i
                          ? 'border-neutral-900 bg-neutral-50'
                          : 'border-neutral-100 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          plan === i ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                        }`}>
                          {plan === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{p.name}</p>
                          {p.description && <p className="text-xs text-neutral-500 mt-0.5">{p.description}</p>}
                        </div>
                      </div>
                      <span className="text-base font-bold text-neutral-900">₹{p.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Date & Time */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-1">When do you need it?</h2>
              <p className="text-sm text-neutral-500 mb-5">Pick a date and time that works for you</p>

              {/* Dates */}
              <div className="flex gap-2 overflow-x-auto scroll-hide pb-1 mb-6" role="group" aria-label="Select date">
                {DATES.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setDateIdx(i)}
                    aria-pressed={dateIdx === i}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all duration-150 min-w-[72px] ${
                      dateIdx === i
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-100 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <span className="text-xs font-medium">{d.label}</span>
                    <span className="text-sm font-bold">{d.sub}</span>
                  </button>
                ))}
              </div>

              {/* Slots */}
              <p className="text-sm font-medium text-neutral-700 mb-3">Available time slots</p>
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 gap-2" role="group" aria-label="Select time slot">
                {SLOTS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSlot(i)}
                    aria-pressed={slot === i}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                      slot === i
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-100 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Address */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-1">Service address</h2>
              <p className="text-sm text-neutral-500 mb-5">Where should the professional come?</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="addr-line1" className="label">
                    Address Line 1 <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="addr-line1"
                    className="input"
                    placeholder="Flat / House no., Building name"
                    value={address.line1}
                    onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                    required
                    autoComplete="address-line1"
                  />
                </div>
                <div>
                  <label htmlFor="addr-line2" className="label">Address Line 2</label>
                  <input
                    id="addr-line2"
                    className="input"
                    placeholder="Street, Area, Landmark (optional)"
                    value={address.line2}
                    onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                    autoComplete="address-line2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="addr-city" className="label">City</label>
                    <input
                      id="addr-city"
                      className="input"
                      value={address.city}
                      onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label htmlFor="addr-pincode" className="label">
                      Pincode
                    </label>
                    <input
                      id="addr-pincode"
                      className="input"
                      placeholder="380001"
                      maxLength={6}
                      value={address.pincode}
                      onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))}
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Payment */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-1">Payment method</h2>
              <p className="text-sm text-neutral-500 mb-5">Choose how you'd like to pay</p>

              <div className="space-y-2.5 mb-6" role="radiogroup" aria-label="Payment method">
                {[
                  { key: 'online', icon: FiCreditCard, label: 'Pay online',       sub: 'Credit / Debit card, UPI, Net banking' },
                  { key: 'cash',   icon: FiDollarSign, label: 'Pay at doorstep',  sub: 'Cash after service completion'         },
                ].map(opt => (
                  <button
                    key={opt.key}
                    role="radio"
                    aria-checked={payment === opt.key}
                    onClick={() => setPayment(opt.key)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-150 text-left ${
                      payment === opt.key
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-100 hover:border-neutral-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${payment === opt.key ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                      <opt.icon size={17} className={payment === opt.key ? 'text-white' : 'text-neutral-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">{opt.label}</p>
                      <p className="text-xs text-neutral-500">{opt.sub}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      payment === opt.key ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                    }`}>
                      {payment === opt.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Order summary */}
              <div className="bg-neutral-50 rounded-xl p-5 space-y-2.5 text-sm">
                <p className="font-semibold text-neutral-900 mb-1">Order summary</p>
                <div className="flex justify-between text-neutral-600"><span>{svc.title}</span><span>₹{price}</span></div>
                <div className="flex justify-between text-neutral-600"><span>Plan</span><span className="font-medium text-neutral-800">{planName}</span></div>
                <div className="flex justify-between text-neutral-600">
                  <span>Date &amp; time</span>
                  <span>{DATES[dateIdx].label}, {DATES[dateIdx].sub}{slot !== null ? ` · ${SLOTS[slot]}` : ''}</span>
                </div>
                <div className="flex justify-between text-neutral-600"><span>Convenience fee</span><span className="text-brand font-medium">Free</span></div>
                <div className="border-t border-neutral-200 pt-2.5 flex justify-between font-bold text-neutral-900">
                  <span>Total</span><span>₹{price}</span>
                </div>
              </div>

              {mutation.isError && (
                <div className="error-banner mt-4" role="alert">
                  <FiAlertCircle size={14} className="flex-shrink-0" />
                  {mutation.error?.message || 'Booking failed. Please try again.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar summary */}
        <div className="hidden lg:block lg:w-60 flex-shrink-0">
          <div className="border border-neutral-200 rounded-xl p-4 sticky top-32 shadow-sm">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Your booking</p>
            <p className="font-bold text-neutral-900 text-sm mb-0.5 line-clamp-2">{svc.title}</p>
            {planName && <p className="text-xs text-neutral-500 mb-3">{planName}</p>}
            <div className="space-y-1.5 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
              {slot !== null && (
                <div className="flex items-center gap-1.5">
                  <FiClock size={10} className="flex-shrink-0" />
                  {DATES[dateIdx].label} · {SLOTS[slot]}
                </div>
              )}
              {address.line1 && (
                <div className="flex items-start gap-1.5">
                  <FiMapPin size={10} className="mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{address.line1}, {address.city}</span>
                </div>
              )}
            </div>
            {price > 0 && (
              <div className="border-t border-neutral-100 mt-3 pt-3 flex justify-between text-sm font-bold text-neutral-900">
                <span>Total</span>
                <span>₹{price}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-3 z-[100] safe-pb">
        <div className="page-container">
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext[step]}
              className="btn btn-primary w-full"
            >
              Continue <FiArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleBook}
              disabled={mutation.isPending}
              className="btn btn-brand w-full"
            >
              {mutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming…</>
              ) : `Confirm & Pay ₹${price}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Booking
