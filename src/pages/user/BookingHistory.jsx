import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FiClock, FiStar, FiRepeat, FiX, FiChevronRight,
  FiCalendar, FiSearch, FiFilter, FiAlertCircle, FiRefreshCw,
} from 'react-icons/fi'
import ReviewForm from '../../components/reviews/ReviewForm'
import { fetchMyBookings, cancelBooking } from '../../api/bookings'

const STATUS_CONFIG = {
  completed:   { label: 'Completed',   bg: 'bg-green-50',  text: 'text-green-700'   },
  upcoming:    { label: 'Upcoming',    bg: 'bg-blue-50',   text: 'text-blue-700'    },
  confirmed:   { label: 'Confirmed',   bg: 'bg-blue-50',   text: 'text-blue-700'    },
  pending:     { label: 'Pending',     bg: 'bg-amber-50',  text: 'text-amber-700'   },
  cancelled:   { label: 'Cancelled',   bg: 'bg-red-50',    text: 'text-red-600'     },
  in_progress: { label: 'In Progress', bg: 'bg-purple-50', text: 'text-purple-700'  },
  on_the_way:  { label: 'On the way',  bg: 'bg-indigo-50', text: 'text-indigo-700'  },
}

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled']

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

const SkeletonCard = () => (
  <div className="bg-white border border-neutral-100 rounded-xl p-4" aria-hidden="true">
    <div className="flex gap-3">
      <div className="skeleton w-14 h-14 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="skeleton h-3 rounded w-2/3" />
      </div>
    </div>
  </div>
)

const BookingHistory = () => {
  const [tab,         setTab]         = useState('All')
  const [search,      setSearch]      = useState('')
  const [ratingModal, setRatingModal] = useState(null)
  const [page,        setPage]        = useState(1)
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const statusFilter = tab === 'All' ? null : tab === 'Upcoming' ? 'confirmed' : tab.toLowerCase()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-bookings', { page, status: statusFilter }],
    queryFn:  () => fetchMyBookings({ page, limit: 10, status: statusFilter }),
  })

  const bookings   = data?.bookings   || []
  const total      = data?.total      || 0
  const totalPages = data?.totalPages || 1

  const filtered = bookings.filter(b => {
    if (!search.trim()) return true
    return (b.service?.title || '').toLowerCase().includes(search.toLowerCase())
  })

  const cancelMut = useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  })

  const handleCancel = (id) => {
    if (window.confirm('Cancel this booking?')) cancelMut.mutate(id)
  }

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Header */}
      <div className="bg-neutral-900 pt-8 pb-20">
        <div className="page-container">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-white font-bold text-lg">My Bookings</h1>
              {!isLoading && (
                <p className="text-neutral-400 text-xs mt-0.5" aria-live="polite">{total} total bookings</p>
              )}
            </div>
            <button
              onClick={() => navigate('/services')}
              className="bg-brand hover:bg-brand-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-colors duration-150"
            >
              + Book a service
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <label htmlFor="bookings-search" className="sr-only">Search bookings</label>
            <FiSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="bookings-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search bookings…"
              className="w-full bg-white/10 text-white placeholder-neutral-500 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand border border-white/10"
            />
          </div>
        </div>
      </div>

      <div className="page-container -mt-12 pb-10 max-w-[860px]">

        {/* Tabs + content card */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-neutral-100" role="tablist" aria-label="Booking filter tabs">
            {TABS.map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => { setTab(t); setPage(1) }}
                className={`flex-1 py-3.5 text-xs font-semibold transition-all duration-150 border-b-2 ${
                  tab === t
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Error */}
            {isError && (
              <div className="error-banner mb-4" role="alert">
                <FiAlertCircle size={15} className="flex-shrink-0" />
                <span>{error?.message || 'Failed to load bookings'}</span>
              </div>
            )}

            {/* Loading */}
            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state py-16" role="status">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                  <FiFilter size={20} className="text-neutral-300" />
                </div>
                <p className="text-sm font-semibold text-neutral-900 mb-1">No bookings found</p>
                <p className="text-xs text-neutral-400 mb-5">
                  {search ? 'Try a different search term' : `Your ${tab.toLowerCase()} bookings will appear here`}
                </p>
                <button
                  onClick={() => navigate('/services')}
                  className="btn btn-primary btn-sm"
                >
                  Browse services
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(b => {
                  const cfg    = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
                  const imgSrc = b.service?.image || `https://picsum.photos/seed/${b.service?.slug || 'service'}/80/80`
                  return (
                    <div
                      key={b._id}
                      className="border border-neutral-100 rounded-xl p-4 hover:border-neutral-200 transition-colors duration-150 bg-white"
                    >
                      <div className="flex gap-3">
                        <img
                          src={imgSrc}
                          alt={b.service?.title || 'Service'}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-neutral-100"
                          onError={e => { e.target.src = 'https://picsum.photos/seed/service/80/80' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-1">
                              {b.service?.title || 'Service'}
                            </p>
                            <span className={`badge flex-shrink-0 ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5 capitalize">{b.service?.category}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <FiCalendar size={10} /> {formatDate(b.scheduledAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock size={10} /> {formatTime(b.scheduledAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-neutral-50">
                        <span className="font-bold text-neutral-900 text-sm">
                          ₹{b.pricingTier?.price || b.payment?.amount || '—'}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {b.status === 'completed' && (
                            <button
                              onClick={() => setRatingModal(b._id)}
                              className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors duration-150"
                            >
                              <FiStar size={11} /> Rate
                            </button>
                          )}
                          {b.status === 'completed' && (
                            <button
                              onClick={() => navigate('/services')}
                              className="flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors duration-150"
                            >
                              <FiRepeat size={11} /> Rebook
                            </button>
                          )}
                          {['confirmed', 'pending'].includes(b.status) && (
                            <>
                              <button
                                onClick={() => navigate(`/booking/confirmation/${b._id}`)}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors duration-150"
                              >
                                <FiRefreshCw size={11} /> Reschedule
                              </button>
                              <button
                                onClick={() => handleCancel(b._id)}
                                disabled={cancelMut.isPending}
                                className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
                              >
                                <FiX size={11} /> Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/booking/confirmation/${b._id}`)}
                            className="flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors duration-150"
                          >
                            Details <FiChevronRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4" role="navigation" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn btn-outline btn-sm disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-neutral-500" aria-live="polite">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn btn-outline btn-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating modal */}
      {ratingModal && (() => {
        const booking = bookings.find(b => b._id === ratingModal)
        return (
          <div
            className="modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Rate your experience"
          >
            <div className="modal-panel max-w-md w-full">
              <div className="modal-header">
                <h2 className="text-sm font-semibold text-neutral-900">Rate your experience</h2>
                <button
                  onClick={() => setRatingModal(null)}
                  aria-label="Close rating modal"
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
                >
                  <FiX size={15} />
                </button>
              </div>
              <div className="p-5">
                <ReviewForm
                  bookingId={ratingModal}
                  professionalId={booking?.professional?._id || booking?.professional}
                  serviceId={booking?.service?._id || booking?.service}
                  serviceName={booking?.service?.title}
                  proName={booking?.professional?.user?.name}
                  onSubmit={() => { setRatingModal(null); qc.invalidateQueries({ queryKey: ['my-bookings'] }) }}
                />
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default BookingHistory
