// ⚠️  API KEY CHECKPOINT
// Before using this component add to src/.env:
//   VITE_API_URL=http://localhost:5000/api
// And to backend/.env:
//   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
//   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXX

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiCreditCard, FiLoader, FiAlertCircle } from 'react-icons/fi'

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true)
    const s = document.createElement('script')
    s.id  = 'razorpay-script'
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

const RazorpayCheckout = ({ amount, bookingId, onSuccess, onFailure }) => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handlePay = async () => {
    setLoading(true)
    setError(null)

    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load Razorpay. Check your internet connection.')

      // 1. Create order on backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ amount, bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Order creation failed')

      // 2. Open Razorpay checkout
      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'UrbanClone',
        description: `Booking #${bookingId}`,
        order_id:    data.orderId,
        theme:       { color: '#1AB64F' },
        handler: async (response) => {
          // 3. Verify payment on backend
          const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ ...response, bookingId }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyRes.ok) throw new Error(verifyData.message)
          onSuccess && onSuccess(verifyData)
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (resp) => {
        setError(resp.error.description)
        onFailure && onFailure(resp.error)
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-3 text-sm">
          <FiAlertCircle size={15} />
          {error}
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {loading ? (
          <><FiLoader className="animate-spin" size={16} /> Processing…</>
        ) : (
          <><FiCreditCard size={16} /> Pay ₹{amount} Online</>
        )}
      </button>
      <p className="text-center text-xs text-neutral-400 mt-2">
        Secured by Razorpay · Test mode active
      </p>
    </div>
  )
}

export default RazorpayCheckout
