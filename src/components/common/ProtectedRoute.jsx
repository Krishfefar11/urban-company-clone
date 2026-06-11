import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Spinner shown while auth state is loading
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
  </div>
)

// Protect any route — redirect to /login if not authenticated
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// Role-protected route — also checks user role
export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, role } = useAuth()
  const location = useLocation()

  if (loading) return <Loader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
