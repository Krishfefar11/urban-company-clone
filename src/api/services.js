import apiFetch from './apiClient.js'

export const fetchServices = ({ category, search, city, sort, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (search?.trim()) params.set('search', search.trim())
  if (city)   params.set('city', city)
  if (sort)   params.set('sort', sort)
  params.set('page',  page)
  params.set('limit', limit)
  return apiFetch(`/services?${params}`)
}

export const fetchServiceById = (id) => apiFetch(`/services/${id}`)
