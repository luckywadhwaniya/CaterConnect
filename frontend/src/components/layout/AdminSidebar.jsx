import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineCollection,
  HiOutlineLogout,
  HiOutlineShieldCheck,
} from 'react-icons/hi'
import useAuthStore from '../../store/authStore'

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    { to: '/admin/users', label: 'User Directory', icon: HiOutlineUsers },
    { to: '/admin/stores', label: 'Stores Management', icon: HiOutlineOfficeBuilding },
    { to: '/admin/grocery-items', label: 'Grocery Catalog', icon: HiOutlineCollection },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/50">
                <HiOutlineShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">CaterConnect</span>
                <span className="block text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">Super Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span>{link.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="truncate mr-2">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'Administrator'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || 'System Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/40 rounded-lg transition-colors border border-red-900/50"
          >
            <HiOutlineLogout className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
