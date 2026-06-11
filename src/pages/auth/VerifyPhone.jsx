import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPhone, FiShield, FiArrowRight, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../config/firebase.js'
import apiFetch from '../../api/apiClient.js'

const STEPS = { PHONE: 'phone', OTP: 'otp', DONE: 'done' }

const VerifyPhone = () => {
  const navigate      = useNavigate()
  const recaptchaRef  = useRef(null)
  const confirmRef    = useRef(null)

  const [step,    setStep]    = useState(STEPS.PHONE)
  const [phone,   setPhone]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [timer,   setTimer]   = useState(0)

  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  useEffect(() => {
    const container = document.getElementById('recaptcha-container')
    if (!container) return
    try {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      })
    } catch (e) {
      console.warn('RecaptchaVerifier error:', e)
    }
    return () => {
      try { recaptchaRef.current?.clear() } catch (_) {}
    }
  }, [])

  const handleSendOtp = async () => {
    setError('')
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true)
    try {
      const result = await signInWithPhoneNumber(auth, `+91${cleaned}`, recaptchaRef.current)
      confirmRef.current = result
      setStep(STEPS.OTP)
      setTimer(60)
    } catch (err) {
      setError(err.message?.includes('invalid-phone') ? 'Invalid phone number' : err.message || 'Failed to send OTP')
      try { recaptchaRef.current?.clear() } catch (_) {}
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    try {
      await confirmRef.current.confirm(otp)
      await apiFetch('/users/verify-phone', { method: 'PATCH' })
      setStep(STEPS.DONE)
    } catch (err) {
      setError(err.code === 'auth/invalid-verification-code' ? 'Incorrect OTP. Please try again.' : err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setOtp(''); setError(''); setTimer(0); setStep(STEPS.PHONE)
    try { recaptchaRef.current?.clear() } catch (_) {}
    try {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible', callback: () => {} })
    } catch (_) {}
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div id="recaptcha-container" />

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">

        {/* DONE */}
        {step === STEPS.DONE && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center mx-auto mb-5">
              <FiCheck size={28} className="text-white" strokeWidth={3} />
            </div>
            <h1 className="font-bold text-neutral-900 text-xl mb-1">Phone Verified!</h1>
            <p className="text-sm text-neutral-400 mb-6">Your mobile number has been verified successfully.</p>
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-primary w-full"
            >
              Back to Profile
            </button>
          </div>
        )}

        {/* ENTER PHONE */}
        {step === STEPS.PHONE && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                <FiPhone size={18} className="text-neutral-700" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 text-lg leading-tight">Verify Your Phone</h1>
                <p className="text-xs text-neutral-400">We'll send you an OTP via SMS</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="phone-input" className="label">Mobile Number</label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-neutral-100 border border-r-0 border-neutral-200 rounded-l-xl text-sm text-neutral-500 font-medium select-none">
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    autoComplete="tel"
                    className="flex-1 border border-neutral-200 rounded-r-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              </div>

              {error && (
                <div className="error-banner" role="alert">
                  <FiAlertCircle size={13} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={phone.length < 10 || loading}
                className="btn btn-primary w-full disabled:opacity-40"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Send OTP</span><FiArrowRight size={15} /></>
                }
              </button>
            </div>
          </>
        )}

        {/* ENTER OTP */}
        {step === STEPS.OTP && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                <FiShield size={18} className="text-neutral-700" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 text-lg leading-tight">Enter OTP</h1>
                <p className="text-xs text-neutral-400">Sent to +91 {phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="otp-input" className="label">6-digit OTP</label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="input tracking-[0.4em] text-center text-lg font-bold"
                  autoFocus
                />
              </div>

              {error && (
                <div className="error-banner" role="alert">
                  <FiAlertCircle size={13} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
                className="btn btn-primary w-full disabled:opacity-40"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Verify OTP</span><FiCheck size={15} /></>
                }
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs text-neutral-400">Resend OTP in <span className="font-semibold">{timer}s</span></p>
                ) : (
                  <button onClick={handleResend} className="text-xs text-brand font-semibold hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyPhone
