import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FiCamera, FiEdit2, FiStar, FiCheckCircle, FiAward, FiBriefcase,
  FiMapPin, FiPhone, FiMail, FiAlertCircle,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { fetchMyProProfile, updateProProfile } from '../../api/professionals.js'

const ProProfile = () => {
  const { user: currentUser, dbUser } = useAuth()
  const fileRef           = useRef()
  const queryClient       = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ bio: '', phone: '', city: '', experience: '' })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pro-profile'],
    queryFn:  fetchMyProProfile,
  })

  const pro = data?.pro

  useEffect(() => {
    if (pro) {
      setForm({
        bio:        pro.bio        || '',
        phone:      pro.phone      || currentUser?.phoneNumber || '',
        city:       pro.city       || '',
        experience: pro.experience || '',
      })
    }
  }, [pro, currentUser])

  const saveMutation = useMutation({
    mutationFn: updateProProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-profile'] })
      setEditing(false)
    },
  })

  const displayName = pro?.user?.name || dbUser?.name || currentUser?.displayName || 'Professional'
  const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  if (isLoading) return (
    <div className="min-h-screen bg-neutral-50 animate-pulse" aria-hidden="true">
      <div className="bg-neutral-900 h-48" />
      <div className="max-w-lg mx-auto px-4 -mt-14 space-y-4">
        <div className="skeleton h-48 rounded-xl" />
        <div className="skeleton h-24 rounded-xl" />
      </div>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <FiAlertCircle size={32} className="text-red-400" />
      <p className="text-sm text-neutral-600">Failed to load profile</p>
    </div>
  )

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Header */}
      <div className="bg-neutral-900 px-4 pt-8 pb-20">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">My Profile</h1>
          <button
            onClick={() => setEditing(v => !v)}
            aria-label={editing ? 'Cancel editing' : 'Edit profile'}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 bg-white/10 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/20 transition-colors"
          >
            <FiEdit2 size={11} /> {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-14 pb-10 space-y-4">

        {/* Profile card */}
        <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold text-2xl">
                {initials}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-sm"
              >
                <FiCamera size={12} className="text-neutral-600" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-neutral-900 text-lg">{displayName}</h2>
                {pro?.status === 'approved' && (
                  <FiCheckCircle size={15} className="text-brand flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">{form.bio || 'No bio added yet.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-neutral-100">
            {[
              { label: 'Rating', value: pro?.rating ? pro.rating.toFixed(2) : '—', icon: FiStar,         iconCls: 'text-amber-400' },
              { label: 'Jobs',   value: pro?.completedJobs ?? '0',                  icon: FiCheckCircle,  iconCls: 'text-brand'     },
              { label: 'Status', value: pro?.status || '—',                          icon: FiAward,        iconCls: 'text-purple-500' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center mx-auto mb-1.5">
                  <s.icon size={14} className={s.iconCls} />
                </div>
                <p className="font-bold text-neutral-900 capitalize text-sm">{s.value}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        {pro?.badges?.length > 0 && (
          <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-5">
            <p className="font-semibold text-neutral-900 text-sm mb-3">Achievements</p>
            <div className="flex flex-wrap gap-2">
              {pro.badges.map(badge => (
                <span key={badge} className="flex items-center gap-1.5 text-xs font-semibold bg-neutral-900 text-white px-3 py-1.5 rounded-full">
                  <FiAward size={10} /> {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {pro?.skills?.length > 0 && (
          <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-5">
            <p className="font-semibold text-neutral-900 text-sm mb-3">Skills & expertise</p>
            <div className="flex flex-wrap gap-2">
              {pro.skills.map(s => (
                <span key={s} className="badge badge-green">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Edit / Info */}
        {editing ? (
          <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-5 space-y-4">
            <p className="font-semibold text-neutral-900 text-sm">Edit details</p>
            {[
              { name: 'phone',      label: 'Phone',      placeholder: '+91 98765 43210', icon: FiPhone,     id: 'pro-phone'     },
              { name: 'city',       label: 'City',        placeholder: 'Ahmedabad',       icon: FiMapPin,    id: 'pro-city'      },
              { name: 'experience', label: 'Experience',  placeholder: '5 years',         icon: FiBriefcase, id: 'pro-experience' },
            ].map(({ name, label, placeholder, icon: Icon, id }) => (
              <div key={name}>
                <label htmlFor={id} className="label">{label}</label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id={id}
                    type="text"
                    value={form[name]}
                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    placeholder={placeholder}
                    className="input pl-10"
                  />
                </div>
              </div>
            ))}
            <div>
              <label htmlFor="pro-bio" className="label">Bio</label>
              <textarea
                id="pro-bio"
                rows={3}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Describe your experience and specialities…"
                className="input resize-none"
              />
            </div>
            {saveMutation.isError && (
              <p className="text-xs text-red-500" role="alert">{saveMutation.error?.message || 'Save failed'}</p>
            )}
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
              className="btn btn-primary w-full disabled:opacity-60"
            >
              {saveMutation.isPending
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Save changes'}
            </button>
          </div>
        ) : (
          <div className="bg-white border border-neutral-100 rounded-xl shadow-sm divide-y divide-neutral-50">
            {[
              { icon: FiPhone,     label: 'Mobile',    value: form.phone      || '—' },
              { icon: FiMail,      label: 'Email',      value: currentUser?.email || dbUser?.email || '—' },
              { icon: FiMapPin,    label: 'City',       value: form.city       || '—' },
              { icon: FiBriefcase, label: 'Experience', value: form.experience || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                <Icon size={14} className="text-neutral-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400">{label}</p>
                  <p className="text-sm font-medium text-neutral-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent reviews */}
        {pro?.recentReviews?.length > 0 && (
          <div>
            <p className="font-semibold text-neutral-900 mb-3">Recent reviews</p>
            <div className="space-y-3">
              {pro.recentReviews.map((r, i) => (
                <div key={i} className="bg-white border border-neutral-100 rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-neutral-900 text-sm">{r.user?.name || 'Customer'}</p>
                    <div className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, j) => (
                        <FiStar
                          key={j}
                          size={11}
                          className={j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{r.comment}</p>
                  <p className="text-xs text-neutral-400 mt-2">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProProfile
