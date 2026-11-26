import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute'

// Public Pages
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Catering Pages
import CateringDashboard from './pages/catering/CateringDashboard'
import CreateGroceryList from './pages/catering/CreateGroceryList'
import CateringOrders from './pages/catering/CateringOrders'
import OrderDetail from './pages/catering/OrderDetail'
import CateringProfile from './pages/catering/CateringProfile'

// Store Pages
import StoreDashboard from './pages/store/StoreDashboard'
import StoreOrders from './pages/store/StoreOrders'
import StoreOrderDetail from './pages/store/StoreOrderDetail'
import StoreProfile from './pages/store/StoreProfile'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminStores from './pages/admin/AdminStores'
import AdminGroceryItems from './pages/admin/AdminGroceryItems'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Catering Protected Routes */}
      <Route
        path="/catering/dashboard"
        element={
          <ProtectedRoute allowedRoles={['catering']}>
            <CateringDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catering/create-list"
        element={
          <ProtectedRoute allowedRoles={['catering']}>
            <CreateGroceryList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catering/orders"
        element={
          <ProtectedRoute allowedRoles={['catering']}>
            <CateringOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catering/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['catering']}>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catering/profile"
        element={
          <ProtectedRoute allowedRoles={['catering']}>
            <CateringProfile />
          </ProtectedRoute>
        }
      />

      {/* Store Owner Protected Routes */}
      <Route
        path="/store/dashboard"
        element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <StoreDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/orders"
        element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <StoreOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <StoreOrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/profile"
        element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <StoreProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminStores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grocery-items"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminGroceryItems />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
