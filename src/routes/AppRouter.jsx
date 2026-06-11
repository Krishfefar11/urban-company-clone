import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ProtectedRoute, RoleRoute } from '../components/common/ProtectedRoute'
import MainLayout from '../components/common/MainLayout'

import Home               from '../pages/user/Home'
import Services           from '../pages/user/Services'
import ServiceDetail      from '../pages/user/ServiceDetail'
import Booking            from '../pages/user/Booking'
import BookingConfirmation from '../pages/user/BookingConfirmation'
import Login              from '../pages/user/Login'
import Signup             from '../pages/user/Signup'
import Profile            from '../pages/user/Profile'
import BookingHistory     from '../pages/user/BookingHistory'
import Wallet             from '../pages/user/Wallet'
import Addresses         from '../pages/user/Addresses'
import Wishlist          from '../pages/user/Wishlist'
import MyReviews         from '../pages/user/MyReviews'
import NotFound           from '../pages/NotFound'

import ProDashboard  from '../pages/professional/Dashboard'
import ProBookings   from '../pages/professional/Bookings'
import ProEarnings   from '../pages/professional/Earnings'
import ProProfile    from '../pages/professional/Profile'
import ProRegister   from '../pages/professional/Register'

import VerifyPhone        from '../pages/auth/VerifyPhone'

import AdminDashboard     from '../pages/admin/Dashboard'
import AdminUsers         from '../pages/admin/Users'
import AdminProfessionals from '../pages/admin/Professionals'
import AdminBookings      from '../pages/admin/Bookings'
import AdminServices      from '../pages/admin/Services'

const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>

        {/* ── Public routes ── */}
        <Route element={<MainLayout />}>
          <Route path="/"                   element={<Home />} />
          <Route path="/services"           element={<Services />} />
          <Route path="/services/:category" element={<Services />} />
          <Route path="/service/:id"        element={<ServiceDetail />} />
          <Route path="/login"              element={<Login />} />
          <Route path="/signup"             element={<Signup />} />
        </Route>

        {/* ── Protected user routes ── */}
        <Route element={<MainLayout />}>
          <Route path="/booking/:serviceId"              element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/booking/confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/profile"                         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-bookings"                     element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
          <Route path="/wallet"      element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/addresses"   element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/wishlist"       element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/reviews"        element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
          <Route path="/verify-phone"   element={<ProtectedRoute><VerifyPhone /></ProtectedRoute>} />
        </Route>

        {/* ── Professional routes ── */}
        <Route path="/pro/register"  element={<ProRegister />} />
        <Route path="/pro/dashboard" element={<RoleRoute allowedRoles={['professional','admin']}><ProDashboard /></RoleRoute>} />
        <Route path="/pro/bookings"  element={<RoleRoute allowedRoles={['professional','admin']}><ProBookings /></RoleRoute>} />
        <Route path="/pro/earnings"  element={<RoleRoute allowedRoles={['professional','admin']}><ProEarnings /></RoleRoute>} />
        <Route path="/pro/profile"   element={<RoleRoute allowedRoles={['professional','admin']}><ProProfile /></RoleRoute>} />

        {/* ── Admin routes ── */}
        <Route path="/admin/dashboard"     element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="/admin/users"         element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>} />
        <Route path="/admin/professionals" element={<RoleRoute allowedRoles={['admin']}><AdminProfessionals /></RoleRoute>} />
        <Route path="/admin/bookings"      element={<RoleRoute allowedRoles={['admin']}><AdminBookings /></RoleRoute>} />
        <Route path="/admin/services"      element={<RoleRoute allowedRoles={['admin']}><AdminServices /></RoleRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default AppRouter
