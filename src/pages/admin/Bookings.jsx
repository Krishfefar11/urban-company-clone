import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiSearch, FiDownload, FiX } from 'react-icons/fi'
import { fetchAdminBookings } from '../../api/admin.js'

const STATUS_CONFIG = {
  completed:   { badge: 'badge badge-green'  },
  in_progress: { badge: 'badge badge-yellow' },
  confirmed:   { badge: 'badge badge-blue'   },
  on_the_way:  { badge: 'badge badge-blue'   },
  pending:     { badge: 'badge badge-gray'   },
  cancelled:   { badge: 'badge badge-red'    },
}

const STATUS_LABELS = {
  completed:   'Completed',
  in_progress: 'In Progress',
  confirmed:   'Confirmed',
  on_the_way:  'On the way',
  pending:     'Pending',
  cancelled:   'Cancelled',
}

const AdminBookings = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page,   setPage]   = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-bookings', page, filter],
    queryFn:  () => fetchAdminBookings({ page, limit: 20, status: filter === 'all' ? undefined : filter }),
    keepPreviousData: true,
  })

  const bookings   = data?.bookings || []
  const total      = data?.total || 0
  const totalPages = data?.totalPages || 1

  const filtered = search
    ? bookings.filter(b => {
        const s = search.toLowerCase()
        return b.service?.title?.toLowerCase().includes(s)
          || b.user?.name?.toLowerCase().includes(s)
          || b._id.includes(s)
      })
    : bookings

  const completedRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((a, b) => a + (b.payment?.amount || 0), 0)

  const exportCSV = () => {
    const header = 'ID,Service,Customer,City,Date,Amount,Status'
    const rows   = filtered.map(b =>
      `${b._id},"${b.service?.title || ''}","${b.user?.name || ''}","${b.address?.city || ''}",${new Date(b.scheduledAt).toLocaleDateString()},${b.payment?.amount || 0},${b.status}`
    )
    const csv    = [header, ...rows].join('\n')
    const link   = document.createElement('a')
    link.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    link.download = 'bookings.csv'
    link.click()
  }

  return (
    <div className="bg-neutral-50 min-h-screen">

      {/* Top bar */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-neutral-900 text-xl">Bookings</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {total.toLocaleString()} total · Revenue:{' '}
              <span className="text-brand font-bold">₹{completedRevenue.toLocaleString('en-IN')}</span>
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 text-xs font-medium text-neutral-600 bg-neutral-100 px-4 py-2 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            <FiDownload size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by service, customer…"
              className="input pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-1 bg-white border border-neutral-200 p-1 rounded-xl flex-wrap">
            {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4" aria-hidden="true">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500 text-sm">Failed to load bookings</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead className="border-b border-neutral-100">
                  <tr>
                    {['Booking', 'Service', 'Customer', 'City', 'Date', 'Amount', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filtered.map(b => {
                    const s = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
                    return (
                      <tr key={b._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-neutral-400">{b._id.slice(-8).toUpperCase()}</td>
                        <td className="px-5 py-4 font-medium text-neutral-900 max-w-36 truncate">{b.service?.title || '—'}</td>
                        <td className="px-5 py-4 text-neutral-600">{b.user?.name || '—'}</td>
                        <td className="px-5 py-4 text-neutral-400 text-xs">{b.address?.city || '—'}</td>
                        <td className="px-5 py-4 text-neutral-400 text-xs whitespace-nowrap">
                          {new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 font-bold text-neutral-900">
                          {b.payment?.amount ? `₹${b.payment.amount}` : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`${s.badge} whitespace-nowrap`}>
                            {STATUS_LABELS[b.status] || b.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-neutral-400">No bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between">
              <p className="text-xs text-neutral-400">Page {page} of {totalPages} · {total} total</p>
              <div className="flex gap-1">
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
    </div>
  )
}

export default AdminBookings
