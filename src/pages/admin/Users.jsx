import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiSearch, FiMoreVertical, FiUserX, FiUserCheck, FiDownload, FiX } from 'react-icons/fi'
import { fetchAllUsers, updateUserStatus } from '../../api/users.js'

const AdminUsers = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page,   setPage]   = useState(1)
  const [menu,   setMenu]   = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', page, search, filter],
    queryFn:  () => fetchAllUsers({ page, limit: 20, search: search || undefined }),
    keepPreviousData: true,
  })

  const users      = data?.users || []
  const total      = data?.total || 0
  const totalPages = data?.totalPages || 1

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setMenu(null)
    },
  })

  const filtered = filter === 'all' ? users
    : users.filter(u => (filter === 'active' ? u.isActive !== false : u.isActive === false))

  const exportCSV = () => {
    const header = 'Name,Email,Phone,City,Role,Status'
    const rows   = filtered.map(u =>
      `"${u.name}","${u.email}","${u.phone || ''}","${u.city || ''}",${u.role},${u.isActive === false ? 'blocked' : 'active'}`
    )
    const csv    = [header, ...rows].join('\n')
    const link   = document.createElement('a')
    link.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    link.download = 'users.csv'
    link.click()
  }

  return (
    <div className="bg-neutral-50 min-h-screen">

      {/* Top bar */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-neutral-900 text-xl">Users</h1>
            <p className="text-xs text-neutral-400 mt-0.5">{total.toLocaleString()} total</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 text-xs font-medium text-neutral-600 bg-neutral-100 px-4 py-2 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            <FiDownload size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name or email…"
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
          <div className="flex gap-1 bg-white border border-neutral-200 p-1 rounded-xl">
            {['all', 'active', 'blocked'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4" aria-hidden="true">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500 text-sm">Failed to load users</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="border-b border-neutral-100">
                  <tr>
                    {['User', 'Contact', 'City', 'Role', 'Joined', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filtered.map(u => {
                    const isBlocked = u.isActive === false
                    return (
                      <tr key={u._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">{u.name}</p>
                              <p className="text-xs text-neutral-400 font-mono">{u._id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-neutral-600">{u.email}</p>
                          <p className="text-xs text-neutral-400">{u.phone || '—'}</p>
                        </td>
                        <td className="px-5 py-4 text-neutral-500">{u.city || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="badge badge-gray capitalize">{u.role}</span>
                        </td>
                        <td className="px-5 py-4 text-neutral-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className={isBlocked ? 'badge badge-red' : 'badge badge-green'}>
                            {isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setMenu(menu === u._id ? null : u._id)}
                              aria-label="User actions"
                              className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
                            >
                              <FiMoreVertical size={15} className="text-neutral-400" />
                            </button>
                            {menu === u._id && (
                              <div className="dropdown right-0 top-9 min-w-36">
                                <button
                                  onClick={() => toggleMutation.mutate({ id: u._id, isActive: isBlocked })}
                                  disabled={toggleMutation.isPending}
                                  className={`dropdown-item ${isBlocked ? 'text-brand' : 'text-red-600'}`}
                                >
                                  {isBlocked
                                    ? <><FiUserCheck size={13} /> Unblock</>
                                    : <><FiUserX size={13} /> Block user</>
                                  }
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-neutral-400">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between">
              <p className="text-xs text-neutral-400">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-outline btn-sm disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
