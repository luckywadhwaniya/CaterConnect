import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentDownload,
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineShoppingBag,
  HiOutlineChatAlt,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CateringSidebar from '../../components/layout/CateringSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useOrder, useUpdateOrderStatus, useDownloadPDF } from '../../hooks/useOrders'
import { formatDate, formatTime } from '../../utils/helpers'

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Submitted' },
  { key: 'accepted', label: 'Accepted by Store' },
  { key: 'preparing', label: 'Packing & Preparing' },
  { key: 'ready', label: 'Ready for Pickup / Dispatch' },
  { key: 'completed', label: 'Completed' },
]

export const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrder(id)
  const updateStatusMutation = useUpdateOrderStatus(id)
  const downloadPDFMutation = useDownloadPDF()

  if (isLoading) {
    return (
      <DashboardLayout sidebar={CateringSidebar}>
        <LoadingSpinner text="Loading order details..." />
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout sidebar={CateringSidebar}>
        <div className="text-center py-12">
          <p className="text-gray-600">Order not found.</p>
          <Button onClick={() => navigate('/catering/orders')} className="mt-4" variant="outline">
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const items = order.items || []
  const currentStatusIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected'

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this pending order?')) {
      updateStatusMutation.mutate({ status: 'cancelled', comment: 'Cancelled by Caterer' })
    }
  }

  return (
    <DashboardLayout sidebar={CateringSidebar}>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Top Bar Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/catering/orders')}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Back"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.order_number || order.id}
                </h1>
                <Badge status={order.status} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Created on {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() =>
                downloadPDFMutation.mutate({
                  orderId: order.id,
                  orderNumber: order.order_number,
                })
              }
              variant="outline"
              icon={HiOutlineDocumentDownload}
              isLoading={downloadPDFMutation.isPending}
            >
              Download PDF
            </Button>
            {order.status === 'pending' && (
              <Button
                onClick={handleCancel}
                variant="danger"
                icon={HiOutlineBan}
                isLoading={updateStatusMutation.isPending}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <Card title="Order Progress Tracking">
          {isCancelled ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-800 text-sm font-semibold flex items-center gap-2">
              <HiOutlineBan className="w-5 h-5" />
              <span>This order has been {order.status}.</span>
            </div>
          ) : (
            <div className="relative flex items-center justify-between py-4">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(currentStatusIndex, 0) / (TIMELINE_STEPS.length - 1)) * 100}%`,
                }}
              />
              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = currentStatusIndex >= idx
                const isCurrent = currentStatusIndex === idx

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isPassed
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isPassed ? <HiOutlineCheckCircle className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-center text-[11px] sm:text-xs font-semibold max-w-[80px] sm:max-w-[100px] leading-tight ${
                        isCurrent
                          ? 'text-emerald-700'
                          : isPassed
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Event Information">
            <dl className="divide-y divide-gray-100 text-sm">
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlineCalendar className="w-4 h-4 text-emerald-600" /> Event Name
                </dt>
                <dd className="font-semibold text-gray-900">{order.event_name}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlineCalendar className="w-4 h-4 text-emerald-600" /> Event Date
                </dt>
                <dd className="font-semibold text-gray-900">{formatDate(order.event_date)}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlineClock className="w-4 h-4 text-emerald-600" /> Delivery Target
                </dt>
                <dd className="font-semibold text-emerald-700">
                  {formatDate(order.delivery_date)} at {formatTime(order.delivery_time)}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlineUserGroup className="w-4 h-4 text-emerald-600" /> Guest Count
                </dt>
                <dd className="font-semibold text-gray-900">{order.number_of_guests || '-'} Guests</dd>
              </div>
              <div className="py-2.5 flex flex-col gap-1">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlineLocationMarker className="w-4 h-4 text-emerald-600" /> Venue / Location
                </dt>
                <dd className="font-medium text-gray-800">{order.event_location || '-'}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Assigned Store Partner">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <HiOutlineShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  {order.store_name || order.store?.store_name || 'Store Partner'}
                </h4>
                <p className="text-xs text-gray-500">
                  {order.store?.phone || order.store_phone || 'Phone verified'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Address: {order.store?.address || order.store_address || 'Merchant Location'}
            </p>

            {order.store_comment && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                  <HiOutlineChatAlt className="w-4 h-4" />
                  Store Remarks / Notes:
                </div>
                <p className="text-blue-800">{order.store_comment}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Grocery Items & Store Bill Invoice */}
        {order.is_billed || (order.total_amount && parseFloat(order.total_amount) > 0) || order.status === 'ready' || order.status === 'completed' ? (
          <Card
            title="Grocery Store Bill & Invoice"
            subtitle="Itemized pricing prepared by your merchant partner"
            action={
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  <HiOutlineCheckCircle className="w-4 h-4" /> Bill Finalized
                </span>
                <Button
                  onClick={() =>
                    downloadPDFMutation.mutate({
                      orderId: order.id,
                      orderNumber: order.order_number,
                    })
                  }
                  variant="outline"
                  size="sm"
                  icon={HiOutlineDocumentDownload}
                  isLoading={downloadPDFMutation.isPending}
                >
                  Download PDF
                </Button>
              </div>
            }
          >
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item Name</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Rate (₹ / Unit)</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Line Total (₹)</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {items.map((item, index) => {
                    const itemName = item.item_name || item.name || item.grocery_item_name || item.grocery_item_detail?.name || item.custom_item_name || 'Grocery Item'
                    const itemNameEn = item.name_en || item.grocery_item_name_en || item.grocery_item_detail?.name_en || ''
                    const isAvailable = item.is_available !== false
                    const rate = parseFloat(item.unit_price) || 0
                    const qty = parseFloat(item.quantity) || 0
                    const lineTotal = item.total_price && parseFloat(item.total_price) > 0 ? parseFloat(item.total_price) : (isAvailable ? rate * qty : 0)

                    return (
                      <tr key={item.id || index} className={`hover:bg-gray-50/80 ${!isAvailable ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                        <td className="px-6 py-3">
                          <p className={`font-semibold ${isAvailable ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{itemName}</p>
                          {itemNameEn && <p className="text-xs text-gray-500">{itemNameEn}</p>}
                        </td>
                        <td className="px-6 py-3 text-center whitespace-nowrap">
                          <span className="font-bold text-gray-900">{item.quantity}</span>{' '}
                          <span className="text-xs uppercase text-gray-500 font-semibold">{item.unit}</span>
                        </td>
                        <td className="px-6 py-3 text-center whitespace-nowrap font-medium text-gray-700">
                          {isAvailable ? (rate > 0 ? `₹${rate.toFixed(2)}` : '—') : <span className="text-red-500 text-xs">N/A</span>}
                        </td>
                        <td className="px-6 py-3 text-right whitespace-nowrap font-bold text-gray-900">
                          {isAvailable ? `₹${lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : <span className="text-gray-400 text-xs line-through">₹0.00</span>}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {isAvailable ? 'Billed' : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards for Billed Items */}
            <div className="md:hidden space-y-3 -mx-2">
              {items.map((item, index) => {
                const itemName = item.item_name || item.name || item.grocery_item_name || item.grocery_item_detail?.name || item.custom_item_name || 'Grocery Item'
                const itemNameEn = item.name_en || item.grocery_item_name_en || item.grocery_item_detail?.name_en || ''
                const isAvailable = item.is_available !== false
                const rate = parseFloat(item.unit_price) || 0
                const qty = parseFloat(item.quantity) || 0
                const lineTotal = item.total_price && parseFloat(item.total_price) > 0 ? parseFloat(item.total_price) : (isAvailable ? rate * qty : 0)

                return (
                  <div key={item.id || index} className={`border rounded-xl p-3 text-xs ${!isAvailable ? 'bg-red-50/20 border-red-200' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <p className={`font-bold ${isAvailable ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{index + 1}. {itemName}</p>
                        {itemNameEn && <p className="text-[11px] text-gray-500">{itemNameEn}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {isAvailable ? 'Billed' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Qty</span>
                        <span className="font-semibold text-gray-800">{item.quantity} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Rate</span>
                        <span className="font-semibold text-gray-800">{rate > 0 ? `₹${rate.toFixed(2)}` : '—'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 block text-[10px]">Total</span>
                        <span className="font-bold text-emerald-700">₹{lineTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bill Summary Footer */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-200 bg-gray-50/80 -mx-6 -mb-6 p-4 sm:p-6 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-xs text-gray-500 max-w-sm">
                  <p className="font-semibold text-gray-700">Payment & Pickup Note:</p>
                  <p>Please verify items upon collection. Settlement can be completed directly with {order.store_name || 'the grocery store'}.</p>
                </div>
                <div className="w-full sm:w-64 space-y-1.5 text-right">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{parseFloat(order.subtotal_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {parseFloat(order.delivery_charge || 0) > 0 && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Delivery / Transport:</span>
                      <span className="font-semibold text-gray-900">+₹{parseFloat(order.delivery_charge).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(order.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>Special Discount:</span>
                      <span className="font-semibold">-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-emerald-800 pt-2 border-t border-gray-200">
                    <span>Grand Total:</span>
                    <span>₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            title={`Requisition Item List (${items.length} items)`}
            subtitle="Store merchant is preparing the items and calculating the final bill"
          >
            {/* Desktop Requisition Table */}
            <div className="hidden md:block overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">English Translation</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ordered Qty</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {items.map((item, index) => {
                    const itemName = item.item_name || item.name || item.grocery_item_name || item.grocery_item_detail?.name || item.custom_item_name || 'Grocery Item'
                    const itemNameEn = item.name_en || item.grocery_item_name_en || item.grocery_item_detail?.name_en || ''
                    const isAvailable = item.is_available !== false

                    return (
                      <tr key={item.id || index} className="hover:bg-gray-50/80">
                        <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                        <td className="px-6 py-3 font-semibold text-gray-900">{itemName}</td>
                        <td className="px-6 py-3 text-gray-500">{itemNameEn || '-'}</td>
                        <td className="px-6 py-3 text-right font-bold text-emerald-700">{item.quantity}</td>
                        <td className="px-6 py-3 text-center text-gray-600 uppercase text-xs font-semibold">
                          {item.unit}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700 font-semibold'
                            }`}
                          >
                            {isAvailable ? 'In Stock' : 'Unavailable'}
                          </span>
                          {item.substitute_suggestion && (
                            <span className="block text-[10px] text-orange-600 font-medium mt-0.5">
                              Sub: {item.substitute_suggestion}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Requisition Cards */}
            <div className="md:hidden space-y-2.5 -mx-2">
              {items.map((item, index) => {
                const itemName = item.item_name || item.name || item.grocery_item_name || item.grocery_item_detail?.name || item.custom_item_name || 'Grocery Item'
                const itemNameEn = item.name_en || item.grocery_item_name_en || item.grocery_item_detail?.name_en || ''
                const isAvailable = item.is_available !== false

                return (
                  <div key={item.id || index} className="border border-gray-200 rounded-xl p-3 text-xs">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <p className="font-bold text-gray-900">{index + 1}. {itemName}</p>
                        {itemNameEn && <p className="text-[11px] text-gray-500">{itemNameEn}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700 font-semibold'}`}>
                        {isAvailable ? 'In Stock' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-100">
                      <span className="text-gray-500">Ordered Qty:</span>
                      <span className="font-bold text-emerald-700">{item.quantity} <span className="uppercase text-[10px]">{item.unit}</span></span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
              <span>⏳ <strong>Bill In Progress:</strong> The itemized bill with rates and total amount will appear here once the store merchant completes packaging and marks the order ready for pickup.</span>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default OrderDetail
