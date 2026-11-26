import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineBan,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { getUsers, updateUserStatus } from '../../api/auth'
import { formatDate } from '../../utils/helpers'

export const AdminUsers = () => {
  const queryClient = useQueryClient()
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers', roleFilter],
    queryFn: async () => {
      const params = roleFilter !== 'all' ? { role: roleFilter } : {}
      const res = await getUsers(params)
      return res.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => updateUserStatus(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success('User status updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update user status')
    },
  })

  const users = Array.isArray(usersData) ? usersData : usersData?.results || []

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.catering_profile?.business_name?.toLowerCase().includes(q) ||
      u.store_profile?.store_name?.toLowerCase().includes(q)
    )
  })

  const handleToggleActive = (user) => {
    const newStatus = !user.is_active
    const action = newStatus ? 'activate' : 'deactivate'
    if (window.confirm(`Are you sure you want to ${action} user "${user.email}"?`)) {
      updateStatusMutation.mutate({ id: user.id, is_active: newStatus })
    }
  }

  return (
    <DashboardLayout sidebar={AdminSidebar}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage catering businesses, store partners, and administrative staff accounts
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex items-center gap-2">
            {['all', 'catering', 'store_owner', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {r === 'store_owner' ? 'Store Owners' : r}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <HiOutlineSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* User Table */}
        <Card bodyClassName="p-0">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner text="Fetching platform users..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={HiOutlineUsers}
                title="No users found"
                description="No users matched your filter criteria."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Organization</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {filteredUsers.map((u) => {
                    const orgName =
                      u.role === 'catering'
                        ? u.catering_profile?.business_name || '-'
                        : u.role === 'store_owner'
                        ? u.store_profile?.store_name || '-'
                        : 'System Staff'

                    const isActive = u.is_active !== false

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/80">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">
                            {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                          </p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'store_owner'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role === 'store_owner' ? 'Store Owner' : u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                          {orgName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {u.phone || u.catering_profile?.phone || u.store_profile?.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">
                          {formatDate(u.date_joined || u.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            disabled={updateStatusMutation.isPending}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                              isActive
                                ? 'text-red-700 bg-red-50 hover:bg-red-100'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <HiOutlineBan className="w-3.5 h-3.5" /> Deactivate
                              </>
                            ) : (
                              <>
                                <HiOutlineCheck className="w-3.5 h-3.5" /> Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminUsers
