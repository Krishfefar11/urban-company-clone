import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FiToggleLeft, FiToggleRight, FiStar, FiDollarSign,
  FiCalendar, FiCheckCircle, FiClock, FiMapPin, FiAlertCircle,
  FiWifiOff, FiInbox,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { fetchProBookings, updateBookingStatus } from '../../api/bookings'
import { fetchMyProProfile, updateProProfile } from '../../api/professionals'

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

const ProDashboard = () => {
  const navigate = useNavigate()
  const { dbUser } = useAuth()
  const qc = useQueryClient()

  const { data: proData } = useQuery({
    queryKey: ['my-pro-profile'],
    queryFn:  fetchMyProProfile,
  })

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['pro-bookings', { page: 1 }],
    queryFn:  () => fetchProBookings({ page: 1, limit: 10 }),
    refetchInterval: 30000,
  })

  const pro      = proData?.pro
  const online   = pro?.isOnline ?? false
  const bookings = bookingsData?.bookings || []

  const upcomingBookings = bookings.filter(b =>
    ['confirmed', 'pending'].includes(b.status) && new Date(b.scheduledAt) > new Date()
  )
  const recentCompleted = bookings.filter(b => b.status === 'completed').slice(0, 3)

  const monthEarnings = bookings
    .filter(b => b.status === 'completed' && new Date(b.createdAt) > new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((s, b) => s + (b.pricingTier?.price || b.payment?.amount || 0), 0)

  const toggleOnlineMut = useMutation({
    mutationFn: () => updateProProfile({ isOnline: !online }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['my-pro-profile'] }),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['pro-bookings'] }),
  })

  const STATS = [
    { label: "Today's earnings", value: '₹0',                        icon: FiDollarSign,  color: 'text-brand',      bg: 'bg-brand-50'   },
    { label: 'Jobs this month',  value: bookings.filter(b => b.status === 'completed').length, icon: FiCheckCircle, color: 'text-blue-600',   bg: 'bg-blue-50'    },
    { label: 'Avg rating',       value: pro?.rating?.toFixed(1) || '—',  icon: FiStar,        color: 'text-amber-600', bg: 'bg-amber-50'   },
    { label: 'Month earnings',   value: '₹' + monthEarnings.toLocaleString('en-IN'), icon: FiDollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Header */}
      <div className="bg-neutral-900 px-4 pt-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-neutral-400 text-xs font-medium mb-0.5">Welcome back,</p>
              <h1 className="text-white font-bold text-xl">{dbUser?.name || 'Professional'}</h1>
            </div>
            <button
              onClick={() => toggleOnlineMut.mutate()}
              disabled={toggleOnlineMut.isPending}
              aria-pressed={online}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 disabled:opacity-60 ${
                online ? 'bg-brand text-white' : 'bg-white/10 text-neutral-400 hover:bg-white/20'
              }`}
            >
              {online ? <FiToggleRight size={17} /> : <FiToggleLeft size={17} />}
              {online ? 'Online' : 'Offline'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2.5`}>
                  <s.icon size={14} className={s.color} />
                </div>
                <p className="text-white font-bold text-xl">{s.value}</p>
                <p className="text-neutral-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 pb-10 space-y-4">

        {/* Quick nav */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Bookings', path: '/pro/bookings', icon: FiCalendar   },
            { label: 'Earnings', path: '/pro/earnings', icon: FiDollarSign },
            { label: 'Profile',  path: '/pro/profile',  icon: FiStar       },
          ].map(({ label, path, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-neutral-200 transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-50 flex items-center justify-center">
                <Icon size={15} className="text-neutral-600" />
              </div>
              <p className="text-xs font-medium text-neutral-700">{label}</p>
            </button>
          ))}
        </div>

        {/* Upcoming bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-neutral-900">Upcoming bookings</p>
            {upcomingBookings.length > 0 && (
              <span className="badge badge-blue">{upcomingBookings.length} upcoming</span>
            )}
          </div>

          {!online ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <FiWifiOff size={20} className="text-neutral-400" />
              </div>
              <p className="text-sm font-semibold text-neutral-900 mb-1">You're offline</p>
              <p className="text-sm text-neutral-400">Go online to receive new bookings</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4 space-y-2 animate-pulse" aria-hidden="true">
                  <div className="skeleton h-3.5 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                  <div className="skeleton h-9 rounded mt-2" />
                </div>
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <FiInbox size={20} className="text-neutral-300" />
              </div>
              <p className="text-sm font-semibold text-neutral-900 mb-1">No upcoming bookings</p>
              <p className="text-sm text-neutral-400">New bookings will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map(b => (
                <div key={b._id} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 text-sm">{b.service?.title || 'Service'}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{b.user?.name} · {b.address?.city}</p>
                    </div>
                    <p className="font-bold text-neutral-900 flex-shrink-0">₹{b.pricingTier?.price || '—'}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400 mb-4">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={10} /> {formatDate(b.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={10} /> {formatTime(b.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMapPin size={10} /> {b.address?.city}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => statusMut.mutate({ id: b._id, status: 'on_the_way' })}
                      disabled={statusMut.isPending}
                      className="btn btn-primary flex-1 btn-sm"
                    >
                      Start Job
                    </button>
                    <button
                      onClick={() => statusMut.mutate({ id: b._id, status: 'completed' })}
                      disabled={statusMut.isPending}
                      className="btn btn-outline flex-1 btn-sm"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent completed */}
        {recentCompleted.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-neutral-900">Recent jobs</p>
              <button
                onClick={() => navigate('/pro/bookings')}
                className="text-xs font-medium text-brand hover:text-brand-700 transition-colors"
              >
                See all
              </button>
            </div>
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm divide-y divide-neutral-50">
              {recentCompleted.map(b => (
                <div key={b._id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle size={15} className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{b.service?.title || 'Service'}</p>
                    <p className="text-xs text-neutral-400">{b.user?.name} · {formatDate(b.scheduledAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-neutral-900 text-sm">₹{b.pricingTier?.price || b.payment?.amount || '—'}</p>
                    <p className="text-xs text-brand font-medium">Done</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProDashboard
