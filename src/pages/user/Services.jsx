import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiStar, FiFilter, FiChevronDown, FiSearch, FiAlertCircle, FiX, FiClock } from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'
import { fetchServices } from '../../api/services'
import { useCity } from '../../context/CityContext'

const CATS = [
  { key: 'all',        label: 'All'                },
  { key: 'cleaning',   label: 'Cleaning'           },
  { key: 'beauty',     label: 'Beauty & Spa'       },
  { key: 'ac-repair',  label: 'AC & Appliance'     },
  { key: 'wellness',   label: 'Massage & Wellness' },
  { key: 'electrical', label: 'Electrician'        },
  { key: 'plumbing',   label: 'Plumbing'           },
  { key: 'painting',   label: 'Painting'           },
  { key: 'carpentry',  label: 'Carpentry'          },
]

const SORTS = [
  { key: 'popular',   label: 'Most popular'       },
  { key: 'price_asc', label: 'Price: low to high' },
  { key: 'price_desc',label: 'Price: high to low' },
  { key: 'rating',    label: 'Highest rated'      },
]

const SkeletonCard = () => (
  <div className="cursor-default" aria-hidden="true">
    <div className="aspect-square rounded-xl skeleton mb-3" />
    <div className="skeleton h-3.5 rounded mb-2 w-4/5" />
    <div className="skeleton h-3 rounded mb-2 w-1/2" />
    <div className="skeleton h-3.5 rounded w-1/3" />
  </div>
)

const Services = () => {
  const navigate     = useNavigate()
  const { city }     = useCity()
  const [params]     = useSearchParams()

  const [activeCat, setActiveCat] = useState(params.get('category') || 'all')
  const [sort,      setSort]      = useState('popular')
  const [search,    setSearch]    = useState(params.get('search') || '')
  const [showSort,  setShowSort]  = useState(false)
  const [page,      setPage]      = useState(1)

  useEffect(() => {
    setActiveCat(params.get('category') || 'all')
    setSearch(params.get('search') || '')
    setPage(1)
  }, [params])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['services', { activeCat, sort, search, page, city }],
    queryFn:  () => fetchServices({ category: activeCat, search, sort, page, limit: 24, city }),
    keepPreviousData: true,
  })

  const services   = data?.services   || []
  const total      = data?.total      || 0
  const totalPages = data?.totalPages || 1
  const sortLabel  = SORTS.find(s => s.key === sort)?.label

  const handleCatChange = (cat) => { setActiveCat(cat); setPage(1) }
  const handleSearch    = (val) => { setSearch(val);    setPage(1) }

  const activeLabel = CATS.find(c => c.key === activeCat)?.label || 'All Services'

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{activeLabel} — UrbanClone</title>
        <meta name="description" content="Browse and book home services — cleaning, beauty, AC repair, plumbing, and more." />
      </Helmet>

      {/* Category filter bar */}
      <div className="border-b border-neutral-100 sticky top-14 md:top-16 z-[100] bg-white">
        <div className="page-container">
          <div
            className="flex items-center gap-2 overflow-x-auto scroll-hide py-3"
            role="tablist"
            aria-label="Service categories"
          >
            {CATS.map(c => (
              <button
                key={c.key}
                role="tab"
                aria-selected={activeCat === c.key}
                onClick={() => handleCatChange(c.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
                  activeCat === c.key
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container py-6">

        {/* Page title + toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{activeLabel}</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {isLoading
                ? 'Loading services…'
                : `${total} service${total !== 1 ? 's' : ''} available in your city`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <label htmlFor="services-search" className="sr-only">Search services</label>
              <FiSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="services-search"
                type="search"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search services…"
                className="pl-9 pr-9 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-44 sm:w-52 transition-colors duration-150"
              />
              {search && (
                <button
                  onClick={() => handleSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSort(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={showSort}
                className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 whitespace-nowrap"
              >
                <FiFilter size={13} className="text-neutral-400" />
                <span className="hidden sm:inline">{sortLabel}</span>
                <span className="sm:hidden">Sort</span>
                <FiChevronDown size={12} className={`transition-transform duration-150 ${showSort ? 'rotate-180' : ''}`} />
              </button>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-[30]" onClick={() => setShowSort(false)} />
                  <div
                    role="listbox"
                    aria-label="Sort options"
                    className="dropdown right-0 top-10 w-52 py-1 z-[40] animate-scale-in"
                  >
                    {SORTS.map(s => (
                      <button
                        key={s.key}
                        role="option"
                        aria-selected={sort === s.key}
                        onClick={() => { setSort(s.key); setShowSort(false) }}
                        className={`dropdown-item w-full ${sort === s.key ? 'bg-neutral-50 font-semibold text-neutral-900' : ''}`}
                      >
                        {s.label}
                        {sort === s.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="error-banner mb-6" role="alert">
            <FiAlertCircle size={16} className="flex-shrink-0" />
            <span>Failed to load services: {error?.message}. Make sure the backend is running.</span>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <FiSearch size={22} className="text-neutral-300" />
            </div>
            <p className="text-base font-semibold text-neutral-900 mb-1">No services found</p>
            <p className="text-sm text-neutral-400 mb-5">Try a different category or search term</p>
            <button
              onClick={() => { handleCatChange('all'); handleSearch('') }}
              className="btn btn-primary btn-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7"
              role="list"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              initial="hidden"
              animate="visible"
            >
              {services.map(s => (
                <motion.button
                  key={s._id}
                  role="listitem"
                  onClick={() => navigate(`/service/${s._id}`)}
                  className="service-card text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:rounded-xl"
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } } }}
                  whileHover={{ y: -4, transition: { type: 'spring', stiffness: 380, damping: 22 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-2.5 relative">
                    <img
                      src={s.image || `https://picsum.photos/seed/${s.slug || s._id}/400/400`}
                      alt={s.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${s.category}/400/400` }}
                    />
                    {s.isInstant && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-neutral-800 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        Instant
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 mb-1">
                    {s.title}
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1">
                      <FiStar size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                      <span className="text-xs text-neutral-500">
                        {s.rating?.toFixed(1) || '4.8'}
                        {s.totalReviews > 0 && ` (${s.totalReviews >= 1000 ? (s.totalReviews / 1000).toFixed(1) + 'K' : s.totalReviews})`}
                      </span>
                    </span>
                    {s.duration && (
                      <span className="flex items-center gap-1 text-xs text-neutral-400">
                        <FiClock size={10} className="flex-shrink-0" />
                        {s.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-neutral-900">
                      ₹{s.pricing?.[0]?.price ?? '—'}
                    </span>
                    {s.pricing?.[1] && (
                      <span className="text-xs text-neutral-400 line-through">₹{s.pricing[1].price}</span>
                    )}
                  </div>
                  {s.tag && (
                    <span className="badge badge-green mt-1.5">{s.tag}</span>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10" role="navigation" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-outline btn-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-500" aria-live="polite">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Services
