import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentDownload,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineChatAlt,
  HiOutlineCurrencyRupee,
  HiOutlineReceiptTax,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StoreSidebar from '../../components/layout/StoreSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useOrder, useUpdateOrderStatus, useDownloadPDF } from '../../hooks/useOrders'
import { updateOrderItem, updateOrderBill } from '../../api/orders'
import { formatDate, formatTime } from '../../utils/helpers'

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Received' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'preparing', label: 'Packing' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'completed', label: 'Completed' },
]

export const StoreOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, isLoading, refetch } = useOrder(id)
  const updateStatusMutation = useUpdateOrderStatus(id)
  const downloadPDFMutation = useDownloadPDF()

  const [storeComment, setStoreComment] = useState('')
  const [substituteInputs, setSubstituteInputs] = useState({})
  const [updatingItemId, setUpdatingItemId] = useState(null)

  // Billing state
  const [itemPrices, setItemPrices] = useState({})
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isSavingBill, setIsSavingBill] = useState(false)

  // Sync state when order data arrives
  useEffect(() => {
    if (order) {
      if (order.delivery_charge !== undefined) setDeliveryCharge(parseFloat(order.delivery_charge) || 0)
      if (order.discount_amount !== undefined) setDiscountAmount(parseFloat(order.discount_amount) || 0)
      if (order.store_comment) setStoreComment(order.store_comment)

      if (order.items && order.items.length > 0) {
        const prices = {}
        const substitutes = {}
        order.items.forEach((item) => {
          prices[item.id] = item.unit_price !== undefined && parseFloat(item.unit_price) > 0 ? String(item.unit_price) : ''
          substitutes[item.id] = item.alternative_suggestion || ''
        })
        setItemPrices((prev) => ({ ...prices, ...prev }))
        setSubstituteInputs((prev) => ({ ...substitutes, ...prev }))
      }
    }
  }, [order])

  if (isLoading) {
    return (
      <DashboardLayout sidebar={StoreSidebar}>
        <LoadingSpinner text="Loading order fulfillment details..." />
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout sidebar={StoreSidebar}>
        <div className="text-center py-12">
          <p className="text-gray-600">Order not found.</p>
          <Button onClick={() => navigate('/store/orders')} className="mt-4" variant="outline">
            Back to Orders
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const items = order.items || []
  const currentStatusIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status)

  // Calculate live bill values
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      if (item.is_available === false) return sum
      const price = parseFloat(itemPrices[item.id] !== undefined ? itemPrices[item.id] : (item.unit_price || 0)) || 0
      const qty = parseFloat(item.quantity) || 0
      return sum + (price * qty)
    }, 0)
  }

  const currentSubtotal = calculateSubtotal()
  const grandTotal = Math.max(
    0,
    currentSubtotal + (parseFloat(deliveryCharge) || 0) - (parseFloat(discountAmount) || 0)
  )

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        status: newStatus,
        comment: storeComment || undefined,
      })
      setStoreComment('')
      refetch()
    } catch {
      // Handled by mutation
    }
  }

  const handleToggleItemAvailability = async (item) => {
    setUpdatingItemId(item.id)
    try {
      const newAvailability = !(item.is_available !== false)
      await updateOrderItem(order.id, item.id, {
        is_available: newAvailability,
      })
      toast.success(newAvailability ? 'Item marked in stock' : 'Item marked out of stock')
      refetch()
    } catch {
      toast.error('Failed to update item availability')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleSaveSubstitute = async (item) => {
    const substitute = substituteInputs[item.id]
    if (substitute === undefined) return
    setUpdatingItemId(item.id)
    try {
      await updateOrderItem(order.id, item.id, {
        substitute_suggestion: substitute,
        alternative_suggestion: substitute,
      })
      toast.success('Alternative suggested successfully!')
      refetch()
    } catch {
      toast.error('Failed to update substitute')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleSaveBill = async (markReady = false) => {
    setIsSavingBill(true)
    try {
      const itemsPayload = items.map((it) => {
        const uPrice = parseFloat(itemPrices[it.id] !== undefined ? itemPrices[it.id] : (it.unit_price || 0)) || 0
        const qty = parseFloat(it.quantity) || 0
        return {
          id: it.id,
          unit_price: uPrice,
          total_price: Math.round(qty * uPrice * 100) / 100,
          is_available: it.is_available !== false,
          alternative_suggestion: substituteInputs[it.id] !== undefined ? substituteInputs[it.id] : (it.alternative_suggestion || ''),
        }
      })

      await updateOrderBill(order.id, {
        items: itemsPayload,
        delivery_charge: parseFloat(deliveryCharge) || 0,
        discount_amount: parseFloat(discountAmount) || 0,
        tax_amount: 0,
        store_comment: storeComment || undefined,
        mark_ready: markReady,
      })

      toast.success(
        markReady
          ? 'Bill generated and order marked Ready for Pickup!'
          : 'Bill successfully generated and saved!'
      )
      refetch()
    } catch (err) {
      toast.error('Failed to save bill. Please try again.')
    } finally {
      setIsSavingBill(false)
    }
  }

  return (
    <DashboardLayout sidebar={StoreSidebar}>
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/store/orders')}
              className="p-1.5 sm:p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
              title="Back"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Order #{order.order_number || order.id}
                </h1>
                <Badge status={order.status} />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                Received on {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        {/* Status Timeline */}
        <Card title="Fulfillment Progress">
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
        </Card>

        {/* Client & Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Catering Client Information">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <HiOutlineUser className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  {order.catering_name || order.user?.first_name || 'Catering Professional'}
                </h4>
                <p className="text-xs text-gray-500">
                  {order.catering_profile?.business_name || 'Catering Business'}
                </p>
              </div>
            </div>
            <dl className="divide-y divide-gray-100 text-sm">
              <div className="py-2 flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlinePhone className="w-4 h-4 text-emerald-600" /> Phone Contact
                </dt>
                <dd className="font-semibold text-gray-900">
                  {order.user?.phone || order.phone || 'Contact provided'}
                </dd>
              </div>
              <div className="py-2 flex flex-col gap-0.5">
                <dt className="text-gray-500">Address / Delivery Drop</dt>
                <dd className="font-medium text-gray-800">
                  {order.event_location || order.user?.catering_profile?.address || '-'}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Event Schedule">
            <dl className="divide-y divide-gray-100 text-sm">
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlineCalendar className="w-4 h-4 text-emerald-600" /> Event Name
                </dt>
                <dd className="font-semibold text-gray-900">{order.event_name || '-'}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlineClock className="w-4 h-4 text-emerald-600" /> Required By
                </dt>
                <dd className="font-bold text-emerald-700">
                  {formatDate(order.delivery_date)} at {formatTime(order.delivery_time)}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <HiOutlineUserGroup className="w-4 h-4 text-emerald-600" /> Guest Count
                </dt>
                <dd className="font-semibold text-gray-900">{order.number_of_guests || '-'} Guests</dd>
              </div>
            </dl>
            {order.additional_instructions && (
              <div className="mt-3 p-3 rounded-lg bg-yellow-50 text-xs text-yellow-900 border border-yellow-200">
                <strong>Caterer Instructions:</strong> {order.additional_instructions}
              </div>
            )}
          </Card>
        </div>

        {/* Grocery Items Table with Pricing & Availability */}
        <Card
          title={`Items & Bill Pricing (${items.length})`}
          subtitle="Enter rate (₹), toggle stock, suggest substitutes"
          action={
            <div className="flex items-center gap-2">
              {order.is_billed && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold rounded-full">
                  <HiOutlineCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          }
        >
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto -mx-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/70">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item (Gujarati / English)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty & Unit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Rate (₹)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total (₹)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Alternative</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-sm">
                {items.map((item, index) => {
                  const itemName = item.item_name || item.name || item.grocery_item_name || item.grocery_item_detail?.name || item.custom_item_name || 'Grocery Item'
                  const itemNameEn = item.name_en || item.grocery_item_name_en || item.grocery_item_detail?.name_en || ''
                  const isAvailable = item.is_available !== false
                  const isBusy = updatingItemId === item.id
                  const enteredRate = itemPrices[item.id] !== undefined ? itemPrices[item.id] : (item.unit_price ? String(item.unit_price) : '')
                  const rateNum = parseFloat(enteredRate) || 0
                  const qtyNum = parseFloat(item.quantity) || 0
                  const lineTotal = isAvailable ? rateNum * qtyNum : 0

                  return (
                    <tr key={item.id || index} className={`hover:bg-gray-50/80 ${!isAvailable ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className={`font-bold ${isAvailable ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{itemName}</p>
                        {itemNameEn && <p className="text-xs text-gray-500">{itemNameEn}</p>}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="font-bold text-emerald-700">{item.quantity}</span>{' '}
                        <span className="text-xs uppercase text-gray-500 font-semibold">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleItemAvailability(item)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition-colors ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                          }`}
                        >
                          {isAvailable ? (
                            <><HiOutlineCheck className="w-3.5 h-3.5" /> In Stock</>
                          ) : (
                            <><HiOutlineX className="w-3.5 h-3.5" /> Out</>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <span className="text-gray-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0.00"
                            disabled={!isAvailable}
                            value={enteredRate}
                            onChange={(e) =>
                              setItemPrices({
                                ...itemPrices,
                                [item.id]: e.target.value,
                              })
                            }
                            className={`w-20 px-2 py-1 text-sm border rounded-lg text-right font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                              isAvailable ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-200 bg-gray-100 text-gray-400'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className={`font-bold ${isAvailable ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                          ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Alt brand..."
                          value={substituteInputs[item.id] !== undefined ? substituteInputs[item.id] : (item.alternative_suggestion || '')}
                          onChange={(e) =>
                            setSubstituteInputs({
                              ...substituteInputs,
                              [item.id]: e.target.value,
                            })
                          }
                          className="px-2 py-1 text-xs border border-gray-300 rounded-lg w-full max-w-[120px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list for items */}
          <div className="md:hidden space-y-3 -mx-2">
            {items.map((item, index) => {
              const itemName = item.item_name || item.name || item.grocery_item_name || item.grocery_item_detail?.name || item.custom_item_name || 'Grocery Item'
              const itemNameEn = item.name_en || item.grocery_item_name_en || item.grocery_item_detail?.name_en || ''
              const isAvailable = item.is_available !== false
              const isBusy = updatingItemId === item.id
              const enteredRate = itemPrices[item.id] !== undefined ? itemPrices[item.id] : (item.unit_price ? String(item.unit_price) : '')
              const rateNum = parseFloat(enteredRate) || 0
              const qtyNum = parseFloat(item.quantity) || 0
              const lineTotal = isAvailable ? rateNum * qtyNum : 0

              return (
                <div key={item.id || index} className={`border rounded-xl p-3 ${!isAvailable ? 'bg-red-50/30 border-red-200' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold text-sm ${isAvailable ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                        {index + 1}. {itemName}
                      </p>
                      {itemNameEn && <p className="text-[11px] text-gray-500">{itemNameEn}</p>}
                    </div>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleItemAvailability(item)}
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}
                    >
                      {isAvailable ? <><HiOutlineCheck className="w-3 h-3" /> In Stock</> : <><HiOutlineX className="w-3 h-3" /> Out</>}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-0.5">Qty</span>
                      <span className="font-bold text-emerald-700">{item.quantity} <span className="text-gray-500 uppercase text-[10px]">{item.unit}</span></span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Rate ₹</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0"
                        disabled={!isAvailable}
                        value={enteredRate}
                        onChange={(e) =>
                          setItemPrices({
                            ...itemPrices,
                            [item.id]: e.target.value,
                          })
                        }
                        className={`w-full px-2 py-1 text-xs border rounded-lg text-right font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isAvailable ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100 text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Total</span>
                      <span className={`font-bold text-sm ${isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                        ₹{lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live Bill Breakdown & Action Box */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 p-4 sm:p-6 rounded-b-2xl">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Extra charges controls */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 mb-1">
                    Delivery Charge (₹)
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 text-xs">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      className="pl-5 pr-2 py-1.5 w-full text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 mb-1">
                    Discount (₹)
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 text-xs">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="pl-5 pr-2 py-1.5 w-full text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Total Summary and Bill Actions */}
              <div className="flex flex-col items-end gap-3">
                <div className="text-right w-full sm:w-auto">
                  <div className="text-[10px] sm:text-xs text-gray-500 space-x-2 sm:space-x-3 flex flex-wrap justify-end gap-y-0.5">
                    <span>Subtotal: <strong>₹{currentSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                    {parseFloat(deliveryCharge) > 0 && <span>+ Delivery: <strong>₹{parseFloat(deliveryCharge).toFixed(2)}</strong></span>}
                    {parseFloat(discountAmount) > 0 && <span>- Discount: <strong>₹{parseFloat(discountAmount).toFixed(2)}</strong></span>}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
                    Bill Total: ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                  <Button
                    onClick={() => handleSaveBill(false)}
                    variant="outline"
                    isLoading={isSavingBill}
                    icon={HiOutlineReceiptTax}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Save Bill Draft
                  </Button>
                  <Button
                    onClick={() => handleSaveBill(true)}
                    variant="primary"
                    isLoading={isSavingBill}
                    icon={HiOutlineCheckCircle}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Generate Bill & Mark Ready
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Store Action Panel */}
        <Card title="Order Status Management" subtitle="Update fulfillment stage to notify the catering client">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Notes / Message to Caterer (Optional)
              </label>
              <textarea
                rows={2}
                value={storeComment}
                onChange={(e) => setStoreComment(e.target.value)}
                placeholder="e.g. 5 bags packed. Please pick up spices after 4:00 PM."
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {order.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleStatusChange('accepted')}
                    variant="primary"
                    icon={HiOutlineCheck}
                    isLoading={updateStatusMutation.isPending}
                  >
                    Accept Order
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('rejected')}
                    variant="danger"
                    icon={HiOutlineX}
                    isLoading={updateStatusMutation.isPending}
                  >
                    Reject Order
                  </Button>
                </>
              )}
              {order.status === 'accepted' && (
                <Button
                  onClick={() => handleStatusChange('preparing')}
                  variant="primary"
                  icon={HiOutlineClock}
                  isLoading={updateStatusMutation.isPending}
                >
                  Mark as Packing & Preparing
                </Button>
              )}
              {order.status === 'preparing' && (
                <Button
                  onClick={() => handleSaveBill(true)}
                  variant="primary"
                  icon={HiOutlineTruck}
                  isLoading={isSavingBill || updateStatusMutation.isPending}
                >
                  Generate Bill & Mark as Ready for Pickup
                </Button>
              )}
              {order.status === 'ready' && (
                <Button
                  onClick={() => handleStatusChange('completed')}
                  variant="secondary"
                  icon={HiOutlineCheckCircle}
                  isLoading={updateStatusMutation.isPending}
                >
                  Mark as Completed / Delivered
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default StoreOrderDetail
