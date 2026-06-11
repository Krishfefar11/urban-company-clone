import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiStar, FiClock, FiTrash2 } from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'
import { useWishlist } from '../../context/WishlistContext'

const Wishlist = () => {
  const navigate        = useNavigate()
  const { items, remove } = useWishlist()

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">
      <Helmet>
        <title>Wishlist — UrbanClone</title>
      </Helmet>

      {/* Header */}
      <div className="bg-neutral-900 pt-8 pb-6">
        <div className="page-container flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">Wishlist</h1>
            <p className="text-neutral-400 text-xs mt-0.5">
              {items.length} saved service{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => navigate('/services')} className="btn btn-brand btn-sm">
            + Browse more
          </button>
        </div>
      </div>

      <div className="page-container py-6 pb-10">
        {items.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
              <FiHeart size={22} className="text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-900 mb-1">Your wishlist is empty</p>
            <p className="text-sm text-neutral-400 mb-5 text-center">
              Tap the heart on any service to save it here
            </p>
            <button onClick={() => navigate('/services')} className="btn btn-primary btn-sm">
              Browse services
            </button>
          </div>
        ) : (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            animate="visible"
          >
            {items.map(svc => (
              <motion.div
                key={svc._id}
                className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-sm hover:shadow-card transition-shadow"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
                whileHover={{ y: -3, transition: { type: 'spring', stiffness: 380, damping: 22 } }}
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={svc.image || `https://picsum.photos/seed/${svc._id}/400/300`}
                    alt={svc.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${svc.category}/400/300` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <button
                    onClick={() => remove(svc._id)}
                    aria-label={`Remove ${svc.title} from wishlist`}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <FiTrash2 size={13} className="text-red-500" />
                  </button>
                  <div className="absolute bottom-2 left-3">
                    <span className="badge badge-gray capitalize">{svc.category}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <p className="font-semibold text-neutral-900 text-sm mb-2 leading-snug line-clamp-2">
                    {svc.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FiStar size={11} className="text-amber-400 fill-amber-400" />
                      {svc.rating?.toFixed(1) || '4.8'}
                      {svc.totalReviews > 0 && ` (${svc.totalReviews >= 1000 ? Math.round(svc.totalReviews / 1000) + 'K' : svc.totalReviews})`}
                    </span>
                    {svc.duration && (
                      <span className="flex items-center gap-1">
                        <FiClock size={11} /> {svc.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-neutral-900">
                      ₹{svc.pricing?.[0]?.price ?? '—'}
                    </p>
                    <button
                      onClick={() => navigate(`/service/${svc._id}`)}
                      className="btn btn-primary btn-sm"
                    >
                      Book now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
