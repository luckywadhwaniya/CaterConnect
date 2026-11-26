import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineDocumentDownload,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CateringSidebar from '../../components/layout/CateringSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import useAuthStore from '../../store/authStore'
import { useOrders, useDownloadPDF } from '../../hooks/useOrders'
import { formatDate } from '../../utils/helpers'

export const CateringDashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: orders, isLoading } = useOrders()
  const downloadPDFMutation = useDownloadPDF()

  const orderList = Array.isArray(orders) ? orders : orders?.results || []

  // Compute Stats
  const totalOrders = orderList.length
  const pendingOrders = orderList.filter((o) => o.status === 'pending').length
  const completedOrders = orderList.filter((o) => o.status === 'completed').length
  const upcomingEvents = orderList.filter((o) => {
    if (!o.event_date) return false
    return new Date(o.event_date) >= new Date()
  }).length

  const recentOrders = orderList.slice(0, 5)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <DashboardLayout sidebar={CateringSidebar}>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-2xl p-5 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {getGreeting()},{' '}
              {user?.first_name ? `${user.first_name}!` : user?.username || 'Caterer!'}
            </h1>
            <p className="mt-1 text-emerald-100 text-xs sm:text-sm max-w-xl">
              Track event requirements, organize grocery lists, and collaborate with your store partners in real time.
            </p>
          </div>
          <div>
            <Button
              onClick={() => navigate('/catering/create-list')}
              variant="secondary"
              size="md"
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-md shadow-emerald-950/20 text-xs sm:text-sm w-full sm:w-auto"
              icon={HiOutlinePlus}
            >
              Create Grocery List
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="hover:border-emerald-200 transition-all p-3 sm:p-5">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <HiOutlineClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">{totalOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="hover:border-emerald-200 transition-all p-3 sm:p-5">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                <HiOutlineClock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">{pendingOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="hover:border-emerald-200 transition-all p-3 sm:p-5">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HiOutlineCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">{completedOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="hover:border-emerald-200 transition-all p-3 sm:p-5">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <HiOutlineCalendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Upcoming</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">{upcomingEvents}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card
          title="Recent Orders"
          subtitle="Latest event grocery lists and their current fulfillment status"
          action={
            <Link
              to="/catering/orders"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View all &rarr;
            </Link>
          }
        >
          {isLoading ? (
            <LoadingSpinner text="Fetching your orders..." />
          ) : recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Get started by building your first digital grocery list for an upcoming event."
              actionText="Create Grocery List"
              onAction={() => navigate('/catering/create-list')}
              actionIcon={HiOutlinePlus}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto -mx-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/70">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Event Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Store Partner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Event Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Bill Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {recentOrders.map((order) => {
                      const eventName = order.event_name || order.event?.event_name || 'Catering Function'
                      const eventDate = order.event_date || order.event?.event_date
                      const totalAmt = parseFloat(order.total_amount) || 0

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-emerald-700">
                            #{order.order_number || order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                            {eventName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {order.store_name || order.store?.store_name || 'Assigned Store'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {formatDate(eventDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                            {order.is_billed || totalAmt > 0 ? (
                              <span className="text-emerald-700 font-extrabold">₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            ) : (
                              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">Pending</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Badge status={order.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button
                              onClick={() => navigate(`/catering/orders/${order.id}`)}
                              className="inline-flex items-center text-xs text-gray-600 hover:text-emerald-600 font-medium p-1 hover:bg-emerald-50 rounded"
                              title="View Details"
                            >
                              <HiOutlineEye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                downloadPDFMutation.mutate({
                                  orderId: order.id,
                                  orderNumber: order.order_number,
                                })
                              }
                              className="inline-flex items-center text-xs text-gray-600 hover:text-emerald-600 font-medium p-1 hover:bg-emerald-50 rounded"
                              title="Download PDF"
                            >
                              <HiOutlineDocumentDownload className="w-4 h-4 mr-1" />
                              PDF
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-3 -mx-2">
                {recentOrders.map((order) => {
                  const eventName = order.event_name || order.event?.event_name || 'Catering Function'
                  const eventDate = order.event_date || order.event?.event_date
                  const totalAmt = parseFloat(order.total_amount) || 0

                  return (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-xl p-3.5 hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/catering/orders/${order.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-emerald-700 text-sm">
                          #{order.order_number || order.id}
                        </span>
                        <Badge status={order.status} />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event</span>
                          <span className="font-medium text-gray-900 text-right truncate ml-4">{eventName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Store</span>
                          <span className="text-gray-600 text-right truncate ml-4">{order.store_name || order.store?.store_name || 'Assigned Store'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date</span>
                          <span className="text-gray-600">{formatDate(eventDate)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-100">
                          <span className="text-gray-500">Bill Total</span>
                          {order.is_billed || totalAmt > 0 ? (
                            <span className="font-bold text-emerald-700">₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          ) : (
                            <span className="text-yellow-700 font-medium">Pending</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/catering/orders/${order.id}`) }}
                          className="flex-1 inline-flex items-center justify-center text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-3 py-2 rounded-lg shadow-sm"
                        >
                          <HiOutlineEye className="w-4 h-4 mr-1" /> View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadPDFMutation.mutate({ orderId: order.id, orderNumber: order.order_number })
                          }}
                          className="inline-flex items-center justify-center text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium px-3 py-2 rounded-lg"
                        >
                          <HiOutlineDocumentDownload className="w-4 h-4" />
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

export default CateringDashboard
