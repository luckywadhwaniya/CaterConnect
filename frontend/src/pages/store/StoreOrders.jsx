import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  HiOutlineEye,
  HiOutlineDocumentDownload,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineReceiptTax,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StoreSidebar from '../../components/layout/StoreSidebar'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { useOrders, useUpdateOrderStatus, useDownloadPDF } from '../../hooks/useOrders'
import { formatDate, formatTime } from '../../utils/helpers'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'New' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'completed', label: 'Done' },
]

export const StoreOrders = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromQuery = searchParams.get('tab') || 'all'

  const [activeTab, setActiveTab] = useState(
    tabFromQuery === 'history' ? 'completed' : tabFromQuery
  )
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(tabFromQuery === 'history' ? 'completed' : tabFromQuery)
    }
  }, [tabFromQuery])

  const { data: ordersData, isLoading } = useOrders(
    activeTab !== 'all' ? { status: activeTab } : {}
  )
  const downloadPDFMutation = useDownloadPDF()

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.results || []

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      order.order_number?.toString().toLowerCase().includes(q) ||
      order.event_name?.toLowerCase().includes(q) ||
      order.catering_name?.toLowerCase().includes(q) ||
      order.user?.first_name?.toLowerCase().includes(q)
    )
  })

  return (
    <DashboardLayout sidebar={StoreSidebar}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Store Order Fulfillment</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Accept grocery lists, monitor packing, and notify caterers
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSearchParams({ tab: tab.id })
                }}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full">
            <HiOutlineSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, event, caterer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Orders */}
        <Card bodyClassName="p-0">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner text="Fetching merchant orders..." />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No orders found"
                description={`No orders currently match status "${activeTab}".`}
              />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/70">
                    <tr>
                      <th className="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                      <th className="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Caterer</th>
                      <th className="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</th>
                      <th className="px-4 lg:px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill Total</th>
                      <th className="px-4 lg:px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 lg:px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {filteredOrders.map((order) => (
                      <StoreOrderRow
                        key={order.id}
                        order={order}
                        onDownloadPDF={(orderId, orderNum) =>
                          downloadPDFMutation.mutate({
                            orderId,
                            orderNumber: orderNum,
                          })
                        }
                        onView={() => navigate(`/store/orders/${order.id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onView={() => navigate(`/store/orders/${order.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

const StoreOrderRow = ({ order, onDownloadPDF, onView }) => {
  const updateStatusMutation = useUpdateOrderStatus(order.id)

  const handleQuickStatus = (newStatus) => {
    updateStatusMutation.mutate({ status: newStatus })
  }

  const eventName = order.event_name || order.event?.event_name || 'Event Order'
  const delivDate = order.delivery_date || order.event?.delivery_date
  const delivTime = order.delivery_time || order.event?.delivery_time
  const catererName = order.catering_name || order.catering_user_name || order.user?.first_name || 'Caterer'
  const totalAmt = parseFloat(order.total_amount) || 0

  return (
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap font-bold text-emerald-700">
        #{order.order_number || order.id}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <p className="font-semibold text-gray-900">{catererName}</p>
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
        {eventName}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-600">
        {formatDate(delivDate)} {delivTime ? `@ ${formatTime(delivTime)}` : ''}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
        {order.is_billed || totalAmt > 0 ? (
          <span className="text-emerald-700">₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        ) : (
          <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">Pending</span>
        )}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
        <Badge status={order.status} />
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm space-x-1.5">
        {order.status === 'pending' && (
          <>
            <button
              onClick={() => handleQuickStatus('accepted')}
              className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold px-2 py-1 rounded"
              disabled={updateStatusMutation.isPending}
            >
              <HiOutlineCheck className="w-3.5 h-3.5 mr-1" />
              Accept
            </button>
            <button
              onClick={() => handleQuickStatus('rejected')}
              className="inline-flex items-center text-xs text-red-700 bg-red-50 hover:bg-red-100 font-semibold px-2 py-1 rounded"
              disabled={updateStatusMutation.isPending}
            >
              <HiOutlineX className="w-3.5 h-3.5 mr-1" />
              Reject
            </button>
          </>
        )}
        <button
          onClick={onView}
          className="inline-flex items-center text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-2.5 py-1.5 rounded-lg shadow-sm"
        >
          <HiOutlineReceiptTax className="w-3.5 h-3.5 mr-1" />
          {order.is_billed ? 'View Bill' : 'Make Bill'}
        </button>
      </td>
    </tr>
  )
}

const MobileOrderCard = ({ order, onView }) => {
  const updateStatusMutation = useUpdateOrderStatus(order.id)
  const eventName = order.event_name || order.event?.event_name || 'Event Order'
  const delivDate = order.delivery_date || order.event?.delivery_date
  const delivTime = order.delivery_time || order.event?.delivery_time
  const catererName = order.catering_name || order.catering_user_name || order.user?.first_name || 'Caterer'
  const totalAmt = parseFloat(order.total_amount) || 0

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors" onClick={onView}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-emerald-700 text-sm">#{order.order_number || order.id}</span>
        <Badge status={order.status} />
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Caterer</span>
          <span className="font-semibold text-gray-900">{catererName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Event</span>
          <span className="font-medium text-gray-700 text-right truncate ml-4">{eventName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Delivery</span>
          <span className="text-gray-600">{formatDate(delivDate)} {delivTime ? `@ ${formatTime(delivTime)}` : ''}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-gray-100">
          <span className="text-gray-500">Bill</span>
          {order.is_billed || totalAmt > 0 ? (
            <span className="font-bold text-emerald-700">₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          ) : (
            <span className="text-yellow-700 font-medium">Pending</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {order.status === 'pending' && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ status: 'accepted' }) }}
              className="flex-1 inline-flex items-center justify-center text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold px-2 py-2 rounded-lg border border-emerald-200"
              disabled={updateStatusMutation.isPending}
            >
              <HiOutlineCheck className="w-3.5 h-3.5 mr-1" /> Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ status: 'rejected' }) }}
              className="inline-flex items-center justify-center text-xs text-red-700 bg-red-50 hover:bg-red-100 font-semibold px-3 py-2 rounded-lg border border-red-200"
              disabled={updateStatusMutation.isPending}
            >
              <HiOutlineX className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {order.status !== 'pending' && (
          <button
            onClick={(e) => { e.stopPropagation(); onView() }}
            className="flex-1 inline-flex items-center justify-center text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-3 py-2 rounded-lg shadow-sm"
          >
            <HiOutlineReceiptTax className="w-4 h-4 mr-1" />
            {order.is_billed ? 'View Bill' : 'Make Bill'}
          </button>
        )}
      </div>
    </div>
  )
}

export default StoreOrders
