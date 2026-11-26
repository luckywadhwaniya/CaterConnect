import React, { useState } from 'react'
import { HiOutlineMenuAlt2 } from 'react-icons/hi'
import useAuthStore from '../../store/authStore'

export const DashboardLayout = ({ children, sidebar: SidebarComponent }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {SidebarComponent && (
        <SidebarComponent
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar for Mobile Toggle & User greeting */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label="Open sidebar"
            >
              <HiOutlineMenuAlt2 className="w-6 h-6" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-800 tracking-tight">
              CaterConnect
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-right">
              <span className="hidden sm:inline-block text-sm font-medium text-gray-700">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
