import apiFetch from './apiClient.js'

export const fetchMyBookings = ({ page = 1, limit = 10, status } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (status && status !== 'All') params.set('status', status.toLowerCase())
  return apiFetch(`/bookings/my?${params}`)
}

export const fetchBookingById = (id) => apiFetch(`/bookings/${id}`)

export const fetchProBookings = ({ page = 1, limit = 10, status } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  return apiFetch(`/bookings/pro?${params}`)
}

export const createBooking = (data) =>
  apiFetch('/bookings', { method: 'POST', body: JSON.stringify(data) })

export const cancelBooking = (id, reason) =>
  apiFetch(`/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) })

export const rescheduleBooking = (id, scheduledAt) =>
  apiFetch(`/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify({ scheduledAt }) })

export const updateBookingStatus = (id, status) =>
  apiFetch(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })

// Admin
export const fetchAllBookings = ({ page = 1, limit = 20, status } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  return apiFetch(`/bookings?${params}`)
}
