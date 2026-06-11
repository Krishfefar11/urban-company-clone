import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiArrowUpRight, FiArrowDownLeft, FiTag, FiPlus, FiGift, FiAlertCircle } from 'react-icons/fi'
import { fetchWalletBalance, fetchWalletTransactions, applyPromoCode } from '../../api/wallet'

const TABS = ['Transactions', 'Offers']

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const txIcon = (desc = '') => {
  const d = desc.toLowerCase()
  if (d.includes('clean'))   return '🧹'
  if (d.includes('ac'))      return '❄️'
  if (d.includes('massage') || d.includes('spa')) return '💆'
  if (d.includes('referral') || d.includes('bonus')) return '🎁'
  if (d.includes('promo') || d.includes('credit')) return '🏷️'
  if (d.includes('kitchen')) return '🍳'
  return '💳'
}

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3.5" aria-hidden="true">
    <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="skeleton h-3.5 rounded w-2/3" />
      <div className="skeleton h-3 rounded w-1/3" />
    </div>
    <div className="skeleton h-4 rounded w-14" />
  </div>
)

const Wallet = () => {
  const [tab,       setTab]       = useState('Transactions')
  const [promoCode, setPromoCode] = useState('')
  const [promoMsg,  setPromoMsg]  = useState(null)
  const [txPage,    setTxPage]    = useState(1)
  const qc = useQueryClient()

  const { data: balData, isLoading: balLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn:  fetchWalletBalance,
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions', { page: txPage }],
    queryFn:  () => fetchWalletTransactions({ page: txPage, limit: 10 }),
    keepPreviousData: true,
  })

  const balance  = balData?.balance     || 0
  const txList   = txData?.transactions || []
  const txTotal  = txData?.total        || 0
  const txPages  = txData?.totalPages   || 1

  const promoMut = useMutation({
    mutationFn: () => applyPromoCode(promoCode, 1000),
    onSuccess: (data) => {
      setPromoMsg({ type: 'success', text: `"${data.code}" applied — you save ₹${data.discountAmount}` })
      setPromoCode('')
    },
    onError: (err) => {
      setPromoMsg({ type: 'error', text: err.message })
    },
  })

  return (
    <div className="bg-neutral-50 min-h-screen" role="main">

      {/* Header */}
      <div className="bg-neutral-900 pt-8 pb-20">
        <div className="page-container">
          <h1 className="text-white font-bold text-lg mb-6">Wallet</h1>

          {/* Balance card */}
          <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
            <p className="text-neutral-400 text-xs font-medium mb-1">Available balance</p>
            {balLoading ? (
              <div className="skeleton h-10 rounded w-28 mb-4" />
            ) : (
              <p className="text-white font-bold text-4xl mb-4" aria-live="polite">
                ₹{balance.toLocaleString('en-IN')}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-left transition-colors duration-150">
                <div className="flex items-center gap-2 mb-1">
                  <FiPlus size={13} className="text-brand" />
                  <p className="text-white text-xs font-semibold">Add money</p>
                </div>
                <p className="text-neutral-400 text-xs">Top up your wallet</p>
              </button>
              <button className="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-left transition-colors duration-150">
                <div className="flex items-center gap-2 mb-1">
                  <FiGift size={13} className="text-amber-400" />
                  <p className="text-white text-xs font-semibold">Refer &amp; earn</p>
                </div>
                <p className="text-neutral-400 text-xs">Get ₹100 per referral</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container -mt-12 pb-10 space-y-3 max-w-[860px]">

        {/* Promo code card */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-neutral-900 flex items-center gap-2 mb-3">
            <FiTag size={14} className="text-brand" /> Apply promo code
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="promo-input" className="sr-only">Promo code</label>
              <input
                id="promo-input"
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoMsg(null) }}
                onKeyDown={e => e.key === 'Enter' && promoCode.trim() && promoMut.mutate()}
                placeholder="e.g. URBAN50"
                autoComplete="off"
                className="input font-mono tracking-widest text-sm uppercase"
              />
            </div>
            <button
              onClick={() => promoMut.mutate()}
              disabled={promoMut.isPending || !promoCode.trim()}
              className="btn btn-primary disabled:opacity-50 flex-shrink-0"
            >
              {promoMut.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Apply'}
            </button>
          </div>
          {promoMsg && (
            <p
              className={`text-xs mt-2.5 flex items-center gap-1.5 ${promoMsg.type === 'success' ? 'text-brand-700' : 'text-red-500'}`}
              role="status"
            >
              {promoMsg.type === 'success' ? '✓' : <FiAlertCircle size={11} />}
              {promoMsg.text}
            </p>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-neutral-100 bg-white rounded-t-xl shadow-sm px-4" role="tablist">
          {TABS.map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`py-3.5 text-sm font-semibold mr-6 border-b-2 transition-all duration-150 ${
                tab === t
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Transactions' && (
          <div className="bg-white rounded-b-xl border border-neutral-100 shadow-sm divide-y divide-neutral-50 -mt-0.5">
            {txLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : txList.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-neutral-500">No transactions yet</p>
                <p className="text-xs text-neutral-400 mt-1">Your wallet activity will appear here.</p>
              </div>
            ) : (
              txList.map(t => (
                <div key={t._id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-lg flex-shrink-0" aria-hidden="true">
                    {txIcon(t.description)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{t.description}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDate(t.createdAt)}</p>
                  </div>
                  <div className={`flex items-center gap-1 font-bold text-sm ${t.type === 'credit' ? 'text-brand' : 'text-neutral-900'}`}>
                    {t.type === 'credit'
                      ? <FiArrowDownLeft size={13} />
                      : <FiArrowUpRight size={13} className="text-neutral-400" />}
                    <span>{t.type === 'credit' ? '+' : '−'}₹{t.amount}</span>
                  </div>
                </div>
              ))
            )}

            {txPages > 1 && (
              <div className="flex items-center justify-center gap-3 p-4" role="navigation" aria-label="Pagination">
                <button
                  onClick={() => setTxPage(p => Math.max(1, p - 1))}
                  disabled={txPage === 1}
                  className="btn btn-outline btn-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-500">Page {txPage} of {txPages}</span>
                <button
                  onClick={() => setTxPage(p => Math.min(txPages, p + 1))}
                  disabled={txPage === txPages}
                  className="btn btn-outline btn-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'Offers' && (
          <div className="bg-white rounded-b-xl border border-neutral-100 shadow-sm p-8 text-center -mt-0.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <FiGift size={20} className="text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-neutral-700 mb-1">No offers right now</p>
            <p className="text-xs text-neutral-400">
              Active offers and promo codes will appear here.
              <br />Enter a code manually above to apply it.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wallet
