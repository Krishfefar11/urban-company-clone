import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FiStar, FiArrowRight } from 'react-icons/fi'
import apiFetch from '../../api/apiClient.js'

const TAGS = ['On time', 'Great work', 'Would recommend', 'Professional', 'Very clean', 'Thorough', 'Friendly', 'Value for money']
const LABEL_MAP = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent!' }

const submitReview = (payload) =>
  apiFetch('/reviews', { method: 'POST', body: JSON.stringify(payload) })

const ReviewForm = ({ bookingId, professionalId, serviceId, serviceName, proName, onSubmit }) => {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [tags,    setTags]    = useState([])
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => submitReview({
      booking:      bookingId,
      professional: professionalId,
      service:      serviceId,
      rating,
      comment:      comment.trim(),
      tags,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
      setTimeout(() => onSubmit?.(), 1200)
    },
  })

  const toggleTag = t => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t])
  const display   = hovered || rating

  if (mutation.isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center mx-auto mb-4">
          <FiStar size={28} className="text-white fill-white" />
        </div>
        <p className="font-bold text-neutral-900 text-lg mb-1">Thank you!</p>
        <p className="text-sm text-neutral-400">Your review helps thousands of customers.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {(serviceName || proName) && (
        <div className="bg-neutral-50 rounded-xl p-3.5">
          {serviceName && <p className="font-medium text-neutral-900 text-sm">{serviceName}</p>}
          {proName     && <p className="text-xs text-neutral-400 mt-0.5">by {proName}</p>}
        </div>
      )}

      {/* Star picker */}
      <div>
        <p className="label mb-3">How would you rate the service?</p>
        <div className="flex items-center gap-2" role="group" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i)}
              aria-label={`${i} star${i !== 1 ? 's' : ''}`}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <FiStar
                size={36}
                className={`transition-colors ${i <= display ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`}
              />
            </button>
          ))}
          {display > 0 && (
            <span className="ml-2 text-sm font-bold text-neutral-900">{LABEL_MAP[display]}</span>
          )}
        </div>
      </div>

      {/* Quick tags */}
      <div>
        <p className="label mb-2">
          What went well? <span className="text-neutral-400 font-normal">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              aria-pressed={tags.includes(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                tags.includes(t)
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="label">
          Add a comment <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={300}
          placeholder="Share details about your experience…"
          className="input resize-none mt-1.5"
        />
        <p className="text-xs text-neutral-400 text-right mt-1">{comment.length}/300</p>
      </div>

      {mutation.isError && (
        <p className="text-xs text-red-500" role="alert">
          {mutation.error?.message || 'Failed to submit review'}
        </p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={!rating || mutation.isPending}
        className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {mutation.isPending
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <> Submit review <FiArrowRight size={15} /> </>
        }
      </button>
    </div>
  )
}

export default ReviewForm
