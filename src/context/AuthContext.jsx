import { createContext, useContext, useEffect, useState } from 'react'
import { auth, onAuthStateChanged, signOut } from '../config/firebase'
import { setTokenGetter } from '../api/apiClient'
import useFCM from '../hooks/useFCM'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)         // full user object from MongoDB
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Set token getter IMMEDIATELY — gives apiFetch a fresh token
        // on every call without waiting for React state/effects to run.
        setTokenGetter(
          () => firebaseUser.getIdToken(),          // cached / auto-refresh
          () => firebaseUser.getIdToken(true)        // force a brand-new token
        )
        const idToken = await firebaseUser.getIdToken()
        setToken(idToken)
        // Fetch full user profile from backend
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/users/me`, {
            headers: { Authorization: `Bearer ${idToken}` }
          })
          if (res.ok) {
            const data = await res.json()
            setDbUser(data.user || data)   // handles both { success, user } and bare user
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err)
        }
      } else {
        setUser(null)
        setDbUser(null)
        setToken(null)
        setTokenGetter(() => Promise.resolve(null))
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setDbUser(null)
    setToken(null)
    setTokenGetter(() => Promise.resolve(null))
  }

  // Initialize FCM push notifications after login
  useFCM({ onMessage: () => {} })

  const refreshToken = async () => {
    if (user) {
      const newToken = await user.getIdToken(true)
      setToken(newToken)
      return newToken
    }
    return null
  }

  return (
    <AuthContext.Provider value={{ user, dbUser, token, loading, logout, refreshToken, isAuthenticated: !!user, role: dbUser?.role || null }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
