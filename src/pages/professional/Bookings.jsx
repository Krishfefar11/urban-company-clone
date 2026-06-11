import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiCalendar, FiClock, FiMapPin, FiPhone, FiChevronDown, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi'
import { fetchProBookings, updateBookingStatus } from '../../api/bookings.js'

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     badge: 'badge badge-gray'   },
  confirmed:   { label: 'Confirmed',   badge: 'badge badge-blue'   },
  on_the_way:  { label: 'On the way',  badge: 'badge badge-blue'   },
  in_progress: { label: 'In Progress', badge: 'badge badge-yellow' },
  completed:   { label: 'Completed',   badge: 'badge badge-green'  },
  cancelled:   { label: 'Cancelled',   badge: 'badge badge-red'    },
}

const NEXT_STATUS = {
  confirmed:   { label: 'Mark on the way',   next: 'on_the_way'  },
  on_the_way:  { label: 'Mark as started',   next: 'in_progress' },
  in_progress: { label: 'Mark as completed', next: 'completed'   },
}

const TABS = ['All', 'Active', 'Completed', 'Cancelled']

const ProBookings = () => {
  const [tab,      setTab]      = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [page,     setPage]     = useState(1)
  const queryClient = useQueryClient()

  const statusFilter =
    tab === 'Completed' ? 'completed'
    : tab === 'Cancelled' ? 'cancelled'
    : undefined

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pro-bookings', page, tab],
    queryFn:  () => fetchProBookings({ page, limit: 20, status: statusFilter }),
    keepPreviousData: true,
  })

  const bookings   = data?.bookings || []
  const totalPages = data?.totalPages || 1

  const filtered = tab === 'Active'
    ? bookings.filter(b => ['pending', 'confirmed', 'on_the_way', 'in_progress'].includes(b.status))
    : bookings

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['pro-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['pro-bookings-earnings'] })
    },
  })

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Header */}
      <div className="bg-neutral-900 px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-white font-bold text-xl">My Bookings</h1>
            {data?.total !== undefined && (
              <span className="text-neutral-400 text-sm">{data.total} total</span>
            )}
          </div>

          {/* Tab strip */}
          <div className="flex gap-0" role="tablist">
            {TABS.map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => { setTab(t); setPage(1) }}
                className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                  tab === t
                    ? 'border-brand text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3 pb-10">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4 animate-pulse" aria-hidden="true">
              <div className="flex gap-3">
                <div className="w-9 h-9 skeleton rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                  <div className="skeleton h-3 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="empty-state" role="status">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
              <FiAlertCircle size={20} className="text-red-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">Failed to load bookings</p>
            <p className="text-sm text-neutral-400">Please try again later</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
              <FiCalendar size={20} className="text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">No bookings</p>
            <p className="text-sm text-neutral-400">
              {tab !== 'All' ? `No ${tab.toLowerCase()} bookings yet` : 'Your bookings will appear here'}
            </p>
          </div>
        ) : (
          filtered.map(b => {
            const s      = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
            const action = NEXT_STATUS[b.status]
            const isOpen = expanded === b._id

            return (
              <div key={b._id} className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : b._id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-neutral-900 text-sm leading-snug">{b.service?.title || 'Service'}</p>
                      <span className={s.badge}>{s.label}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{b.user?.name || 'Customer'} · {b.address?.city || ''}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={10} />
                        {new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock size={10} />
                        {new Date(b.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <p className="font-bold text-neutral-900">₹{b.payment?.amount || b.pricingTier?.price || '—'}</p>
                    <FiChevronDown
                      size={14}
                      className={`text-neutral-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-100 p-4 space-y-3 bg-neutral-50/50">
                    {b.address?.line1 && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <FiMapPin size={13} className="text-neutral-400 flex-shrink-0" />
                        <span>{b.address.line1}, {b.address.city}</span>
                      </div>
                    )}
                    {b.user?.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <FiPhone size={13} className="text-neutral-400 flex-shrink-0" />
                        <span className="flex-1">{b.user.phone}</span>
                        <a
                          href={`tel:${b.user.phone}`}
                          className="text-xs font-medium text-brand bg-brand-50 px-3 py-1 rounded-lg hover:bg-brand-100 transition-colors"
                        >
                          Call
                        </a>
                      </div>
                    )}
                    {b.notes && (
                      <p className="text-xs text-neutral-500 bg-white rounded-xl px-3 py-2.5 border border-neutral-100">
                        Note: {b.notes}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400">
                      Booking ID: <span className="font-mono text-neutral-600">{b._id.slice(-8).toUpperCase()}</span>
                    </p>

                    {action && (
                      <button
                        onClick={() => statusMutation.mutate({ id: b._id, status: action.next })}
                        disabled={statusMutation.isPending}
                        className="btn btn-primary w-full"
                      >
                        {statusMutation.isPending
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-neutral-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline btn-sm disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-outline btn-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProBookings
