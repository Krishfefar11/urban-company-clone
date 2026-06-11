import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiCheck, FiCalendar, FiClock, FiMapPin,
  FiChevronRight, FiDownload, FiShare2,
} from 'react-icons/fi'
import BookingTracker from '../../components/common/BookingTracker'
import ChatWindow from '../../components/chat/ChatWindow'
import apiFetch from '../../api/apiClient'

const fetchBooking = (id) => apiFetch(`/bookings/${id}`)

const STEPS = [
  { key: 'confirmed',   label: 'Booking confirmed',    sub: "We've received your booking"    },
  { key: 'assigned',    label: 'Professional assigned', sub: 'A verified pro is assigned'     },
  { key: 'en_route',    label: 'Professional en route', sub: 'Your professional is on the way'},
  { key: 'in_progress', label: 'Service in progress',  sub: 'Your service has started'        },
  { key: 'completed',   label: 'Service completed',    sub: 'Hope you loved the service!'    },
]

const STATUS_TO_STEP = {
  pending:     0,
  confirmed:   1,
  on_the_way:  2,
  in_progress: 3,
  completed:   4,
}

const BookingConfirmation = () => {
  const { bookingId: id } = useParams()
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const [status,  setStatus]  = useState('confirmed')
  const [animate, setAnimate] = useState(false)

  const { data } = useQuery({
    queryKey: ['booking', id],
    queryFn:  () => fetchBooking(id),
    enabled:  !!id,
  })
  const bk = data?.booking

  const booking = {
    id:      id || 'BK' + Math.floor(100000 + Math.random() * 900000),
    service: bk?.service?.title   || searchParams.get('service') || 'Home Service',
    date:    bk?.scheduledAt
      ? new Date(bk.scheduledAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : searchParams.get('date') || '',
    time:    bk?.scheduledAt
      ? new Date(bk.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : searchParams.get('time') || '',
    address: bk?.address
      ? [bk.address.line1, bk.address.line2, bk.address.city, bk.address.pincode].filter(Boolean).join(', ')
      : '—',
    plan:    bk?.pricingTier?.name  || searchParams.get('plan')  || '—',
    price:   bk?.pricingTier?.price || bk?.payment?.amount       || searchParams.get('price') || '—',
    pro:     bk?.professional ? {
      name:   bk.professional.user?.name || 'Professional',
      rating: bk.professional.rating     || 4.9,
      jobs:   bk.professional.totalJobs  || 0,
      avatar: (bk.professional.user?.name || 'P').slice(0, 2).toUpperCase(),
    } : null,
    payment: bk?.payment?.method || searchParams.get('payment') || 'online',
  }

  useEffect(() => { setTimeout(() => setAnimate(true), 80) }, [])
  useEffect(() => { if (bk?.status) setStatus(bk.status) }, [bk?.status])

  const currentStep = STATUS_TO_STEP[status] ?? STEPS.findIndex(s => s.key === status)

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Success banner */}
      <div className={`bg-neutral-900 text-white transition-all duration-500 ${animate ? 'py-10' : 'py-6'}`}>
        <div className="page-container text-center max-w-[860px]">
          <div className={`w-14 h-14 rounded-full bg-brand flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
            <FiCheck size={24} strokeWidth={3} className="text-white" />
          </div>
          <h1 className="text-xl font-bold mb-1">Booking Confirmed!</h1>
          <p className="text-neutral-400 text-sm">
            Booking ID: <span className="text-white font-semibold font-mono">{booking.id}</span>
          </p>
        </div>
      </div>

      <div className="page-container py-5 space-y-3 pb-8 max-w-[860px]">

        {/* Service summary */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
          <p className="section-tag">Service details</p>
          <h2 className="text-base font-semibold text-neutral-900 mb-4">{booking.service}</h2>
          <div className="space-y-3">
            {booking.date && (
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <FiCalendar size={14} className="text-neutral-400 flex-shrink-0" />
                <span>{booking.date}</span>
              </div>
            )}
            {booking.time && (
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <FiClock size={14} className="text-neutral-400 flex-shrink-0" />
                <span>{booking.time}</span>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm text-neutral-600">
              <FiMapPin size={14} className="text-neutral-400 flex-shrink-0 mt-0.5" />
              <span>{booking.address}</span>
            </div>
          </div>
          <div className="border-t border-neutral-100 mt-4 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400">Package</p>
              <p className="font-medium text-neutral-900 text-sm mt-0.5">{booking.plan}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400">
                {booking.payment === 'cash' ? 'Pay on service' : 'Amount paid'}
              </p>
              <p className="font-bold text-neutral-900 mt-0.5">₹{booking.price}</p>
            </div>
          </div>
        </div>

        {/* Live status tracker */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-neutral-900">Live status</p>
            <span className="flex items-center gap-1.5 text-xs text-brand font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" aria-hidden="true" />
              Live
            </span>
          </div>
          <div role="list" aria-label="Booking progress">
            {STEPS.map((step, i) => {
              const done    = i < currentStep
              const active  = i === currentStep
              return (
                <div key={step.key} className="flex gap-3" role="listitem">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      done   ? 'bg-brand'
                      : active ? 'bg-neutral-900 ring-4 ring-neutral-100'
                      : 'bg-neutral-100'
                    }`}>
                      {done
                        ? <FiCheck size={12} className="text-white" strokeWidth={3} />
                        : <span className={`text-xs font-bold ${active ? 'text-white' : 'text-neutral-400'}`}>{i + 1}</span>
                      }
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-px h-7 my-0.5 transition-colors duration-300 ${done ? 'bg-brand' : 'bg-neutral-100'}`} aria-hidden="true" />
                    )}
                  </div>
                  <div className="pb-2 pt-1">
                    <p className={`text-sm font-medium transition-colors ${
                      active ? 'text-neutral-900' : done ? 'text-neutral-500' : 'text-neutral-300'
                    }`}>
                      {step.label}
                    </p>
                    {active && <p className="text-xs text-neutral-400 mt-0.5">{step.sub}</p>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dev status simulator */}
          {import.meta.env.DEV && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 mb-2">Simulate status (dev only):</p>
              <div className="flex flex-wrap gap-1.5">
                {STEPS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setStatus(s.key)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      status === s.key ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {s.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Professional card */}
        {booking.pro && ['assigned', 'en_route', 'in_progress', 'completed'].includes(status) && (
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Your professional</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {booking.pro.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900">{booking.pro.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  ⭐ {booking.pro.rating} · {booking.pro.jobs} jobs completed
                </p>
              </div>
              <button className="text-xs font-medium text-brand bg-brand-50 px-3 py-2 rounded-lg hover:bg-brand-100 transition-colors duration-150">
                Call
              </button>
            </div>
          </div>
        )}

        {/* Chat */}
        {id && <ChatWindow bookingId={id} />}

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm divide-y divide-neutral-50">
          {[
            { icon: FiDownload, label: 'Download receipt',     action: () => {} },
            { icon: FiShare2,   label: 'Share booking details', action: () => {} },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Icon size={14} className="text-neutral-400" />
                <span className="text-sm font-medium text-neutral-700">{label}</span>
              </div>
              <FiChevronRight size={13} className="text-neutral-300" />
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="flex gap-3 pb-2">
          <button onClick={() => navigate('/my-bookings')} className="btn btn-outline flex-1">
            My Bookings
          </button>
          <button onClick={() => navigate('/')} className="btn btn-primary flex-1">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
