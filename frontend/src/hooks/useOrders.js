import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  duplicateOrder,
  downloadOrderPDF,
} from '../api/orders'
import { downloadBlob } from '../utils/helpers'

export const useOrders = (params = {}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const res = await getOrders(params)
      return res.data
    },
  })
}

export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await getOrder(id)
      return res.data
    },
    enabled: Boolean(id),
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order created successfully!')
    },
    onError: (err) => {
      const data = err.response?.data
      let msg = data?.message || data?.detail
      if (!msg && data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        if (firstKey) {
          const val = data[firstKey]
          msg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : typeof val === 'string' ? `${firstKey}: ${val}` : `${firstKey}: ${JSON.stringify(val)}`
        }
      }
      toast.error(msg || 'Failed to create order')
    },
  })
}

export const useUpdateOrderStatus = (orderId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => updateOrderStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order status updated!')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update order status'
      toast.error(msg)
    },
  })
}

export const useDuplicateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => duplicateOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order duplicated as new draft!')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to duplicate order'
      toast.error(msg)
    },
  })
}

export const useDownloadPDF = () => {
  return useMutation({
    mutationFn: async ({ orderId, orderNumber }) => {
      const res = await downloadOrderPDF(orderId)
      downloadBlob(res.data, `Order-${orderNumber || orderId}.pdf`)
    },
    onSuccess: () => {
      toast.success('PDF downloaded!')
    },
    onError: () => {
      toast.error('Failed to download PDF')
    },
  })
}
