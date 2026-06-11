import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiStar, FiArrowLeft } from 'react-icons/fi'
import apiFetch from '../../api/apiClient'

const fetchMyReviews = () => apiFetch('/reviews/my')

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(i => (
      <FiStar
        key={i}
        size={13}
        className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}
      />
    ))}
  </div>
)

const MyReviews = () => {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn:  fetchMyReviews,
  })
  const reviews = data?.reviews || []

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Header */}
      <div className="bg-neutral-900 pt-8 pb-6">
        <div className="page-container">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-150"
            >
              <FiArrowLeft size={15} className="text-white" />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">My Reviews</h1>
              <p className="text-neutral-400 text-xs mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''} given</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-5 pb-10 max-w-[860px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5 animate-pulse" aria-hidden="true">
                <div className="skeleton h-3.5 rounded w-1/2 mb-2" />
                <div className="skeleton h-3 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
              <FiStar size={22} className="text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-900 mb-1">No reviews yet</p>
            <p className="text-sm text-neutral-400 mb-5 max-w-xs text-center">
              After completing a booking, leave a review to help others.
            </p>
            <button
              onClick={() => navigate('/my-bookings')}
              className="btn btn-primary btn-sm"
            >
              View bookings
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r._id} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  {r.service?.image && (
                    <img
                      src={r.service.image}
                      alt={r.service.title}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0 bg-neutral-100"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{r.service?.title || 'Service'}</p>
                    <div className="mt-1">
                      <StarRating rating={r.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 flex-shrink-0">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyReviews
