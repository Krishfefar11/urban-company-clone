import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { ToastProvider } from './Toast'

const BARE_PATHS = ['/login', '/signup', '/pro/register']

const MainLayout = () => {
  const { pathname } = useLocation()
  const bare = BARE_PATHS.some(p => pathname.startsWith(p))

  return (
    <ToastProvider>
      {bare ? (
        <Outlet />
      ) : (
        <div className="flex flex-col min-h-screen bg-white">
          <Navbar />
          <main className="flex-1 pb-16 lg:pb-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <div className="hidden lg:block">
            <Footer />
          </div>
          <BottomNav />
        </div>
      )}
    </ToastProvider>
  )
}

export default MainLayout
