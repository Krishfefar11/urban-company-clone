// Central API fetch helper — attaches auth token automatically
const BASE = import.meta.env.VITE_API_URL || '/api'

// Token getters — injected by AuthContext after init.
// _getToken     : returns cached token (or auto-refresh if near expiry)
// _forceRefresh : forces a new token from Firebase — used on 401 retry
let _getToken     = () => Promise.resolve(null)
let _forceRefresh = () => Promise.resolve(null)

export const setTokenGetter = (fn, forceFn) => {
  _getToken     = fn
  _forceRefresh = forceFn || fn
}
export const getToken = () => Promise.resolve(_getToken())
export { BASE }

const apiFetch = async (path, options = {}, _retry = true) => {
  const token = await Promise.resolve(_getToken())
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  // On 401: force-refresh the Firebase token and retry exactly once.
  // This covers the common case where the 1-hour token expired mid-session.
  if (res.status === 401 && _retry) {
    try {
      const freshToken = await Promise.resolve(_forceRefresh())
      if (freshToken) {
        return apiFetch(path, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${freshToken}` },
        }, false) // _retry=false prevents infinite loop
      }
    } catch (_) {
      // Force-refresh failed — fall through to throw the original error
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw Object.assign(new Error(err.message || `Request failed: ${res.status}`), { status: res.status, data: err })
  }

  return res.json()
}

export default apiFetch
