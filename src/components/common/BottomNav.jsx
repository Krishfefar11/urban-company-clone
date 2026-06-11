import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiClock, FiCreditCard, FiUser } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const TABS = [
  { to: '/',            icon: FiHome,       label: 'Home'     },
  { to: '/my-bookings', icon: FiClock,      label: 'Bookings' },
  { to: '/wallet',      icon: FiCreditCard, label: 'Wallet'   },
  { to: '/profile',     icon: FiUser,       label: 'Profile'  },
]

const BottomNav = () => {
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()

  const isActive = (to) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[200] lg:hidden bg-white border-t border-neutral-100"
      style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.06)' }}
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 h-16">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          const href = (!isAuthenticated && to !== '/') ? `/login?redirect=${to}` : to
          return (
            <Link
              key={to}
              to={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-neutral-900' : 'text-neutral-400'}
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neutral-900" />
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
