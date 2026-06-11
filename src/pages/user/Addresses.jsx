import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiHome, FiBriefcase, FiX, FiCheck } from 'react-icons/fi'
import { fetchMe, updateProfile } from '../../api/users.js'

const TYPES = [
  { key: 'home',  label: 'Home',  icon: FiHome      },
  { key: 'work',  label: 'Work',  icon: FiBriefcase },
  { key: 'other', label: 'Other', icon: FiMapPin    },
]

const EMPTY_FORM = { type: 'home', label: 'Home', line1: '', line2: '', city: '', pincode: '' }

const Addresses = () => {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form,  setForm]  = useState(EMPTY_FORM)
  const [delId, setDelId] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['me'], queryFn: fetchMe })
  const dbUser    = data?.user
  const addresses = dbUser?.addresses || []

  const saveMutation = useMutation({
    mutationFn: (newAddresses) => updateProfile({ addresses: newAddresses }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setModal(null)
      setDelId(null)
    },
  })

  const openAdd  = ()  => { setForm(EMPTY_FORM); setModal('add') }
  const openEdit = (a) => {
    setForm({ type: a.type, label: a.label, line1: a.line1, line2: a.line2 || '', city: a.city, pincode: a.pincode })
    setModal(a)
  }

  const handleSave = () => {
    const updated = modal === 'add'
      ? [...addresses, { ...form, isDefault: addresses.length === 0 }]
      : addresses.map(a => (a._id || a.id) === (modal._id || modal.id) ? { ...a, ...form } : a)
    saveMutation.mutate(updated)
  }

  const handleSetDefault = (id) => {
    saveMutation.mutate(addresses.map(a => ({ ...a, isDefault: (a._id || a.id) === id })))
  }

  const handleDelete = (id) => {
    saveMutation.mutate(addresses.filter(a => (a._id || a.id) !== id))
  }

  const typeIcon = (type) => (TYPES.find(t => t.key === type) || TYPES[2]).icon
  const canSave  = form.line1.trim() && form.city.trim() && form.pincode.trim()

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Header */}
      <div className="bg-neutral-900 pt-8 pb-6">
        <div className="page-container flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">Saved addresses</h1>
            <p className="text-neutral-400 text-xs mt-0.5">
              {isLoading ? '…' : `${addresses.length} address${addresses.length !== 1 ? 'es' : ''} saved`}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="btn btn-brand btn-sm flex items-center gap-1.5"
          >
            <FiPlus size={13} /> Add new
          </button>
        </div>
      </div>

      <div className="page-container py-5 space-y-3 pb-10 max-w-[860px]">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5" aria-hidden="true">
              <div className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 skeleton rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 rounded w-1/3" />
                  <div className="skeleton h-3 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : addresses.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
              <FiMapPin size={22} className="text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-900 mb-1">No addresses saved</p>
            <p className="text-sm text-neutral-400 mb-5">Add an address to book services faster</p>
            <button onClick={openAdd} className="btn btn-primary btn-sm">
              Add first address
            </button>
          </div>
        ) : (
          addresses.map(a => {
            const id   = a._id || a.id
            const Icon = typeIcon(a.type)
            return (
              <div
                key={id}
                className={`bg-white rounded-xl border transition-all duration-150 p-5 ${
                  a.isDefault ? 'border-brand/30 bg-brand-50/30' : 'border-neutral-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    a.isDefault ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-neutral-900 text-sm">{a.label || a.type}</p>
                      {a.isDefault && (
                        <span className="badge badge-green">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600">{a.line1}</p>
                    {a.line2 && <p className="text-sm text-neutral-500">{a.line2}</p>}
                    <p className="text-sm text-neutral-500">{a.city} — {a.pincode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-50">
                  {!a.isDefault && (
                    <button
                      onClick={() => handleSetDefault(id)}
                      disabled={saveMutation.isPending}
                      className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-700 transition-colors disabled:opacity-50"
                    >
                      <FiCheck size={11} /> Set as default
                    </button>
                  )}
                  <div className="ml-auto flex gap-1.5">
                    <button
                      onClick={() => openEdit(a)}
                      aria-label="Edit address"
                      className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-150"
                    >
                      <FiEdit2 size={12} className="text-neutral-600" />
                    </button>
                    <button
                      onClick={() => setDelId(id)}
                      aria-label="Delete address"
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors duration-150"
                    >
                      <FiTrash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={modal === 'add' ? 'Add new address' : 'Edit address'}
        >
          <div className="modal-panel">
            <div className="modal-header">
              <h2 className="text-sm font-semibold text-neutral-900">
                {modal === 'add' ? 'Add new address' : 'Edit address'}
              </h2>
              <button
                onClick={() => setModal(null)}
                aria-label="Close"
                className="w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-colors"
              >
                <FiX size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <p className="label">Address type</p>
                <div className="flex gap-2" role="radiogroup">
                  {TYPES.map(t => (
                    <button
                      key={t.key}
                      type="button"
                      role="radio"
                      aria-checked={form.type === t.key}
                      onClick={() => setForm(f => ({ ...f, type: t.key, label: t.label }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                        form.type === t.key
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-100 text-neutral-500 hover:border-neutral-300'
                      }`}
                    >
                      <t.icon size={13} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {[
                { name: 'label',   label: 'Address label',              placeholder: 'e.g. My Home',              id: 'addr-label'   },
                { name: 'line1',   label: 'Address line 1 *',           placeholder: '4th floor, Iscon Elegance', id: 'addr-l1'      },
                { name: 'line2',   label: 'Address line 2 (optional)',   placeholder: 'Landmark, area',            id: 'addr-l2'      },
                { name: 'city',    label: 'City *',                     placeholder: 'Ahmedabad',                 id: 'addr-city'    },
                { name: 'pincode', label: 'Pincode *',                  placeholder: '380015',                    id: 'addr-pincode' },
              ].map(f => (
                <div key={f.name}>
                  <label htmlFor={f.id} className="label">{f.label}</label>
                  <input
                    id={f.id}
                    type="text"
                    value={form[f.name]}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="input"
                  />
                </div>
              ))}

              {saveMutation.isError && (
                <p className="text-xs text-red-500" role="alert">{saveMutation.error?.message || 'Failed to save'}</p>
              )}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setModal(null)} className="btn btn-outline flex-1">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!canSave || saveMutation.isPending}
                className="btn btn-primary flex-1 disabled:opacity-40"
              >
                {saveMutation.isPending
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : modal === 'add' ? 'Add address' : 'Save changes'}
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
          aria-label="Confirm address deletion"
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center mx-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1">Remove address?</h3>
            <p className="text-sm text-neutral-400 mb-6">This address will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="btn btn-outline flex-1">Cancel</button>
              <button
                onClick={() => handleDelete(delId)}
                disabled={saveMutation.isPending}
                className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Addresses
