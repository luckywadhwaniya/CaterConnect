import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their respective dashboard
    if (user?.role === 'catering') return <Navigate to="/catering/dashboard" replace />
    if (user?.role === 'store_owner') return <Navigate to="/store/dashboard" replace />
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated) {
    if (user?.role === 'catering') return <Navigate to="/catering/dashboard" replace />
    if (user?.role === 'store_owner') return <Navigate to="/store/dashboard" replace />
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  }

  return children
}
