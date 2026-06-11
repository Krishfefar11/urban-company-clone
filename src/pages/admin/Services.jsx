import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiStar, FiX, FiCheck, FiAlertCircle,
} from 'react-icons/fi'
import apiFetch from '../../api/apiClient.js'

const fetchAdminServices = ({ search } = {}) => {
  const p = new URLSearchParams({ page: 1, limit: 50 })
  if (search) p.set('search', search)
  return apiFetch(`/services?${p}`)
}
const createService = (data)        => apiFetch('/services',       { method: 'POST',   body: JSON.stringify(data) })
const updateService = (id, data)    => apiFetch(`/services/${id}`, { method: 'PUT',    body: JSON.stringify(data) })
const softDelete    = (id)          => apiFetch(`/services/${id}`, { method: 'DELETE' })
const toggleActive  = (id, isActive)=> apiFetch(`/services/${id}`, { method: 'PUT',    body: JSON.stringify({ isActive }) })

const CATEGORIES = ['cleaning','beauty','ac-repair','wellness','electrical','plumbing','painting','pest-control','carpentry']
const EMPTY = { title: '', category: 'cleaning', description: '', icon: '🔧', images: [''] }

const AdminServices = () => {
  const [search, setSearch] = useState('')
  const [modal,  setModal]  = useState(null)
  const [form,   setForm]   = useState(EMPTY)
  const [delId,  setDelId]  = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-services', search],
    queryFn:  () => fetchAdminServices({ search: search || undefined }),
    keepPreviousData: true,
  })

  const services   = data?.services || []
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-services'] })

  const saveMutation = useMutation({
    mutationFn: (payload) => modal === 'add' ? createService(payload) : updateService(modal._id, payload),
    onSuccess:  () => { invalidate(); setModal(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => softDelete(id),
    onSuccess:  () => { invalidate(); setDelId(null) },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => toggleActive(id, isActive),
    onSuccess:  invalidate,
  })

  const openAdd  = ()    => { setForm(EMPTY); setModal('add') }
  const openEdit = (svc) => {
    setForm({
      title:       svc.title       || '',
      category:    svc.category    || 'cleaning',
      description: svc.description || '',
      icon:        svc.icon        || '🔧',
      images:      svc.images?.length ? svc.images : [''],
    })
    setModal(svc)
  }

  return (
    <div className="bg-neutral-50 min-h-screen">

      {/* Top bar */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-neutral-900 text-xl">Services</h1>
            <p className="text-xs text-neutral-400 mt-0.5">{services.length} in catalogue</p>
          </div>
          <button
            onClick={openAdd}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus size={14} /> Add service
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services…"
            className="input pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-neutral-100">
                <div className="skeleton h-32" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="empty-state">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
              <FiAlertCircle size={20} className="text-red-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">Failed to load services</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => {
              const img    = s.images?.[0] || `https://picsum.photos/seed/${s._id}/400/200`
              const active = s.isActive !== false

              return (
                <div
                  key={s._id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all shadow-sm ${
                    active ? 'border-neutral-100' : 'border-neutral-100 opacity-60'
                  }`}
                >
                  <img src={img} alt={s.title} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-neutral-900 text-sm leading-snug">{s.title}</p>
                      <button
                        onClick={() => toggleMutation.mutate({ id: s._id, isActive: !active })}
                        disabled={toggleMutation.isPending}
                        aria-label={active ? 'Deactivate service' : 'Activate service'}
                        aria-pressed={active}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {active
                          ? <FiToggleRight size={22} className="text-brand" />
                          : <FiToggleLeft  size={22} className="text-neutral-300" />
                        }
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400 mb-3 capitalize">{s.category}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {s.pricing?.[0] && (
                          <span className="font-bold text-neutral-900">₹{s.pricing[0].price}</span>
                        )}
                        {s.rating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-neutral-500">
                            <FiStar size={11} className="text-amber-400 fill-amber-400" />
                            {s.rating?.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          aria-label="Edit service"
                          className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                        >
                          <FiEdit2 size={13} className="text-neutral-600" />
                        </button>
                        <button
                          onClick={() => setDelId(s._id)}
                          aria-label="Delete service"
                          className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 size={13} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {services.length === 0 && !isLoading && (
              <p className="col-span-3 py-16 text-center text-sm text-neutral-400">
                No services yet. Add the first one.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={modal === 'add' ? 'Add service' : 'Edit service'}
        >
          <div className="modal-panel max-w-md">
            <div className="modal-header">
              <h3 className="text-sm font-semibold text-neutral-900">
                {modal === 'add' ? 'Add service' : 'Edit service'}
              </h3>
              <button
                onClick={() => setModal(null)}
                aria-label="Close"
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400"
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="svc-title" className="label">Service name *</label>
                <input
                  id="svc-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input"
                  placeholder="e.g. Full Home Deep Clean"
                />
              </div>
              <div>
                <label htmlFor="svc-category" className="label">Category</label>
                <select
                  id="svc-category"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="input"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="svc-desc" className="label">Description</label>
                <textarea
                  id="svc-desc"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input resize-none"
                  placeholder="Brief description…"
                />
              </div>
              <div>
                <label htmlFor="svc-icon" className="label">Icon (emoji)</label>
                <input
                  id="svc-icon"
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="input"
                  placeholder="🔧"
                />
              </div>
              <div>
                <label htmlFor="svc-image" className="label">Cover image URL</label>
                <input
                  id="svc-image"
                  type="url"
                  value={form.images[0]}
                  onChange={e => setForm(f => ({ ...f, images: [e.target.value] }))}
                  className="input"
                  placeholder="https://…"
                />
              </div>
              {saveMutation.isError && (
                <p className="text-xs text-red-500" role="alert">
                  {saveMutation.error?.message || 'Save failed'}
                </p>
              )}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setModal(null)} className="btn btn-outline flex-1">Cancel</button>
              <button
                onClick={() => saveMutation.mutate({ ...form, images: form.images.filter(Boolean) })}
                disabled={!form.title.trim() || saveMutation.isPending}
                className="btn btn-primary flex-1 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saveMutation.isPending
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><FiCheck size={15} /> {modal === 'add' ? 'Add' : 'Save'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm service deletion"
        >
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl text-center mx-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1">Delete service?</h3>
            <p className="text-sm text-neutral-400 mb-6">This will deactivate it from the catalogue.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="btn btn-outline flex-1">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(delId)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServices
