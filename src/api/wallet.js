import apiFetch from './apiClient.js'

export const fetchWalletBalance = () => apiFetch('/wallet/balance')

export const fetchWalletTransactions = ({ page = 1, limit = 10 } = {}) =>
  apiFetch(`/wallet/transactions?page=${page}&limit=${limit}`)

export const deductWallet = (amount, bookingId) =>
  apiFetch('/wallet/deduct', { method: 'POST', body: JSON.stringify({ amount, bookingId }) })

export const applyPromoCode = (code, orderAmount) =>
  apiFetch('/payments/apply-promo', { method: 'POST', body: JSON.stringify({ code, orderAmount }) })
