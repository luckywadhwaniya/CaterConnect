import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineInboxIn,
  HiOutlineClock,
  HiOutlineClipboardCheck,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineShoppingBag,
} from 'react-icons/hi'
import useAuthStore from '../../store/authStore'

export const StoreSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/store/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/store/orders?tab=pending', label: 'New Orders', icon: HiOutlineInboxIn },
    { to: '/store/orders?tab=active', label: 'Active Orders', icon: HiOutlineClock },
    { to: '/store/orders?tab=history', label: 'Order History', icon: HiOutlineClipboardCheck },
    { to: '/store/profile', label: 'Store Profile', icon: HiOutlineUser },
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <HiOutlineShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">CaterConnect</span>
                <span className="block text-[10px] uppercase font-semibold text-emerald-600 tracking-wider">Store Partner</span>
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
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-500'
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

        {/* Store Info & Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="truncate mr-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'Store Owner'}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.store_profile?.store_name || 'Grocery Partner'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 rounded-lg transition-colors"
          >
            <HiOutlineLogout className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default StoreSidebar
