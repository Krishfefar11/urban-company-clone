import { useQuery } from '@tanstack/react-query'
import { FiArrowUpRight, FiArrowDownLeft, FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { fetchProBookings } from '../../api/bookings.js'

const PLATFORM_FEE = 0.15

const ProEarnings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['pro-bookings-earnings'],
    queryFn:  () => fetchProBookings({ page: 1, limit: 100, status: 'completed' }),
  })

  const bookings = data?.bookings || []

  const today = new Date()
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' })
    const dayKey   = d.toDateString()

    const amount = bookings
      .filter(b => new Date(b.completedAt || b.scheduledAt).toDateString() === dayKey)
      .reduce((sum, b) => sum + (b.payment?.amount || 0) * (1 - PLATFORM_FEE), 0)

    return { day: dayLabel, amount: Math.round(amount) }
  })

  const totalGross = bookings.reduce((a, b) => a + (b.payment?.amount || 0), 0)
  const totalComm  = Math.round(totalGross * PLATFORM_FEE)
  const totalNet   = totalGross - totalComm
  const weekTotal  = weeklyData.reduce((a, w) => a + w.amount, 0)

  const stats = [
    { label: 'Jobs done',   value: bookings.length,                                                            icon: FiCalendar   },
    { label: 'Avg per job', value: bookings.length > 0 ? `₹${Math.round(totalNet / bookings.length)}` : '—',  icon: FiDollarSign },
    { label: 'Growth',      value: '+12%',                                                                      icon: FiTrendingUp },
  ]

  const maxBar = Math.max(...weeklyData.map(w => w.amount), 1)

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Header */}
      <div className="bg-neutral-900 px-4 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white font-bold text-xl mb-6">Earnings</h1>
          {isLoading ? (
            <div className="bg-white/10 rounded-xl p-5 animate-pulse" aria-hidden="true">
              <div className="h-3.5 bg-white/20 rounded w-40 mb-3" />
              <div className="h-10 bg-white/20 rounded w-32 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-white/10 rounded-xl" />
                <div className="h-16 bg-white/10 rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-xl p-5">
              <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1">Net earnings (all time)</p>
              <p className="text-white font-bold text-4xl mb-4">₹{totalNet.toLocaleString('en-IN')}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-neutral-400 text-xs mb-0.5">Gross collected</p>
                  <p className="text-brand font-bold">₹{totalGross.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-neutral-400 text-xs mb-0.5">Platform fee (15%)</p>
                  <p className="text-red-400 font-bold">−₹{totalComm.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-10 space-y-5">

        {/* Weekly bar chart */}
        <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-5">
          <p className="font-semibold text-neutral-900 text-sm mb-4">Daily breakdown (last 7 days)</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} barSize={28}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#737373' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Net earned']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, i) => (
                  <Cell key={i} fill={entry.amount === maxBar ? '#1AB64F' : '#171717'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-1 pt-3 border-t border-neutral-100 text-xs text-neutral-400">
            <span>Total this week</span>
            <span className="font-bold text-neutral-900">₹{weekTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-neutral-100 rounded-xl shadow-sm p-4 text-center">
              <Icon size={16} className="text-neutral-400 mx-auto mb-2" />
              <p className="font-bold text-neutral-900">{value}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Payout history */}
        <div>
          <p className="font-semibold text-neutral-900 mb-3">Payout history</p>
          {isLoading ? (
            <div className="space-y-2" aria-hidden="true">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white border border-neutral-100 rounded-xl p-8 text-center text-sm text-neutral-400">
              No completed jobs yet
            </div>
          ) : (
            <div className="bg-white border border-neutral-100 rounded-xl shadow-sm divide-y divide-neutral-50">
              {bookings.slice(0, 10).map(b => {
                const gross = b.payment?.amount || 0
                const net   = Math.round(gross * (1 - PLATFORM_FEE))
                return (
                  <div key={b._id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{b.service?.title || 'Service'}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {b.user?.name || 'Customer'} · {new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-neutral-900 flex items-center gap-1">
                          <FiArrowDownLeft size={13} className="text-brand" />
                          ₹{net}
                        </p>
                        <p className="text-xs text-neutral-400">of ₹{gross}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button className="btn btn-primary w-full flex items-center justify-center gap-2">
          <FiArrowUpRight size={16} /> Request payout
        </button>
      </div>
    </div>
  )
}

export default ProEarnings
