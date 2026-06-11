import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  FiUsers, FiBriefcase, FiCalendar, FiDollarSign,
  FiCheckCircle, FiXCircle, FiChevronRight, FiRefreshCw,
} from 'react-icons/fi'
import { fetchAdminStats, fetchAdminBookings } from '../../api/admin'
import { fetchPendingPros, approveRejectPro } from '../../api/professionals'

const STATUS_CONFIG = {
  completed:   { label: 'Done',        badge: 'badge badge-green'  },
  in_progress: { label: 'Active',      badge: 'badge badge-yellow' },
  confirmed:   { label: 'Confirmed',   badge: 'badge badge-blue'   },
  pending:     { label: 'Pending',     badge: 'badge badge-gray'   },
  cancelled:   { label: 'Cancelled',   badge: 'badge badge-red'    },
  on_the_way:  { label: 'On The Way',  badge: 'badge badge-blue'   },
}

const fmt = (n) => {
  if (!n) return '0'
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L'
  if (n >= 1000)   return n.toLocaleString('en-IN')
  return String(n)
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const [metric, setMetric] = useState('bookings')

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  fetchAdminStats,
    refetchInterval: 60000,
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings', { page: 1, limit: 5 }],
    queryFn:  () => fetchAdminBookings({ page: 1, limit: 5 }),
  })

  const { data: pendingData } = useQuery({
    queryKey: ['pending-pros'],
    queryFn:  () => fetchPendingPros({ page: 1, limit: 5 }),
  })

  const approveMut = useMutation({
    mutationFn: ({ id, status }) => approveRejectPro(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-pros'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const stats   = statsData?.stats  || {}
  const weekly  = (statsData?.weekly || []).map(w => ({
    day:      new Date(w._id).toLocaleDateString('en-IN', { weekday: 'short' }),
    bookings: w.bookings,
    revenue:  w.revenue,
  }))

  const recentBookings = bookingsData?.bookings || []
  const pendingPros    = pendingData?.pros       || []

  const statCards = [
    { label: 'Total revenue',  value: stats.totalRevenue ? '₹' + fmt(stats.totalRevenue) : '₹0', icon: FiDollarSign,  color: 'text-brand',      bg: 'bg-brand-50'   },
    { label: 'Active users',   value: fmt(stats.totalUsers),    icon: FiUsers,       color: 'text-blue-600',   bg: 'bg-blue-50'    },
    { label: 'Professionals',  value: fmt(stats.totalPros),     icon: FiBriefcase,   color: 'text-purple-600', bg: 'bg-purple-50'  },
    { label: 'Bookings today', value: fmt(stats.todayBookings), icon: FiCalendar,    color: 'text-orange-600', bg: 'bg-orange-50'  },
  ]

  return (
    <div className="bg-neutral-50 min-h-screen">

      {/* Top bar */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-neutral-900 text-xl">Admin Dashboard</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
            </p>
          </div>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ['admin-stats'] })}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <FiRefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5 animate-pulse" aria-hidden="true">
                <div className="skeleton w-9 h-9 rounded-xl mb-3" />
                <div className="skeleton h-7 rounded w-24 mb-2" />
                <div className="skeleton h-3 rounded w-32" />
              </div>
            ))
          ) : (
            statCards.map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="font-bold text-neutral-900 text-2xl">{s.value}</p>
                <p className="text-xs text-neutral-400 mt-1">{s.label}</p>
              </div>
            ))
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-neutral-900">Weekly overview</p>
              <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
                {['bookings', 'revenue'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                      metric === m ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {weekly.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-neutral-400 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180} aria-label="Weekly overview chart">
                <BarChart data={weekly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#737373' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#737373' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => metric === 'revenue' ? '₹' + Math.round(v / 1000) + 'K' : v}
                  />
                  <Tooltip
                    formatter={(v) => metric === 'revenue'
                      ? ['₹' + v.toLocaleString('en-IN'), 'Revenue']
                      : [v, 'Bookings']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 12 }}
                  />
                  <Bar dataKey={metric} fill="#171717" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pending approvals */}
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-neutral-900 text-sm">Pending approvals</p>
              {stats.pendingPros > 0 && (
                <span className="badge badge-yellow">{stats.pendingPros}</span>
              )}
            </div>
            <div className="space-y-3">
              {pendingPros.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No pending approvals</p>
              ) : (
                pendingPros.slice(0, 4).map(p => (
                  <div key={p._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 font-semibold text-xs flex-shrink-0">
                      {(p.user?.name || 'P').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{p.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-neutral-400">{p.experience || 0} yrs exp</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => approveMut.mutate({ id: p._id, status: 'approved' })}
                        disabled={approveMut.isPending}
                        aria-label="Approve professional"
                        className="w-7 h-7 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        <FiCheckCircle size={13} />
                      </button>
                      <button
                        onClick={() => approveMut.mutate({ id: p._id, status: 'rejected' })}
                        disabled={approveMut.isPending}
                        aria-label="Reject professional"
                        className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <FiXCircle size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <button
                onClick={() => navigate('/admin/professionals')}
                className="w-full text-center text-xs font-medium text-brand hover:text-brand-700 py-2 transition-colors"
              >
                View all →
              </button>
            </div>
          </div>
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-neutral-900">Recent bookings</p>
            <button
              onClick={() => navigate('/admin/bookings')}
              className="text-xs font-medium text-brand hover:text-brand-700 transition-colors flex items-center gap-1"
            >
              See all <FiChevronRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-neutral-100">
                  {['ID', 'Service', 'Customer', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {recentBookings.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-neutral-400">No bookings yet</td></tr>
                ) : (
                  recentBookings.map(b => {
                    const s = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
                    return (
                      <tr key={b._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs text-neutral-400">{b._id.slice(-6).toUpperCase()}</td>
                        <td className="py-3 pr-4 font-medium text-neutral-900">{b.service?.title || '—'}</td>
                        <td className="py-3 pr-4 text-neutral-500">{b.user?.name || '—'}</td>
                        <td className="py-3 pr-4 font-bold text-neutral-900">₹{b.payment?.amount || b.pricingTier?.price || '—'}</td>
                        <td className="py-3">
                          <span className={s.badge}>{s.label}</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Manage Users',   icon: FiUsers,       path: '/admin/users',        count: fmt(stats.totalUsers)    },
            { label: 'Professionals',  icon: FiBriefcase,   path: '/admin/professionals', count: fmt(stats.totalPros)     },
            { label: 'All Bookings',   icon: FiCalendar,    path: '/admin/bookings',      count: fmt(stats.totalBookings) },
            { label: 'Services',       icon: FiCheckCircle, path: '/admin/services',      count: '—'                      },
          ].map(({ label, icon: Icon, path, count }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="bg-white border border-neutral-100 rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-card transition-shadow text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-neutral-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-neutral-900 text-sm">{count}</p>
                <p className="text-xs text-neutral-400 truncate">{label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
