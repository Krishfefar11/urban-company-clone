import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiX, FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi'

const ALL_SERVICES = [
  { id: 1,  name: 'Full Home Deep Clean',   category: 'Cleaning',    price: 499,  path: '/service/1'  },
  { id: 2,  name: 'Kitchen Deep Clean',     category: 'Cleaning',    price: 349,  path: '/service/2'  },
  { id: 3,  name: 'Bathroom Cleaning',      category: 'Cleaning',    price: 249,  path: '/service/3'  },
  { id: 4,  name: 'Foam-jet AC Service',    category: 'AC Repair',   price: 599,  path: '/service/4'  },
  { id: 5,  name: 'AC Gas Refill',          category: 'AC Repair',   price: 799,  path: '/service/5'  },
  { id: 6,  name: 'Salon at Home (Women)',  category: 'Beauty',      price: 799,  path: '/service/6'  },
  { id: 7,  name: 'Salon at Home (Men)',    category: 'Beauty',      price: 499,  path: '/service/7'  },
  { id: 8,  name: 'Full Body Massage',      category: 'Wellness',    price: 999,  path: '/service/8'  },
  { id: 9,  name: 'Pipe Leak Fix',          category: 'Plumbing',    price: 299,  path: '/service/9'  },
  { id: 10, name: 'Tap & Faucet Repair',    category: 'Plumbing',    price: 199,  path: '/service/10' },
  { id: 11, name: 'Electrician at Home',    category: 'Electrician', price: 399,  path: '/service/11' },
  { id: 12, name: 'Switch & Socket Repair', category: 'Electrician', price: 199,  path: '/service/12' },
  { id: 13, name: 'Pest Control',           category: 'Pest Control',price: 699,  path: '/service/13' },
  { id: 14, name: 'Sofa Deep Clean',        category: 'Cleaning',    price: 499,  path: '/service/14' },
  { id: 15, name: 'Carpet Cleaning',        category: 'Cleaning',    price: 399,  path: '/service/15' },
]

const TRENDING = ['Home cleaning', 'AC service', 'Salon at home', 'Massage', 'Electrician']

const SmartSearch = ({
  placeholder = 'Search for services…',
  className   = '',
  compact     = false,
  onSearch,
}) => {
  const navigate = useNavigate()
  const inputRef = useRef()
  const wrapRef  = useRef()
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('uc_search_history') || '[]') } catch { return [] }
  })

  const results = query.trim().length > 1
    ? ALL_SERVICES.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addToHistory = (term) => {
    const next = [term, ...history.filter(h => h !== term)].slice(0, 5)
    setHistory(next)
    try { localStorage.setItem('uc_search_history', JSON.stringify(next)) } catch {}
  }

  const handleSelect = (service) => {
    addToHistory(service.name)
    setQuery(''); setOpen(false)
    navigate(service.path)
  }

  const handleSearch = (term = query) => {
    const t = term.trim()
    if (!t) return
    addToHistory(t)
    setOpen(false); setQuery('')
    if (onSearch) onSearch(t)
    else navigate(`/services?search=${encodeURIComponent(t)}`)
  }

  const clearHistory = () => {
    setHistory([])
    try { localStorage.removeItem('uc_search_history') } catch {}
  }

  const showDropdown = open && (results.length > 0 || query.trim() === '')

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Input */}
      <div className={`flex items-center gap-2 bg-white border transition-all
        ${open ? 'border-neutral-300 ring-2 ring-neutral-900/5' : 'border-neutral-200'}
        ${compact ? 'rounded-full px-3.5 py-2' : 'rounded-2xl px-4 py-3'}`}>
        <FiSearch size={compact ? 14 : 16} className="text-neutral-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); if (e.key === 'Escape') setOpen(false) }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none placeholder-neutral-400 text-neutral-900 text-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
          >
            <FiX size={14} />
          </button>
        )}
        {!compact && (
          <button
            onClick={() => handleSearch()}
            className="flex-shrink-0 bg-neutral-900 text-white px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            Search
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-neutral-100 rounded-2xl shadow-hover z-50 overflow-hidden animate-slide-up">

          {/* Search results */}
          {results.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-4 pt-3 pb-2">Services</p>
              {results.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <FiSearch size={12} className="text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{s.name}</p>
                    <p className="text-xs text-neutral-400">{s.category} · from ₹{s.price}</p>
                  </div>
                  <FiArrowRight size={13} className="text-neutral-300 flex-shrink-0" />
                </button>
              ))}
              <div className="border-t border-neutral-100 mx-4" />
              <button
                onClick={() => handleSearch()}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-brand hover:bg-neutral-50 transition-colors"
              >
                <FiSearch size={14} /> See all results for "{query}"
              </button>
            </div>
          )}

          {/* No results */}
          {query.trim().length > 1 && results.length === 0 && (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-neutral-500">No services found for "<strong>{query}</strong>"</p>
              <p className="text-xs text-neutral-400 mt-1">Try "cleaning", "AC", "salon"…</p>
            </div>
          )}

          {/* Empty state — show trending + history */}
          {query.trim() === '' && (
            <div className="py-2">
              {history.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-4 pt-2 pb-1.5">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Recent</p>
                    <button onClick={clearHistory} className="text-xs text-neutral-400 hover:text-neutral-600">Clear</button>
                  </div>
                  {history.map(h => (
                    <button
                      key={h}
                      onClick={() => handleSearch(h)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-left"
                    >
                      <FiClock size={13} className="text-neutral-400 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">{h}</span>
                    </button>
                  ))}
                  <div className="border-t border-neutral-100 mx-4 my-1" />
                </>
              )}

              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-4 pt-2 pb-1.5">Trending</p>
              {TRENDING.map(t => (
                <button
                  key={t}
                  onClick={() => handleSearch(t)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-left"
                >
                  <FiTrendingUp size={13} className="text-brand flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{t}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SmartSearch
