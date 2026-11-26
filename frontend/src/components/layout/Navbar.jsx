import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineSparkles, HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import Button from '../ui/Button'
import useAuthStore from '../../store/authStore'

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const getDashboardLink = () => {
    if (user?.role === 'catering') return '/catering/dashboard'
    if (user?.role === 'store_owner') return '/store/dashboard'
    if (user?.role === 'admin') return '/admin/dashboard'
    return '/login'
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">CaterConnect</span>
              <span className="hidden sm:block text-[11px] font-medium text-emerald-600 -mt-1">
                Catering Grocery Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Benefits
            </a>
          </div>

          {/* Desktop Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate(getDashboardLink())} variant="primary" size="sm">
                  Go to Dashboard
                </Button>
                <Button onClick={logout} variant="outline" size="sm">
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Features
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Benefits
            </a>
          </div>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button onClick={() => { setMobileMenuOpen(false); navigate(getDashboardLink()); }} variant="primary" className="w-full">
                  Dashboard
                </Button>
                <Button onClick={() => { logout(); setMobileMenuOpen(false); }} variant="outline" className="w-full">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
