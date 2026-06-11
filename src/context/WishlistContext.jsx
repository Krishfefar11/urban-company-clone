import { createContext, useContext, useState, useCallback } from 'react'

const KEY = 'uc_wishlist'

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}

const save = (map) => {
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch {}
}

const WishlistContext = createContext(null)

export const WishlistProvider = ({ children }) => {
  const [map, setMap] = useState(load)

  const toggle = useCallback((svc) => {
    setMap(prev => {
      const next = { ...prev }
      if (next[svc._id]) delete next[svc._id]
      else next[svc._id] = svc
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((id) => {
    setMap(prev => {
      const next = { ...prev }
      delete next[id]
      save(next)
      return next
    })
  }, [])

  const has = useCallback((id) => Boolean(map[id]), [map])

  const items = Object.values(map)

  return (
    <WishlistContext.Provider value={{ items, toggle, remove, has }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
