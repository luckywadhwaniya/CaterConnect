import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineCollection,
  HiOutlineEye,
  HiOutlineShieldCheck,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { getUsers } from '../../api/auth'
import { adminGetStores, getStores } from '../../api/stores'
import { useOrders } from '../../hooks/useOrders'
import { useGroceryItems } from '../../hooks/useGrocery'
import { formatDate } from '../../utils/helpers'

export const AdminDashboard = () => {
  const navigate = useNavigate()

  // Queries
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      try {
        const res = await getUsers()
        return res.data
      } catch {
        return []
      }
    },
  })

  const { data: storesData, isLoading: loadingStores } = useQuery({
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

  const { data: ordersData, isLoading: loadingOrders } = useOrders()
  const { data: groceryData, isLoading: loadingCatalog } = useGroceryItems()

  const users = Array.isArray(usersData) ? usersData : usersData?.results || []
  const stores = Array.isArray(storesData) ? storesData : storesData?.results || []
  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.results || []
  const items = Array.isArray(groceryData) ? groceryData : groceryData?.results || []

  const recentOrders = orders.slice(0, 5)

  return (
    <DashboardLayout sidebar={AdminSidebar}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
              <HiOutlineShieldCheck className="w-4 h-4" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Overview</h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Oversee registered catering users, merchant stores, master grocery catalog, and orders.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/admin/grocery-items')}
              variant="primary"
              className="bg-emerald-500 hover:bg-emerald-600 font-bold"
            >
              Manage Catalog
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card
            className="cursor-pointer hover:border-emerald-500 transition-all"
            onClick={() => navigate('/admin/users')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HiOutlineUsers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:border-emerald-500 transition-all"
            onClick={() => navigate('/admin/stores')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HiOutlineOfficeBuilding className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Stores</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stores.length}</p>
              </div>
            </div>
          </Card>

          <Card className="hover:border-emerald-500 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <HiOutlineClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Platform Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{orders.length}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:border-emerald-500 transition-all"
            onClick={() => navigate('/admin/grocery-items')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <HiOutlineCollection className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Catalog Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{items.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders Overview */}
        <Card
          title="Recent Platform Orders"
          subtitle="Orders created across all caterers and store partners"
        >
          {loadingOrders ? (
            <LoadingSpinner text="Fetching platform orders..." />
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No orders created in the platform yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Caterer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Store</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Delivery Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-emerald-700">
                        #{order.order_number || order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {order.catering_name || order.user?.first_name || 'Caterer'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.store_name || order.store?.store_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {formatDate(order.delivery_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
