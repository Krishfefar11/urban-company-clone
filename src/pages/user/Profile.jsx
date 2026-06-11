import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCamera,
  FiChevronRight, FiLogOut, FiHeart, FiStar, FiClock,
} from 'react-icons/fi'
import { signOut } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'
import { fetchMe, updateProfile } from '../../api/users.js'

const MENU = [
  {
    section: 'My account',
    items: [
      { icon: FiMapPin,  label: 'Saved addresses', path: '/addresses'    },
      { icon: FiHeart,   label: 'Wishlist',         path: '/wishlist'     },
      { icon: FiStar,    label: 'My reviews',        path: '/reviews'     },
      { icon: FiClock,   label: 'Booking history',   path: '/my-bookings' },
    ],
  },
]

const Profile = () => {
  const { user: currentUser } = useAuth()
  const navigate              = useNavigate()
  const fileRef               = useRef()
  const queryClient           = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({ name: '', phone: '', city: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn:  fetchMe,
  })

  const dbUser = data?.user

  useEffect(() => {
    if (dbUser) {
      setForm({
        name:  dbUser.name  || currentUser?.displayName || '',
        phone: dbUser.phone || '',
        city:  dbUser.city  || '',
      })
    }
  }, [dbUser, currentUser])

  const saveMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setEditing(false)
    },
  })

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  const avatar      = currentUser?.photoURL
  const displayName = form.name || currentUser?.displayName || 'User'

  const stats = [
    { label: 'Bookings', value: dbUser?.bookingCount ?? '—' },
    { label: 'Reviews',  value: dbUser?.reviewCount  ?? '—' },
    { label: 'Savings',  value: dbUser?.savings ? `₹${dbUser.savings}` : '—' },
  ]

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Dark header — full width with page-container */}
      <div className="bg-neutral-900 pt-8 pb-24">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-white font-bold text-xl">My Profile</h1>
            <button
              onClick={() => setEditing(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
            >
              <FiEdit2 size={11} /> {editing ? 'Cancel' : 'Edit profile'}
            </button>
          </div>

          {/* Avatar + name — left-aligned on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt="Profile photo" className="w-20 h-20 rounded-full object-cover border-4 border-white/20" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center border-4 border-white/20" aria-hidden="true">
                  <span className="text-white font-bold text-2xl">{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-neutral-50 transition-colors"
              >
                <FiCamera size={12} className="text-neutral-700" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-snug">{displayName}</p>
              <p className="text-neutral-400 text-sm mt-0.5">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content — two-column on lg+ */}
      <div className="page-container -mt-12 pb-10">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-start">

          {/* ── Left sidebar (desktop) / top section (mobile) ── */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-3">

            {/* Stats card */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 grid grid-cols-3 divide-x divide-neutral-100">
              {stats.map(s => (
                <div key={s.label} className="text-center px-2">
                  {isLoading
                    ? <div className="h-6 w-10 skeleton mx-auto mb-1" />
                    : <p className="font-bold text-neutral-900 text-xl">{s.value}</p>
                  }
                  <p className="text-xs text-neutral-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Menu sections */}
            {MENU.map(sec => (
              <div key={sec.section}>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">{sec.section}</p>
                <div className="bg-white rounded-xl border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                  {sec.items.map(({ icon: Icon, label, path }) => (
                    <button
                      key={label}
                      onClick={() => navigate(path)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 transition-colors duration-150 text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center flex-shrink-0">
                        <Icon size={13} className="text-neutral-500" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-neutral-700">{label}</span>
                      <FiChevronRight size={13} className="text-neutral-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 border border-red-100 text-red-500 font-medium py-3.5 rounded-xl hover:bg-red-50 transition-colors duration-150 text-sm bg-white"
            >
              <FiLogOut size={14} /> Sign out
            </button>
          </div>

          {/* ── Right: info / edit form ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Edit form */}
            {editing ? (
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-4 animate-fade-in">
                <h2 className="text-base font-semibold text-neutral-900">Edit profile</h2>
                {[
                  { name: 'name',  label: 'Full name',    icon: FiUser,   type: 'text', autocomplete: 'name'           },
                  { name: 'phone', label: 'Mobile number',icon: FiPhone,  type: 'tel',  autocomplete: 'tel'            },
                  { name: 'city',  label: 'City',          icon: FiMapPin, type: 'text', autocomplete: 'address-level2' },
                ].map(({ name, label, icon: Icon, type, autocomplete }) => (
                  <div key={name}>
                    <label htmlFor={`profile-${name}`} className="label">{label}</label>
                    <div className="relative">
                      <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                      <input
                        id={`profile-${name}`}
                        type={type}
                        value={form[name]}
                        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                        autoComplete={autocomplete}
                        className="input pl-9"
                      />
                    </div>
                  </div>
                ))}
                {saveMutation.isError && (
                  <p className="text-xs text-red-500" role="alert">{saveMutation.error?.message || 'Failed to save changes'}</p>
                )}
                <button
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending}
                  className="btn btn-primary"
                >
                  {saveMutation.isPending
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Save changes'}
                </button>
              </div>
            ) : (
              /* Info display */
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-neutral-900">Personal information</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-700 transition-colors"
                  >
                    <FiEdit2 size={11} /> Edit
                  </button>
                </div>
                <div className="divide-y divide-neutral-50">
                  {[
                    { icon: FiUser,   label: 'Full name', value: form.name              },
                    { icon: FiMail,   label: 'Email',      value: currentUser?.email    },
                    { icon: FiPhone,  label: 'Mobile',     value: form.phone || 'Not set' },
                    { icon: FiMapPin, label: 'City',        value: form.city  || 'Not set' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-9 h-9 rounded-xl bg-neutral-50 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-neutral-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-neutral-900 truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-neutral-300 pb-2">UrbanClone · v2.0.0</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile
