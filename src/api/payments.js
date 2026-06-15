import apiFetch from './apiClient.js'

export const createOrder = (data) =>
  apiFetch('/payments/create-order', { method: 'POST', body: JSON.stringify(data) })

export const verifyPayment = (data) =>
  apiFetch('/payments/verify', { method: 'POST', body: JSON.stringify(data) })
