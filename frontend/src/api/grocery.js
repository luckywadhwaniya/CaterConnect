import api from './axios'

export const getCategories = () => api.get('/grocery/categories/')
export const getItems = (params) => api.get('/grocery/items/', { params })
export const adminCreateItem = (data) => api.post('/grocery/admin/items/', data)
export const adminUpdateItem = (id, data) => api.patch(`/grocery/admin/items/${id}/`, data)
export const adminDeleteItem = (id) => api.delete(`/grocery/admin/items/${id}/`)
export const adminCreateCategory = (data) => api.post('/grocery/admin/categories/', data)
export const adminUpdateCategory = (id, data) => api.patch(`/grocery/admin/categories/${id}/`, data)
export const adminDeleteCategory = (id) => api.delete(`/grocery/admin/categories/${id}/`)
