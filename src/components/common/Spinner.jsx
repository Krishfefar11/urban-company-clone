const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' }
  return (
    <div className={`${sizes[size] || sizes.md} border-neutral-200 border-t-gray-900 rounded-full animate-spin ${className}`} />
  )
}

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-neutral-100 border-t-brand rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-neutral-400 font-medium">Loading…</p>
    </div>
  </div>
)

export const ButtonSpinner = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
)

export default Spinner
