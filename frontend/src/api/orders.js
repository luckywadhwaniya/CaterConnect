import api from './axios'

export const getOrders = (params) => api.get('/orders/', { params })
export const createOrder = (data) => api.post('/orders/', data)
export const getOrder = (id) => api.get(`/orders/${id}/`)
export const updateOrder = (id, data) => api.patch(`/orders/${id}/`, data)
export const deleteOrder = (id) => api.delete(`/orders/${id}/`)
export const updateOrderStatus = (id, data) => api.post(`/orders/${id}/status/`, data)
export const downloadOrderPDF = (id) => api.get(`/orders/${id}/pdf/`, { responseType: 'blob' })
export const duplicateOrder = (id) => api.post(`/orders/${id}/duplicate/`)
export const updateOrderItem = (orderId, itemId, data) => api.patch(`/orders/${orderId}/items/${itemId}/`, data)
export const updateOrderBill = (orderId, data) => api.post(`/orders/${orderId}/bill/`, data)
export const getStoreStats = () => api.get('/orders/store-stats/')
