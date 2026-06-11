import { useState } from 'react'
import { FiStar, FiThumbsUp, FiChevronDown } from 'react-icons/fi'

const StarBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="text-neutral-500 w-3 text-right">{label}</span>
      <FiStar size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full bg-neutral-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-neutral-400 w-7 text-right">{pct}%</span>
    </div>
  )
}

const ReviewCard = ({ review }) => {
  const [helpful, setHelpful] = useState(review.helpful || 0)
  const [didHelp, setDidHelp] = useState(false)

  const handleHelpful = () => {
    if (didHelp) return
    setHelpful(h => h + 1)
    setDidHelp(true)
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {review.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-neutral-900 text-sm">{review.name}</p>
            <p className="text-xs text-neutral-400">{review.date}</p>
          </div>
        </div>
        <div
          className="flex items-center gap-0.5 flex-shrink-0"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              size={12}
              className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}
            />
          ))}
        </div>
      </div>

      {/* Tags */}
      {review.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {review.tags.map(t => (
            <span key={t} className="badge badge-green">{t}</span>
          ))}
        </div>
      )}

      {/* Comment */}
      {(review.comment || review.text) && (
        <p className="text-sm text-neutral-600 leading-relaxed mb-3">{review.comment || review.text}</p>
      )}

      {/* Helpful */}
      <button
        onClick={handleHelpful}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          didHelp ? 'text-brand' : 'text-neutral-400 hover:text-neutral-600'
        }`}
      >
        <FiThumbsUp size={12} className={didHelp ? 'fill-brand text-brand' : ''} />
        Helpful{helpful > 0 ? ` (${helpful})` : ''}
      </button>
    </div>
  )
}

const ReviewList = ({ reviews = [], avgRating = 0, totalCount = 0, distribution = {} }) => {
  const [showAll, setShowAll] = useState(false)

  const total   = Object.values(distribution).reduce((a, b) => a + b, 0) || totalCount
  const visible = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div className="space-y-5">
      {/* Summary */}
      {total > 0 && (
        <div className="flex gap-6 items-start">
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-bold text-neutral-900 leading-none">{Number(avgRating).toFixed(1)}</p>
            <div className="flex items-center justify-center gap-0.5 mt-2 mb-1" aria-label={`${avgRating} out of 5`}>
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={13}
                  className={i < Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-400">{total.toLocaleString()} reviews</p>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            {[5, 4, 3, 2, 1].map(n => (
              <StarBar key={n} label={n} count={distribution[n] || 0} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* Review cards */}
      {reviews.length > 0 ? (
        <>
          <div className="space-y-3">
            {visible.map((r, i) => <ReviewCard key={i} review={r} />)}
          </div>
          {reviews.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="btn btn-outline w-full flex items-center justify-center gap-2"
            >
              Show all {reviews.length} reviews <FiChevronDown size={15} />
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <FiStar size={18} className="text-neutral-300" />
          </div>
          <p className="text-sm font-medium text-neutral-700">No reviews yet</p>
          <p className="text-xs text-neutral-400 mt-1">Be the first to review this service</p>
        </div>
      )}
    </div>
  )
}

export default ReviewList
