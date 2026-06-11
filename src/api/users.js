import apiFetch from './apiClient.js'

export const fetchMe = () => apiFetch('/users/me')

export const updateProfile = (data) =>
  apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) })

// Admin
export const fetchAllUsers = ({ page = 1, limit = 20, search, role } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (search) params.set('search', search)
  if (role)   params.set('role', role)
  return apiFetch(`/users?${params}`)
}

export const updateUserRole   = (id, role)     => apiFetch(`/users/${id}/role`,   { method: 'PATCH', body: JSON.stringify({ role })     })
export const updateUserStatus = (id, isActive) => apiFetch(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) })
