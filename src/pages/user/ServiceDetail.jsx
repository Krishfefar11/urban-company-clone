import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FiStar, FiClock, FiShield, FiChevronDown, FiChevronUp,
  FiCheck, FiArrowLeft, FiPlus, FiMinus, FiAlertCircle, FiHeart,
} from 'react-icons/fi'
import ReviewList from '../../components/reviews/ReviewList'
import { Helmet } from 'react-helmet-async'
import { fetchServiceById } from '../../api/services.js'
import apiFetch from '../../api/apiClient.js'
import { useWishlist } from '../../context/WishlistContext'

const fetchServiceReviews = (serviceId) =>
  apiFetch(`/reviews/service/${serviceId}`)
    .then(res => {
      // Normalize reviews to shape ReviewList expects: { name, date, rating, comment, tags }
      const normalized = (res.reviews || []).map(r => ({
        ...r,
        name: r.user?.name || 'Customer',
        date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        tags: r.tags || [],
      }))
      const totalCount = normalized.length
      const avgRating  = totalCount
        ? normalized.reduce((sum, r) => sum + r.rating, 0) / totalCount
        : 0
      const distribution = [5, 4, 3, 2, 1].reduce((acc, n) => {
        acc[n] = normalized.filter(r => r.rating === n).length
        return acc
      }, {})
      return { reviews: normalized, avgRating, totalCount, distribution }
    })
    .catch(() => ({ reviews: [], avgRating: 0, totalCount: 0, distribution: {} }))

const FAQ = [
  {
    q: 'Is the professional background verified?',
    a: 'Yes — all professionals go through police verification, identity checks, and skill assessments before joining.',
  },
  {
    q: "What if I'm not satisfied?",
    a: "We offer a 100% satisfaction guarantee. Raise a complaint within 24 hours and we'll re-do the service for free.",
  },
  {
    q: 'Do I need to provide equipment or materials?',
    a: 'No — our professionals bring all necessary equipment and eco-friendly supplies. You only need to provide water and electricity.',
  },
  {
    q: 'Can I reschedule or cancel?',
    a: 'Yes — free cancellation or rescheduling up to 2 hours before the service time.',
  },
]

const ServiceDetailSkeleton = () => (
  <div className="page-container py-6 animate-pulse" aria-hidden="true">
    <div className="h-56 sm:h-72 bg-neutral-200 rounded-xl mb-6" />
    <div className="flex gap-8">
      <div className="flex-1 space-y-4">
        <div className="h-3 bg-neutral-200 rounded w-20" />
        <div className="h-7 bg-neutral-200 rounded w-2/3" />
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
        <div className="space-y-2 mt-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-3.5 bg-neutral-200 rounded w-full" />)}
        </div>
      </div>
      <div className="hidden lg:block w-72 h-64 bg-neutral-200 rounded-xl flex-shrink-0" />
    </div>
  </div>
)

const ServiceDetail = () => {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn:  () => fetchServiceById(id),
    enabled:  !!id,
  })

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', 'service', id],
    queryFn:  () => fetchServiceReviews(id),
    enabled:  !!id,
    staleTime: 5 * 60 * 1000,
  })

  const svc = data?.service

  const { toggle, has } = useWishlist()

  const [selectedPlan, setSelectedPlan] = useState(0)
  const [qty,          setQty]          = useState(1)
  const [openFaq,      setOpenFaq]      = useState(null)

  if (isLoading) return <ServiceDetailSkeleton />

  if (isError || !svc) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center" role="main">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-1">
        <FiAlertCircle size={24} className="text-red-400" />
      </div>
      <p className="text-base font-semibold text-neutral-700">Service not found</p>
      <button
        onClick={() => navigate('/services')}
        className="btn btn-outline btn-sm mt-1"
      >
        Browse all services
      </button>
    </div>
  )

  const pricing = svc.pricing || []
  const plan    = pricing[selectedPlan] || {}
  const total   = (plan.price || 0) * qty

  const formatReviews = (n) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M'
    : n >= 1_000   ? Math.round(n / 1_000) + 'K'
    : n

  const heroImg = svc.images?.[0] || `https://picsum.photos/seed/${svc._id}/900/500`

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{svc.title} — UrbanClone</title>
        <meta name="description" content={svc.description || `Book ${svc.title} with verified professionals.`} />
        <meta property="og:title" content={`${svc.title} — UrbanClone`} />
        <meta property="og:image" content={heroImg} />
      </Helmet>

      {/* Hero image */}
      <div className="relative h-52 sm:h-72 md:h-80 lg:h-96 overflow-hidden bg-neutral-100">
        <img src={heroImg} alt={svc.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors duration-150"
        >
          <FiArrowLeft size={16} className="text-neutral-800" />
        </button>
        <motion.button
          onClick={() => toggle(svc)}
          aria-label={has(svc._id) ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors duration-150"
          whileTap={{ scale: 0.85 }}
        >
          <motion.div
            animate={{ scale: has(svc._id) ? [1, 1.4, 1] : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          >
            <FiHeart
              size={16}
              className={has(svc._id) ? 'text-red-500 fill-red-500' : 'text-neutral-700'}
            />
          </motion.div>
        </motion.button>
      </div>

      <div className="page-container py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0">

            {/* Category label */}
            <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">
              {svc.category}
            </p>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
              {svc.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              {svc.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <FiStar size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-neutral-900">{svc.rating?.toFixed(2)}</span>
                  <span className="text-neutral-400">({formatReviews(svc.reviewCount || 0)} reviews)</span>
                </div>
              )}
              {svc.duration && (
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <FiClock size={13} />
                  <span>{svc.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-neutral-500">
                <FiShield size={13} className="text-brand" />
                <span>Verified professional</span>
              </div>
            </div>

            {/* Description */}
            {svc.description && (
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">{svc.description}</p>
            )}

            {/* What's included */}
            {svc.includes?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-neutral-900 mb-4">What's included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {svc.includes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FiCheck size={11} className="text-brand" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="divider mb-6" />

            {/* Reviews section */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-neutral-900 mb-5">Customer reviews</h2>
              <ReviewList
                reviews={reviewData?.reviews || []}
                avgRating={reviewData?.avgRating ?? svc.rating ?? 0}
                totalCount={reviewData?.totalCount ?? svc.reviewCount ?? 0}
                distribution={reviewData?.distribution || {}}
              />
            </div>

            {/* Divider */}
            <div className="divider mb-6" />

            {/* FAQ */}
            <div>
              <h2 className="text-base font-semibold text-neutral-900 mb-4">Frequently asked questions</h2>
              <div className="space-y-2">
                {FAQ.map((item, i) => (
                  <div
                    key={i}
                    className="border border-neutral-100 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors duration-150"
                    >
                      <span className="pr-4">{item.q}</span>
                      {openFaq === i
                        ? <FiChevronUp size={15} className="text-brand flex-shrink-0" />
                        : <FiChevronDown size={15} className="text-neutral-400 flex-shrink-0" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 pt-3 text-sm text-neutral-500 leading-relaxed border-t border-neutral-100 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: sticky booking card ── */}
          <div className="lg:w-[320px] xl:w-[360px] flex-shrink-0">
            <div className="border border-neutral-200 rounded-2xl p-5 lg:p-6 lg:sticky lg:top-24 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Select a package</h3>

              {pricing.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-4">No pricing available</p>
              ) : (
                <div className="space-y-2 mb-5" role="radiogroup" aria-label="Pricing plans">
                  {pricing.map((p, i) => (
                    <button
                      key={i}
                      role="radio"
                      aria-checked={selectedPlan === i}
                      onClick={() => setSelectedPlan(i)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 text-sm text-left ${
                        selectedPlan === i
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-100 hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="font-bold">₹{p.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-medium text-neutral-700">Quantity</span>
                <div className="flex items-center gap-3" role="group" aria-label="Quantity">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150"
                  >
                    <FiMinus size={12} />
                  </button>
                  <span className="text-sm font-bold w-5 text-center" aria-live="polite">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    aria-label="Increase quantity"
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150"
                  >
                    <FiPlus size={12} />
                  </button>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-neutral-50 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Service × {qty}</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Convenience fee</span>
                  <span className="text-brand font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 border-t border-neutral-200 pt-2 mt-1 text-sm">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/booking/${id}`)}
                disabled={pricing.length === 0}
                className="btn btn-primary w-full"
              >
                Book now
              </button>

              <p className="text-xs text-neutral-400 text-center mt-3 flex items-center justify-center gap-1">
                <FiShield size={11} />
                Free cancellation up to 2 hrs before
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile sticky CTA */}
      {pricing.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-3 z-[100] safe-pb">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div>
              <p className="text-xs text-neutral-500">Starting from</p>
              <p className="text-lg font-bold text-neutral-900">₹{pricing[selectedPlan]?.price || pricing[0]?.price}</p>
            </div>
            <button
              onClick={() => navigate(`/booking/${id}`)}
              className="btn btn-primary"
            >
              Book now
            </button>
          </div>
        </div>
      )}
      {pricing.length > 0 && <div className="lg:hidden h-20" aria-hidden="true" />}
    </div>
  )
}

export default ServiceDetail
