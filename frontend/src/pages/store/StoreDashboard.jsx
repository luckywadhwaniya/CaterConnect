import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  HiOutlineInboxIn,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlineDocumentDownload,
  HiOutlineCurrencyRupee,
  HiOutlineReceiptTax,
  HiOutlineChartBar,
  HiOutlineShoppingCart,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StoreSidebar from '../../components/layout/StoreSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import useAuthStore from '../../store/authStore'
import { useOrders, useDownloadPDF } from '../../hooks/useOrders'
import { getStoreStats } from '../../api/orders'
import { formatDate, formatTime } from '../../utils/helpers'

export const StoreDashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: ordersData, isLoading } = useOrders()
  const downloadPDFMutation = useDownloadPDF()

  // Use SERVER-SIDE stats API for accurate revenue across ALL orders (not just current page)
  const { data: statsData } = useQuery({
    queryKey: ['store-stats'],
    queryFn: async () => {
      const res = await getStoreStats()
      return res.data
    },
  })

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.results || []

  // Server-side stats (accurate even with pagination / many orders)
  const totalRevenue = statsData?.total_revenue ?? 0
  const billedCount = statsData?.billed_orders_count ?? 0
  const totalOrders = statsData?.total_orders ?? orders.length
  const pendingCount = statsData?.pending_orders ?? orders.filter((o) => o.status === 'pending').length
  const acceptedCount = statsData?.accepted_orders ?? orders.filter((o) => o.status === 'accepted').length
  const preparingCount = statsData?.preparing_orders ?? orders.filter((o) => o.status === 'preparing').length
  const readyCount = statsData?.ready_orders ?? orders.filter((o) => o.status === 'ready').length
  const completedCount = statsData?.completed_orders ?? orders.filter((o) => o.status === 'completed').length
  const avgOrderValue = statsData?.average_order_value ?? 0

  // Today's orders from the local list (for the "Today" card)
  const today = new Date().toISOString().slice(0, 10)
  const todaysOrders = orders.filter((o) => o.created_at?.slice(0, 10) === today)

  const recentOrders = orders.slice(0, 8)

  return (
    <DashboardLayout sidebar={StoreSidebar}>
      <div className="space-y-5">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-emerald-950 to-emerald-900 rounded-2xl p-5 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-300 text-xs font-semibold mb-2">
              <HiOutlineReceiptTax className="w-4 h-4" /> Merchant Invoicing & Fulfillment
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate">
              {user?.store_profile?.store_name || user?.store?.store_name || 'Wadhwaniya Provision Store'}
            </h1>
            <p className="mt-1 text-emerald-100 text-xs sm:text-sm max-w-xl">
              Fulfillment Command Center. Enter ingredient rates, finalize bills, and notify caterers when requisitions are ready for pickup.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              onClick={() => navigate('/store/orders?tab=pending')}
              variant="secondary"
              size="md"
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-md shadow-emerald-950/20 text-xs sm:text-sm"
            >
              Review New ({pendingCount})
            </Button>
          </div>
        </div>

        {/* Revenue & Financial Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-0 shadow-md col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-100">Total Revenue</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-black mt-1 truncate">
                  ₹{Number(totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] sm:text-[11px] text-emerald-200 mt-1">{billedCount} Billed Orders</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0">
                ₹
              </div>
            </div>
          </Card>

          {/* Avg Order Value */}
          <Card className="hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HiOutlineTrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Avg Bill Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 truncate">
                  ₹{Number(avgOrderValue).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </Card>

          {/* Total Orders */}
          <Card className="hover:border-blue-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <HiOutlineShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">{totalOrders}</p>
              </div>
            </div>
          </Card>

          {/* Today's Orders */}
          <Card className="hover:border-purple-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <HiOutlineCalendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Today's Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">{todaysOrders.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Status Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card
            className="cursor-pointer hover:border-yellow-300 transition-all"
            onClick={() => navigate('/store/orders?tab=pending')}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                <HiOutlineInboxIn className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">New</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{pendingCount}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:border-blue-300 transition-all"
            onClick={() => navigate('/store/orders?tab=accepted')}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <HiOutlineCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Accepted</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{acceptedCount}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:border-orange-300 transition-all"
            onClick={() => navigate('/store/orders?tab=preparing')}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <HiOutlineClock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Packing</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{preparingCount}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:border-teal-300 transition-all"
            onClick={() => navigate('/store/orders?tab=ready')}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <HiOutlineTruck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Pickup</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{readyCount}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:border-emerald-300 transition-all col-span-2 sm:col-span-1"
            onClick={() => navigate('/store/orders?tab=completed')}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HiOutlineChartBar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{completedCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Incoming Orders Table */}
        <Card
          title="Recent Orders & Billing Status"
          subtitle="Orders placed by partner catering businesses"
          action={
            <Link
              to="/store/orders"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View all &rarr;
            </Link>
          }
        >
          {isLoading ? (
            <LoadingSpinner text="Fetching incoming orders..." />
          ) : recentOrders.length === 0 ? (
            <EmptyState
              title="No incoming orders"
              description="When catering businesses place orders for your store, they will appear here."
            />
          ) : (
            <>
              {/* Desktop table (hidden on small screens) */}
              <div className="hidden md:block overflow-x-auto -mx-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/70">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Caterer
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Target Delivery
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Bill Total
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {recentOrders.map((order) => {
                      const eventName = order.event_name || order.event?.event_name || 'Event Order'
                      const delivDate = order.delivery_date || order.event?.delivery_date
                      const delivTime = order.delivery_time || order.event?.delivery_time
                      const catererName = order.catering_name || order.catering_user_name || order.user?.first_name || 'Caterer'
                      const totalAmt = parseFloat(order.total_amount) || 0

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap font-bold text-emerald-700">
                            #{order.order_number || order.id}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                            {catererName}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                            {eventName}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-600">
                            {formatDate(delivDate)} {delivTime ? `@ ${formatTime(delivTime)}` : ''}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                            {order.is_billed || totalAmt > 0 ? (
                              <span className="text-emerald-700">
                                ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded font-medium border border-yellow-200">
                                Bill Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                            <Badge status={order.status} />
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button
                              onClick={() => navigate(`/store/orders/${order.id}`)}
                              className="inline-flex items-center text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-2.5 py-1.5 rounded-lg shadow-sm"
                              title="Open Order and Make Bill"
                            >
                              <HiOutlineReceiptTax className="w-4 h-4 mr-1" />
                              {order.is_billed ? 'View Bill' : 'Make Bill'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list (visible on small screens) */}
              <div className="md:hidden space-y-3 -mx-2">
                {recentOrders.map((order) => {
                  const eventName = order.event_name || order.event?.event_name || 'Event Order'
                  const delivDate = order.delivery_date || order.event?.delivery_date
                  const delivTime = order.delivery_time || order.event?.delivery_time
                  const catererName = order.catering_name || order.catering_user_name || order.user?.first_name || 'Caterer'
                  const totalAmt = parseFloat(order.total_amount) || 0

                  return (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/store/orders/${order.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-emerald-700 text-sm">
                          #{order.order_number || order.id}
                        </span>
                        <Badge status={order.status} />
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Caterer</span>
                          <span className="font-semibold text-gray-900 text-right">{catererName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event</span>
                          <span className="font-medium text-gray-700 text-right truncate ml-4">{eventName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery</span>
                          <span className="text-gray-600 text-right">
                            {formatDate(delivDate)} {delivTime ? `@ ${formatTime(delivTime)}` : ''}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-100">
                          <span className="text-gray-500">Bill Total</span>
                          {order.is_billed || totalAmt > 0 ? (
                            <span className="font-bold text-emerald-700">
                              ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded font-medium border border-yellow-200">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/store/orders/${order.id}`) }}
                          className="flex-1 inline-flex items-center justify-center text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-3 py-2 rounded-lg shadow-sm"
                        >
                          <HiOutlineReceiptTax className="w-4 h-4 mr-1" />
                          {order.is_billed ? 'View Bill' : 'Make Bill'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default StoreDashboard
