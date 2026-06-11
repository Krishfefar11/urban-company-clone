import { useNavigate } from 'react-router-dom'
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi'

const QUICK_LINKS = [
  { label: 'Home Cleaning',  path: '/services/cleaning'  },
  { label: 'AC Repair',      path: '/services/ac-repair' },
  { label: 'Beauty & Salon', path: '/services/beauty'    },
  { label: 'Plumbing',       path: '/services/plumbing'  },
]

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md w-full">
        {/* Big 404 */}
        <div className="relative mb-6 select-none">
          <p className="text-[130px] sm:text-[160px] font-bold text-neutral-900 leading-none tracking-tighter">
            4<span className="text-brand">0</span>4
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center shadow-hover mt-4">
              <FiSearch size={28} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-neutral-900 mb-2">Page not found</h1>
        <p className="text-sm text-neutral-400 leading-relaxed mb-8">
          The page you're looking for doesn't exist or may have been moved. Try one of the links below.
        </p>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {QUICK_LINKS.map(l => (
            <button key={l.label} onClick={() => navigate(l.path)}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-200 transition-colors">
              {l.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-outline flex-1 flex items-center justify-center gap-2">
            <FiArrowLeft size={15} /> Go back
          </button>
          <button onClick={() => navigate('/')} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
            <FiHome size={15} /> Back to home
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
