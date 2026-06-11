import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { loginSchema } from '../../lib/schemas/authSchemas'

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

const TrustPoint = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-4 h-4 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
      <div className="w-1.5 h-1.5 rounded-full bg-brand" />
    </div>
    <p className="text-sm text-neutral-300">{text}</p>
  </div>
)

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // Support both router-state redirect and ?redirect= query-param (used by auth guards)
  const searchParams = new URLSearchParams(location.search)
  const from = searchParams.get('redirect') || location.state?.from?.pathname || '/'

  const [showPass,       setShowPass]       = useState(false)
  const [authError,      setAuthError]      = useState('')
  const [googleLoading,  setGoogleLoading]  = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async ({ email, password }) => {
    setAuthError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate(from, { replace: true })
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password. Please try again.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please wait a few minutes before trying again.'
          : 'Sign-in failed. Please try again.'
      setAuthError(msg)
    }
  }

  const handleGoogle = async () => {
    setAuthError('')
    setGoogleLoading(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate(from, { replace: true })
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
            India's #1 home services platform
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-10">
            Professional services at your doorstep — vetted experts, transparent pricing, quality guaranteed.
          </p>
          <div className="space-y-3.5">
            <TrustPoint text="4.8★ average rating across all services" />
            <TrustPoint text="12M+ happy customers served" />
            <TrustPoint text="100% satisfaction guarantee" />
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo — mobile only */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8" aria-label="UrbanClone home">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">UC</span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-neutral-900 mb-1 tracking-tight">Welcome back</h1>
          <p className="text-sm text-neutral-500 mb-8">Sign in to your account to continue</p>

          {/* Auth error */}
          {authError && (
            <div className="error-banner mb-5" role="alert">
              <FiAlertCircle size={15} className="flex-shrink-0" />
              {authError}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 border border-neutral-200 rounded-xl py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 mb-5 disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-neutral-100" />
            <span className="text-xs text-neutral-400 font-medium">or with email</span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="label">Email address</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="login-email"
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`input pl-10 ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert">
                  <FiAlertCircle size={11} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand hover:text-brand-700 transition-colors duration-150 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="login-password"
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
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
              {errors.password && (
                <p id="password-error" className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert">
                  <FiAlertCircle size={11} /> {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="Signing in" />
              ) : (
                <>Sign in <FiArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-neutral-900 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
