import api from './axios'

export const getStores = () => api.get('/stores/')
export const getStore = (id) => api.get(`/stores/${id}/`)
export const updateStore = (id, data) => api.patch(`/stores/${id}/`, data)
export const getStoreProfile = () => api.get('/stores/me/')
export const updateStoreProfile = (data) => api.patch('/stores/me/', data)
export const adminGetStores = () => api.get('/stores/admin/stores/')
export const adminUpdateStoreStatus = (id, data) => api.patch(`/stores/admin/stores/${id}/`, data)
