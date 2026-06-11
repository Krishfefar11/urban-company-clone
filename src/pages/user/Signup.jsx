import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { signupSchema } from '../../lib/schemas/authSchemas'

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

const PERKS = [
  'Background-verified professionals',
  'Free cancellation & rescheduling',
  '100% satisfaction guarantee',
  'Transparent pricing, no surprises',
]

const Signup = () => {
  const navigate = useNavigate()
  const [showPass,      setShowPass]      = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [authError,     setAuthError]     = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) })

  const password = watch('password', '')

  const strengthCount = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    password.length >= 12,
  ].filter(Boolean).length

  const strengthColor =
    strengthCount <= 1 ? 'bg-red-400'
    : strengthCount === 2 ? 'bg-amber-400'
    : strengthCount === 3 ? 'bg-blue-400'
    : 'bg-brand'

  const onSubmit = async ({ name, email, phone, password }) => {
    setAuthError('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      const idToken = await cred.user.getIdToken()
      const base = import.meta.env.VITE_API_URL || '/api'
      await fetch(`${base}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body:    JSON.stringify({ firebaseUid: cred.user.uid, name, email, phone }),
      })
      navigate('/')
    } catch (err) {
      setAuthError(
        err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : 'Registration failed. Please try again.'
      )
    }
  }

  const handleGoogle = async () => {
    setAuthError('')
    setGoogleLoading(true)
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider())
      const idToken = await cred.user.getIdToken()
      const base = import.meta.env.VITE_API_URL || '/api'
      await fetch(`${base}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body:    JSON.stringify({
          firebaseUid: cred.user.uid,
          name:  cred.user.displayName || 'User',
          email: cred.user.email,
          phone: cred.user.phoneNumber || '',
        }),
      })
      navigate('/')
    } catch {
      setAuthError('Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const busy = isSubmitting || googleLoading

  return (
    <div className="min-h-screen bg-white flex" role="main">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-neutral-900 items-center justify-center p-12 flex-shrink-0">
        <div className="max-w-sm w-full">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">UC</span>
            </div>
            <div className="leading-none">
              <p className="font-bold text-sm text-white">Urban</p>
              <p className="font-bold text-sm text-white -mt-0.5">Company</p>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-3 leading-snug tracking-tight">
            Join 12M+ happy customers
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-10">
            Get access to 100+ home services with verified professionals at your doorstep.
          </p>
          <div className="space-y-4">
            {PERKS.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                  <FiCheck size={11} className="text-brand" strokeWidth={2.5} />
                </div>
                <p className="text-sm text-neutral-300">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Logo — mobile only */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8" aria-label="UrbanClone home">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">UC</span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-neutral-900 mb-1 tracking-tight">Create your account</h1>
          <p className="text-sm text-neutral-500 mb-8">Book services, track bookings, and manage everything.</p>

          {authError && (
            <div className="error-banner mb-5" role="alert">
              <FiAlertCircle size={15} className="flex-shrink-0" />
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 border border-neutral-200 rounded-xl py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 mb-5 disabled:opacity-50"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-neutral-100" />
            <span className="text-xs text-neutral-400 font-medium">or with email</span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Full name */}
            <div>
              <label htmlFor="signup-name" className="label">Full name</label>
              <div className="relative">
                <FiUser size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="signup-name"
                  {...register('name')}
                  type="text"
                  placeholder="Priya Sharma"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  className={`input pl-10 ${errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert"><FiAlertCircle size={11} />{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="label">Email address</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="signup-email"
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={`input pl-10 ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert"><FiAlertCircle size={11} />{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="signup-phone" className="label">Mobile number</label>
              <div className="relative">
                <FiPhone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="signup-phone"
                  {...register('phone')}
                  type="tel"
                  placeholder="9876543210"
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  className={`input pl-10 ${errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert"><FiAlertCircle size={11} />{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="label">Password</label>
              <div className="relative">
                <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="signup-password"
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert"><FiAlertCircle size={11} />{errors.password.message}</p>}
              {password && (
                <div className="mt-2 flex gap-1" aria-label={`Password strength: ${strengthCount} of 4`}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i < strengthCount ? strengthColor : 'bg-neutral-100'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="signup-confirm" className="label">Confirm password</label>
              <div className="relative">
                <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="signup-confirm"
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert"><FiAlertCircle size={11} />{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-neutral-400">
              By signing up, you agree to our{' '}
              <a href="#" className="text-neutral-600 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-neutral-600 hover:underline">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              {isSubmitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="Creating account" />
                : <> Create account <FiArrowRight size={14} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-neutral-900 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
