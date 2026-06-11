import apiFetch from './apiClient.js'

export const fetchAdminStats    = ()                    => apiFetch('/admin/stats')
export const fetchAdminBookings = ({ page = 1, limit = 20, status } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  return apiFetch(`/admin/bookings?${params}`)
}
