import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiSearch, FiMapPin, FiChevronDown, FiUser, FiMenu, FiX,
  FiLogOut, FiBookmark, FiStar, FiClock, FiCreditCard, FiHome,
  FiShield, FiGrid,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useCity } from '../../context/CityContext'

const NAV_LINKS = [
  { label: 'Cleaning',        to: '/services?category=cleaning'   },
  { label: 'Beauty & Spa',    to: '/services?category=beauty'     },
  { label: 'Appliance Repair',to: '/services?category=ac-repair'  },
  { label: 'Electrician',     to: '/services?category=electrical' },
]

const ALL_SERVICES = [
  'AC Deep Clean', 'AC Gas Refill', 'AC Repair', 'Bathroom Cleaning', 'Full Home Cleaning',
  'Kitchen Deep Clean', 'Sofa Cleaning', 'Haircut for Men', 'Salon at Home', 'Facial & Cleanup',
  'Full Body Massage', 'Pedicure', 'Waxing', 'Pest Control', 'Electrician', 'Plumbing',
  'Home Painting', 'Fan Installation',
]

const UserMenu = ({ dbUser, role, logout }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (dbUser?.name || 'U').charAt(0).toUpperCase()

  const menuItems = [
    { icon: FiUser,    label: 'My Profile',     path: '/profile'     },
    { icon: FiClock,   label: 'My Bookings',    path: '/my-bookings' },
    { icon: FiCreditCard, label: 'Wallet',         path: '/wallet'      },
    { icon: FiBookmark,label: 'Wishlist',        path: '/wishlist'    },
    { icon: FiStar,    label: 'My Reviews',      path: '/reviews'     },
  ]

  const proItems = (role === 'professional' || role === 'admin')
    ? [{ icon: FiGrid,   label: 'Pro Dashboard', path: '/pro/dashboard' }]
    : []

  const adminItems = role === 'admin'
    ? [{ icon: FiShield, label: 'Admin Panel',   path: '/admin/dashboard' }]
    : []

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900"
      >
        {initials}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
          <div className="dropdown right-0 top-10 w-56 z-[100] py-1">
            <div className="px-4 py-3 border-b border-neutral-100">
              <p className="text-sm font-semibold text-neutral-900 truncate">{dbUser?.name || 'User'}</p>
              <p className="text-xs text-neutral-400 mt-0.5 capitalize">{role || 'customer'}</p>
            </div>
            <nav className="py-1">
              {[...menuItems, ...proItems, ...adminItems].map(item => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setOpen(false) }}
                  className="dropdown-item"
                >
                  <item.icon size={14} className="text-neutral-400 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-neutral-100 py-1">
              <button
                onClick={() => { logout(); navigate('/'); setOpen(false) }}
                className="dropdown-item text-red-500 hover:bg-red-50"
              >
                <FiLogOut size={14} className="flex-shrink-0" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const Navbar = () => {
  const { isAuthenticated, dbUser, role, logout } = useAuth()
  const { city, setCity, cities }                 = useCity()
  const location = useLocation()

  const [query,      setQuery]      = useState('')
  const [suggestions,setSug]       = useState([])
  const [searchFocus,setSearchFocus]= useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cityOpen,   setCityOpen]   = useState(false)

  const navigate  = useNavigate()
  const searchRef = useRef(null)
  const cityRef   = useRef(null)

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocus(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (val) => {
    setQuery(val)
    if (!val.trim()) { setSug([]); return }
    setSug(ALL_SERVICES.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 6))
  }

  const goSearch = (term) => {
    setQuery(term)
    setSug([])
    setSearchFocus(false)
    navigate(`/services?search=${encodeURIComponent(term)}`)
  }

  const showSuggestions = searchFocus && suggestions.length > 0

  return (
    <header className="bg-white sticky top-0 z-[200]" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.08)' }}>
      <div className="page-container">
        <div className="flex items-center gap-3 h-14 md:h-16">

          {/* Logo */}
          <Link
            to="/"
            aria-label="UrbanClone home"
            className="flex items-center gap-2 flex-shrink-0 mr-1"
          >
            <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[9px] tracking-tight">UC</span>
            </div>
            <div className="hidden sm:block leading-none">
              <p className="text-[11px] font-bold text-neutral-900 leading-tight">Urban</p>
              <p className="text-[11px] font-bold text-neutral-900 leading-tight">Company</p>
            </div>
          </Link>

          {/* Nav links — desktop only */}
          <nav className="hidden lg:flex items-center gap-5 ml-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1 flex items-center gap-3 ml-auto">

            {/* City selector */}
            <div className="hidden md:block relative flex-shrink-0" ref={cityRef}>
              <button
                onClick={() => setCityOpen(o => !o)}
                aria-label={`Change city, currently ${city}`}
                aria-expanded={cityOpen}
                className="flex items-center gap-1 border border-neutral-200 rounded-full px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors duration-150 max-w-[140px]"
              >
                <FiMapPin size={12} className="text-neutral-400 flex-shrink-0" />
                <span className="truncate text-sm">{city}</span>
                <FiChevronDown size={12} className={`flex-shrink-0 transition-transform duration-150 ${cityOpen ? 'rotate-180' : ''}`} />
              </button>
              {cityOpen && (
                <div className="dropdown left-0 top-9 min-w-[160px] py-1 z-[100]">
                  {cities.map(c => (
                    <button
                      key={c}
                      onClick={() => { setCity(c); setCityOpen(false) }}
                      className={`dropdown-item ${c === city ? 'font-semibold text-brand-600' : ''}`}
                    >
                      {c === city && <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block mr-1.5" />}
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg relative" ref={searchRef}>
              <label htmlFor="navbar-search" className="sr-only">Search services</label>
              <div className={`flex items-center gap-2 border rounded-full px-3.5 py-2 bg-white transition-all duration-150 ${searchFocus ? 'border-neutral-300 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}>
                <FiSearch size={14} className="text-neutral-400 flex-shrink-0" />
                <input
                  id="navbar-search"
                  type="search"
                  value={query}
                  onChange={e => { handleSearch(e.target.value); setSearchFocus(true) }}
                  onFocus={() => setSearchFocus(true)}
                  onKeyDown={e => { if (e.key === 'Enter' && query.trim()) goSearch(query) }}
                  placeholder="Search for services"
                  autoComplete="off"
                  className="flex-1 text-sm outline-none bg-transparent placeholder-neutral-400 text-neutral-800 min-w-0"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setSug([]) }}
                    aria-label="Clear search"
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>
              {showSuggestions && (
                <div className="dropdown top-full left-0 right-0 mt-1.5 py-1 z-[100] animate-slide-down">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => goSearch(s)}
                      className="dropdown-item"
                    >
                      <FiSearch size={12} className="text-neutral-400 flex-shrink-0" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Become a Pro — desktop only */}
              <Link
                to="/pro/register"
                className="hidden lg:inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors duration-150 whitespace-nowrap mr-1"
              >
                Become a Pro
              </Link>

              {isAuthenticated ? (
                <UserMenu dbUser={dbUser} role={role} logout={logout} />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex btn btn-outline btn-sm"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-primary btn-sm"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors duration-150"
              >
                {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-100 bg-white animate-slide-down">
          <div className="page-container py-4 space-y-1">
            {/* City selector on mobile */}
            <div className="flex items-center gap-2 text-sm text-neutral-600 px-3 py-2.5 mb-2">
              <FiMapPin size={13} className="text-neutral-400" />
              <span>Delivering in</span>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="font-semibold text-neutral-900 bg-transparent focus:outline-none"
                aria-label="Select city"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Nav links */}
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                <FiHome size={14} className="text-neutral-400" />
                {link.label}
              </Link>
            ))}

            <Link
              to="/pro/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand-50 rounded-lg transition-colors border border-brand/20 mt-1"
            >
              <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">✓</span>
              Become a Pro
            </Link>

            {!isAuthenticated && (
              <div className="flex gap-2 pt-3 border-t border-neutral-100 mt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 btn btn-outline text-center"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 btn btn-primary text-center"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
