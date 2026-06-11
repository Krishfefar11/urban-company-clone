import apiFetch from './apiClient.js'

export const fetchProfessionals = ({ city, service, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (city)    params.set('city', city)
  if (service) params.set('service', service)
  return apiFetch(`/professionals?${params}`)
}

export const fetchMyProProfile = () => apiFetch('/professionals/me')

export const updateProProfile = (data) =>
  apiFetch('/professionals/me', { method: 'PUT', body: JSON.stringify(data) })

export const applyAsProfessional = (data) =>
  apiFetch('/professionals/apply', { method: 'POST', body: JSON.stringify(data) })

// Admin
export const fetchPendingPros = ({ page = 1, limit = 20, status = 'pending' } = {}) =>
  apiFetch(`/professionals/admin/pending?page=${page}&limit=${limit}&status=${status}`)

export const approveRejectPro = (id, status) =>
  apiFetch(`/professionals/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ status }) })
