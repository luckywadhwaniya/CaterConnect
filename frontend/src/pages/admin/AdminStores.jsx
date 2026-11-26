import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  HiOutlineOfficeBuilding,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineBan,
  HiOutlineLocationMarker,
  HiOutlinePhone,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { adminGetStores, getStores, adminUpdateStoreStatus } from '../../api/stores'
import { formatDate } from '../../utils/helpers'

export const AdminStores = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: storesData, isLoading } = useQuery({
    queryKey: ['adminStores'],
    queryFn: async () => {
      try {
        const res = await adminGetStores()
        return res.data
      } catch {
        const res = await getStores()
        return res.data
      }
    },
  })

  const updateStoreStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => adminUpdateStoreStatus(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStores'] })
      toast.success('Store status updated!')
    },
    onError: () => {
      toast.error('Failed to update store status')
    },
  })

  const stores = Array.isArray(storesData) ? storesData : storesData?.results || []

  const filteredStores = stores.filter((s) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      s.store_name?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q)
    )
  })

  const handleToggleStoreActive = (store) => {
    const newStatus = !store.is_active
    const action = newStatus ? 'activate' : 'deactivate'
    if (window.confirm(`Are you sure you want to ${action} store "${store.store_name}"?`)) {
      updateStoreStatusMutation.mutate({ id: store.id, is_active: newStatus })
    }
  }

  return (
    <DashboardLayout sidebar={AdminSidebar}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores Directory & Verification</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage registered provision stores, fulfillment eligibility, and merchant contact records
          </p>
        </div>

        {/* Search */}
        <div className="flex justify-end">
          <div className="relative w-full sm:w-72">
            <HiOutlineSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by store name, city, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Stores Table */}
        <Card bodyClassName="p-0">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner text="Fetching merchant stores..." />
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={HiOutlineOfficeBuilding}
                title="No stores found"
                description="No grocery stores match your search query."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Store Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Owner / Contact</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Address / Location</th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Registered</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {filteredStores.map((s) => {
                    const isActive = s.is_active !== false
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/80">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-gray-900">{s.store_name}</p>
                          <p className="text-xs text-gray-500">{s.city || 'Gujarat'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-medium text-gray-800">
                            {s.user?.first_name ? `${s.user.first_name} ${s.user.last_name || ''}` : 'Partner User'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <HiOutlinePhone className="w-3.5 h-3.5" />
                            {s.phone || s.user?.phone || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                          <span className="flex items-center gap-1">
                            <HiOutlineLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate">{s.address || '-'}</span>
                          </span>
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
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                          {formatDate(s.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStoreActive(s)}
                            disabled={updateStoreStatusMutation.isPending}
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

export default AdminStores
