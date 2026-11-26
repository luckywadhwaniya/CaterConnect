import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineEye,
  HiOutlineDocumentDownload,
  HiOutlineDocumentDuplicate,
  HiOutlinePlus,
  HiOutlineSearch,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CateringSidebar from '../../components/layout/CateringSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { useOrders, useDuplicateOrder, useDownloadPDF } from '../../hooks/useOrders'
import { formatDate } from '../../utils/helpers'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'completed', label: 'Done' },
]

export const CateringOrders = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: ordersData, isLoading } = useOrders(
    activeTab !== 'all' ? { status: activeTab } : {}
  )
  const duplicateMutation = useDuplicateOrder()
  const downloadPDFMutation = useDownloadPDF()

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.results || []

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      order.order_number?.toString().toLowerCase().includes(q) ||
      order.event_name?.toLowerCase().includes(q) ||
      order.store_name?.toLowerCase().includes(q) ||
      order.store?.store_name?.toLowerCase().includes(q)
    )
  })

  return (
    <DashboardLayout sidebar={CateringSidebar}>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Title & New Order CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Catering Orders</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage your event grocery orders and monitor packaging
            </p>
          </div>
          <Button
            onClick={() => navigate('/catering/create-list')}
            variant="primary"
            size="sm"
            icon={HiOutlinePlus}
            className="self-start sm:self-auto"
          >
            Create List
          </Button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
              placeholder="Search by order #, event..."
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
              <LoadingSpinner text="Loading orders list..." />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No orders found"
                description={
                  activeTab !== 'all'
                    ? `No orders matching status "${activeTab}".`
                    : 'You haven\'t submitted any grocery lists yet.'
                }
                actionText="Create New Grocery List"
                onAction={() => navigate('/catering/create-list')}
                actionIcon={HiOutlinePlus}
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
                      <th className="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Store</th>
                      <th className="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Date</th>
                      <th className="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</th>
                      <th className="px-4 lg:px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill Total</th>
                      <th className="px-4 lg:px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 lg:px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {filteredOrders.map((order) => {
                      const eventName = order.event_name || order.event?.event_name || 'Event Requisition'
                      const eventDate = order.event_date || order.event?.event_date
                      const delivDate = order.delivery_date || order.event?.delivery_date
                      const totalAmt = parseFloat(order.total_amount) || 0

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap font-bold text-emerald-700">
                            #{order.order_number || order.id}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {eventName}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-600">
                            {order.store_name || order.store?.store_name || '-'}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-500">
                            {formatDate(eventDate)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-500">
                            {formatDate(delivDate)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                            {order.is_billed || totalAmt > 0 ? (
                              <span className="text-emerald-700 font-extrabold">₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            ) : (
                              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">Pending</span>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                            <Badge status={order.status} />
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button
                              onClick={() => navigate(`/catering/orders/${order.id}`)}
                              className="inline-flex items-center text-xs text-gray-600 hover:text-emerald-700 font-medium px-2 py-1 hover:bg-emerald-50 rounded"
                            >
                              <HiOutlineEye className="w-4 h-4 mr-1" /> View
                            </button>
                            <button
                              onClick={() =>
                                downloadPDFMutation.mutate({
                                  orderId: order.id,
                                  orderNumber: order.order_number,
                                })
                              }
                              className="inline-flex items-center text-xs text-gray-600 hover:text-emerald-700 font-medium px-2 py-1 hover:bg-emerald-50 rounded"
                            >
                              <HiOutlineDocumentDownload className="w-4 h-4 mr-1" /> PDF
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const eventName = order.event_name || order.event?.event_name || 'Event Requisition'
                  const delivDate = order.delivery_date || order.event?.delivery_date
                  const totalAmt = parseFloat(order.total_amount) || 0

                  return (
                    <div
                      key={order.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/catering/orders/${order.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-emerald-700 text-sm">#{order.order_number || order.id}</span>
                        <Badge status={order.status} />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event</span>
                          <span className="font-medium text-gray-900 text-right truncate ml-4">{eventName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Store</span>
                          <span className="text-gray-600">{order.store_name || order.store?.store_name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery</span>
                          <span className="text-gray-600">{formatDate(delivDate)}</span>
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

export default CateringOrders
