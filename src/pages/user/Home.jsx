import { useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FiStar, FiArrowRight, FiChevronLeft, FiChevronRight, FiCheckCircle, FiRefreshCw, FiTag } from 'react-icons/fi'
import { fetchServices } from '../../api/services'

const easeOut = [0.22, 1, 0.36, 1]
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: easeOut },
})
const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, delay, ease: easeOut },
})
const staggerList = { animate: { transition: { staggerChildren: 0.07, delayChildren: 0.28 } } }
const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.38, ease: easeOut } },
}

/* ── Decorative hero + offer images (Unsplash CDN) ──────────────────────── */
const U = (id, w = 600, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`

const HERO = [
  U('photo-1581578731548-c64695cc6952'), // cleaning
  U('photo-1570172619644-dfd03ed5d881'), // beauty / facial
  U('photo-1504328345606-18bbc8c9d7d1'), // plumbing / repair
  U('photo-1621905251918-48416bd8575a'), // electrician
]

const OFFER_BANNERS = [
  { label: 'Sofa deep cleaning from ₹569',            img: U('photo-1555041469-a586c61ea9bc', 800, 450), badge: null,         to: '/services?category=cleaning'   },
  { label: 'Give your bathroom the shine it deserves', img: U('photo-1552321554-5fefe8c9ef14', 800, 450), badge: null,         to: '/services?category=cleaning'   },
  { label: 'Upgrade to premium at ₹249 more',          img: U('photo-1581578731548-c64695cc6952', 800, 450), badge: 'Price drop', to: '/services?category=cleaning' },
]

const PRO_BG = U('photo-1621905251918-48416bd8575a', 400, 600)

/* ── Static data ─────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: "Women's Salon & Spa",   icon: '💆', to: '/services?category=beauty'    },
  { label: "Men's Salon",           icon: '💈', to: '/services?category=beauty'    },
  { label: 'Cleaning',              icon: '🧹', to: '/services?category=cleaning'  },
  { label: 'Painting',              icon: '🖌️', to: '/services?category=painting'  },
  { label: 'AC & Appliance',        icon: '❄️', to: '/services?category=ac-repair' },
  { label: 'Electrician',           icon: '⚡', to: '/services?category=electrical'},
]

const TRUST_STATS = [
  { value: '4.8★', label: 'Average rating'        },
  { value: '12M+', label: 'Customers served'       },
  { value: '50K+', label: 'Verified professionals' },
  { value: '250+', label: 'Services available'     },
]

/* ── Availability badge by category ─────────────────────────────────────── */
const BADGE_MAP = {
  cleaning:   'Instant',
  'ac-repair':'Instant',
  electrical: '44 min',
  plumbing:   '44 min',
  carpentry:  '44 min',
}

const fmtReviews = (n) => {
  if (!n) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/* ── Normalise API service → card shape ─────────────────────────────────── */
const norm = (s) => ({
  _id:           s._id,
  name:          s.title,
  img:           s.image || '',
  rating:        s.rating  || 4.8,
  reviews:       fmtReviews(s.totalReviews),
  price:         s.pricing?.[0]?.price ?? 0,
  originalPrice: null,
  category:      s.category,
  badge:         BADGE_MAP[s.category] || null,
})

/* ── Skeleton card ───────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-36 xs:w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56" aria-hidden="true">
    <div className="w-full aspect-square rounded-xl skeleton mb-3" />
    <div className="skeleton h-3.5 rounded w-4/5 mb-2" />
    <div className="skeleton h-3 rounded w-1/2 mb-2" />
    <div className="skeleton h-3.5 rounded w-1/3" />
  </div>
)

/* ── Service card ────────────────────────────────────────────────────────── */
const ServiceCard = ({ service }) => {
  const navigate = useNavigate()
  return (
    <motion.button
      onClick={() => navigate(`/service/${service._id}`)}
      className="service-card flex-shrink-0 w-36 xs:w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56 text-left"
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 380, damping: 22 } }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="service-card-img relative w-36 xs:w-40 sm:w-44 md:w-48 lg:w-52 xl:w-56 h-36 xs:h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56">
        <img
          src={service.img}
          alt={service.name}
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop' }}
        />
        {service.badge && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-neutral-800 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            {service.badge}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 mb-1">
        {service.name}
      </p>
      <div className="flex items-center gap-1 mb-1">
        <FiStar size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
        <span className="text-xs text-neutral-500">
          {service.rating.toFixed(1)}{service.reviews ? ` (${service.reviews})` : ''}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-neutral-900">₹{service.price}</span>
        {service.originalPrice && (
          <span className="text-xs text-neutral-400 line-through">₹{service.originalPrice}</span>
        )}
      </div>
    </motion.button>
  )
}

/* ── Scrollable service section ─────────────────────────────────────────── */
const ServiceSection = ({ title, subtitle, services, isLoading, to }) => {
  const scrollRef = useRef(null)
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })

  return (
    <motion.section
      aria-labelledby={`sec-${title.replace(/\s/g, '-')}`}
      className="mb-10 md:mb-14"
      {...inView()}
    >
      <div className="page-container">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 id={`sec-${title.replace(/\s/g, '-')}`} className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll(-1)} aria-label="Scroll left"
              className="hidden sm:flex w-8 h-8 rounded-full border border-neutral-200 bg-white items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 shadow-xs flex-shrink-0">
              <FiChevronLeft size={14} className="text-neutral-600" />
            </button>
            <button onClick={() => scroll(1)} aria-label="Scroll right"
              className="hidden sm:flex w-8 h-8 rounded-full border border-neutral-200 bg-white items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 shadow-xs flex-shrink-0">
              <FiChevronRight size={14} className="text-neutral-600" />
            </button>
            <Link to={to || '/services'} className="text-sm font-semibold text-brand hover:text-brand-700 transition-colors duration-150 whitespace-nowrap">
              See all
            </Link>
          </div>
        </div>
        <div ref={scrollRef} className="h-scroll" role="list">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : services.map(s => (
                <div key={s._id} role="listitem">
                  <ServiceCard service={s} />
                </div>
              ))
          }
        </div>
      </div>
    </motion.section>
  )
}

/* ── Home page ───────────────────────────────────────────────────────────── */
const STALE = 5 * 60 * 1000

const Home = () => {
  const navigate = useNavigate()

  const { data: mostBooked,   isLoading: l1 } = useQuery({ queryKey: ['home', 'popular'],   queryFn: () => fetchServices({ sort: 'popular', limit: 8 }),                  staleTime: STALE })
  const { data: womenSalon,   isLoading: l2 } = useQuery({ queryKey: ['home', 'beauty'],    queryFn: () => fetchServices({ category: 'beauty',    sort: 'popular', limit: 6 }), staleTime: STALE })
  const { data: cleaning,     isLoading: l3 } = useQuery({ queryKey: ['home', 'cleaning'],  queryFn: () => fetchServices({ category: 'cleaning',  sort: 'popular', limit: 6 }), staleTime: STALE })
  const { data: appliances,   isLoading: l4 } = useQuery({ queryKey: ['home', 'ac-repair'], queryFn: () => fetchServices({ category: 'ac-repair', sort: 'popular', limit: 6 }), staleTime: STALE })
  const { data: wellness,     isLoading: l5 } = useQuery({ queryKey: ['home', 'wellness'],  queryFn: () => fetchServices({ category: 'wellness',  sort: 'popular', limit: 6 }), staleTime: STALE })
  const { data: repair,       isLoading: l6 } = useQuery({ queryKey: ['home', 'electrical'],queryFn: () => fetchServices({ category: 'electrical', sort: 'popular', limit: 6 }), staleTime: STALE })

  const s = (data) => (data?.services || []).map(norm)

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>UrbanClone — Professional Home Services</title>
        <meta name="description" content="Book trusted home services — cleaning, beauty, AC repair, plumbing and more. Verified professionals at your doorstep." />
        <meta property="og:title" content="UrbanClone — Professional Home Services" />
        <meta property="og:description" content="Book trusted home services at your doorstep." />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="page-container pt-10 pb-10 md:pt-16 md:pb-14 lg:pt-20 lg:pb-20" aria-label="Hero">
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-14">

          {/* Left: copy + category grid */}
          <div className="flex-1 min-w-0">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold text-neutral-900 leading-[1.1] tracking-tight mb-4"
              {...fadeUp(0)}
            >
              Home services,<br /> done right
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-neutral-500 mb-8 max-w-md lg:max-w-lg"
              {...fadeUp(0.12)}
            >
              Trusted professionals for every home need — cleaning, beauty, repairs, and more.
            </motion.p>
            <motion.div
              className="bg-white border border-neutral-200 rounded-2xl p-1 shadow-sm"
              role="navigation"
              aria-label="Service categories"
              {...fadeUp(0.22)}
            >
              <motion.div
                className="grid grid-cols-3 lg:grid-cols-6"
                variants={staggerList}
                initial="initial"
                animate="animate"
              >
                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat.label}
                    variants={staggerItem}
                    onClick={() => navigate(cat.to)}
                    whileHover={{ scale: 1.06, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                    whileTap={{ scale: 0.94 }}
                    className="flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl hover:bg-neutral-50 transition-colors duration-150 text-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-inset"
                  >
                    <div className="w-11 h-11 lg:w-13 lg:h-13 rounded-xl bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center text-xl transition-colors duration-150 flex-shrink-0">
                      {cat.icon}
                    </div>
                    <span className="text-xs font-medium text-neutral-700 leading-tight">{cat.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right: photo mosaic */}
          <div className="hidden lg:grid lg:w-[460px] xl:w-[520px] 2xl:w-[560px] grid-cols-2 gap-3 flex-shrink-0" aria-hidden="true">
            {HERO.map((src, i) => (
              <motion.div
                key={i}
                className="aspect-square rounded-2xl overflow-hidden bg-neutral-100"
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.09, ease: easeOut }}
              >
                <img src={src} alt="" loading="lazy" className="w-full h-full object-cover"
                  onError={e => { e.target.src = `https://picsum.photos/seed/h${i}/600/600` }} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-neutral-100"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {TRUST_STATS.map(stat => (
            <motion.div
              key={stat.label}
              className="flex flex-col gap-1"
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } } }}
            >
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs md:text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Most booked ──────────────────────────────────────────────────── */}
      <ServiceSection title="Most booked services" services={s(mostBooked)} isLoading={l1} to="/services" />

      {/* ── Women's Salon & Spa ──────────────────────────────────────────── */}
      <ServiceSection title="Women's Salon & Spa" subtitle="Pamper yourself at home"
        services={s(womenSalon)} isLoading={l2} to="/services?category=beauty" />

      {/* ── Cleaning essentials ──────────────────────────────────────────── */}
      <ServiceSection title="Cleaning essentials" subtitle="Monthly deep cleaning for your home"
        services={s(cleaning)} isLoading={l3} to="/services?category=cleaning" />

      {/* ── Offers ───────────────────────────────────────────────────────── */}
      <section className="mb-10 md:mb-14" aria-label="Offers and discounts">
        <div className="page-container">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Offers &amp; discounts</h2>
            <Link to="/services" className="text-sm font-semibold text-brand hover:text-brand-700 transition-colors duration-150">See all</Link>
          </div>
          <div className="h-scroll">
            {OFFER_BANNERS.map((offer, i) => (
              <button key={i} onClick={() => navigate(offer.to)}
                className="flex-shrink-0 w-72 sm:w-80 md:w-88 lg:w-96 xl:w-[420px] h-40 sm:h-44 md:h-48 lg:h-52 rounded-xl overflow-hidden relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                aria-label={offer.label}>
                <img src={offer.img} alt="" loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent flex flex-col justify-end p-5">
                  {offer.badge && (
                    <span className="inline-block bg-brand text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-2 w-fit">{offer.badge}</span>
                  )}
                  <p className="text-white font-semibold text-sm leading-snug mb-3 max-w-[180px]">{offer.label}</p>
                  <span className="bg-white text-neutral-900 text-xs font-semibold px-3.5 py-1.5 rounded-lg w-fit hover:bg-neutral-100 transition-colors duration-150">
                    Book now
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Appliance repair ─────────────────────────────────────────────── */}
      <ServiceSection title="Appliance repair & service" services={s(appliances)} isLoading={l4} to="/services?category=ac-repair" />

      {/* ── Wellness & Massage ───────────────────────────────────────────── */}
      <ServiceSection title="Wellness & Massage" subtitle="Relax and recharge at home"
        services={s(wellness)} isLoading={l5} to="/services?category=wellness" />

      {/* ── Home repair ──────────────────────────────────────────────────── */}
      <ServiceSection title="Home repair & installation" services={s(repair)} isLoading={l6} to="/services?category=electrical" />

      {/* ── Why choose us ────────────────────────────────────────────────── */}
      <motion.section className="mb-10 md:mb-14 bg-neutral-50" aria-label="Why choose us" {...inView()}>
        <div className="page-container py-12 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
              Why 12 million customers trust us
            </h2>
            <p className="text-sm text-neutral-500">Every booking is backed by our quality guarantee</p>
          </div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10"
            variants={{ visible: { transition: { staggerChildren: 0.13 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { Icon: FiCheckCircle, title: 'Verified professionals',  desc: 'Every professional is background-checked, skill-tested, and rated by real customers.' },
              { Icon: FiRefreshCw,   title: 'Satisfaction guarantee',  desc: "Not happy with the service? We'll re-do it for free within 24 hours, no questions asked." },
              { Icon: FiTag,         title: 'Transparent pricing',     desc: 'No hidden charges. See the full price before you book — what you see is what you pay.' },
            ].map(item => (
              <motion.div
                key={item.title}
                className="flex flex-col gap-4"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } } }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <item.Icon size={20} className="text-neutral-700" />
                </div>
                <div>
                  <p className="text-base font-semibold text-neutral-900 mb-1.5">{item.title}</p>
                  <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Pro CTA banner ───────────────────────────────────────────────── */}
      <section className="mb-10 md:mb-14" aria-label="Professional registration CTA">
        <div className="page-container">
          <div className="bg-neutral-900 rounded-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-1 p-8 sm:p-10 md:p-12">
                <p className="text-brand text-xs font-semibold uppercase tracking-widest mb-3">For professionals</p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-snug">
                  Grow your business<br className="hidden sm:block" /> with UrbanClone
                </h3>
                <p className="text-neutral-400 text-sm mb-6 max-w-sm leading-relaxed">
                  Join 50,000+ professionals. Get bookings, manage earnings, and build your reputation online.
                </p>
                <Link to="/pro/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 font-semibold px-5 py-3 rounded-xl hover:bg-neutral-100 transition-colors duration-150 text-sm">
                  Register as professional <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="hidden sm:block sm:w-64 md:w-80 self-stretch overflow-hidden flex-shrink-0" aria-hidden="true">
                <img src={PRO_BG} alt="" loading="lazy" className="w-full h-full object-cover opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
