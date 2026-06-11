import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiSearch, FiCheckCircle, FiXCircle, FiStar, FiDownload, FiX } from 'react-icons/fi'
import { fetchPendingPros, approveRejectPro } from '../../api/professionals.js'

const STATUS_CONFIG = {
  approved: { badge: 'badge badge-green'  },
  pending:  { badge: 'badge badge-yellow' },
  rejected: { badge: 'badge badge-red'    },
}

const AdminProfessionals = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page,   setPage]   = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-pros', page, filter],
    queryFn:  () => fetchPendingPros({ page, limit: 20, status: filter === 'all' ? undefined : filter }),
    keepPreviousData: true,
  })

  const pros       = data?.professionals || []
  const total      = data?.total || 0
  const totalPages = data?.totalPages || 1

  const approveMutation = useMutation({
    mutationFn: ({ id, status }) => approveRejectPro(id, status),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['admin-pros'] }),
  })

  const filtered = pros.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return p.user?.name?.toLowerCase().includes(s) || p.category?.toLowerCase().includes(s)
  })

  const pendingList = filtered.filter(p => p.status === 'pending')

  return (
    <div className="bg-neutral-50 min-h-screen">

      {/* Top bar */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-neutral-900 text-xl">Professionals</h1>
            <p className="text-xs text-neutral-400 mt-0.5">{total.toLocaleString()} total</p>
          </div>
          <div className="flex items-center gap-2">
            {pendingList.length > 0 && (
              <span className="badge badge-yellow">{pendingList.length} pending</span>
            )}
            <button className="flex items-center gap-2 text-xs font-medium text-neutral-600 bg-neutral-100 px-4 py-2 rounded-xl hover:bg-neutral-200 transition-colors">
              <FiDownload size={13} /> Export
            </button>
          </div>
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
              placeholder="Search professionals…"
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
          <div className="flex gap-1 bg-white border border-neutral-200 p-1 rounded-xl">
            {['all', 'approved', 'pending', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Pending cards */}
        {(filter === 'all' || filter === 'pending') && pendingList.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Awaiting approval</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {pendingList.map(p => (
                <div key={p._id} className="bg-white border border-amber-100 rounded-xl shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center font-semibold text-neutral-600 text-sm flex-shrink-0">
                      {p.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PR'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900">{p.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {p.category || (p.services?.[0] ? 'Various' : '—')} · {p.city} · Applied {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveMutation.mutate({ id: p._id, status: 'rejected' })}
                      disabled={approveMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 font-medium py-2 rounded-xl text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <FiXCircle size={13} /> Reject
                    </button>
                    <button
                      onClick={() => approveMutation.mutate({ id: p._id, status: 'approved' })}
                      disabled={approveMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900 text-white font-medium py-2 rounded-xl text-xs hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      <FiCheckCircle size={13} /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500 text-sm">Failed to load professionals</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="border-b border-neutral-100">
                  <tr>
                    {['Professional', 'Category', 'City', 'Rating', 'Jobs', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filtered.map(p => {
                    const s = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                    return (
                      <tr key={p._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {p.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PR'}
                            </div>
                            <p className="font-medium text-neutral-900">{p.user?.name || '—'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-neutral-500">{p.category || '—'}</td>
                        <td className="px-5 py-4 text-neutral-500">{p.city || '—'}</td>
                        <td className="px-5 py-4">
                          {p.rating > 0 ? (
                            <span className="flex items-center gap-1">
                              <FiStar size={12} className="text-amber-400 fill-amber-400" />
                              <span className="font-medium text-neutral-900">{p.rating?.toFixed(1)}</span>
                            </span>
                          ) : <span className="text-neutral-300">—</span>}
                        </td>
                        <td className="px-5 py-4 font-medium text-neutral-900">{p.completedJobs || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={s.badge}>{p.status}</span>
                        </td>
                        <td className="px-5 py-4">
                          {p.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => approveMutation.mutate({ id: p._id, status: 'approved' })}
                                disabled={approveMutation.isPending}
                                className="text-xs bg-neutral-900 text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => approveMutation.mutate({ id: p._id, status: 'rejected' })}
                                disabled={approveMutation.isPending}
                                className="text-xs border border-red-200 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-neutral-400">No professionals found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between">
              <p className="text-xs text-neutral-400">Page {page} of {totalPages}</p>
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

export default AdminProfessionals
