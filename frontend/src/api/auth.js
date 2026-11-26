import api from './axios'

export const registerUser = (data) => api.post('/auth/register/', data)
export const loginUser = (data) => api.post('/auth/login/', data)
export const getMe = () => api.get('/auth/me/')
export const updateMe = (data) => api.patch('/auth/me/', data)
export const changePassword = (data) => api.post('/auth/change-password/', data)

// Admin user management
export const getUsers = (params) => api.get('/auth/admin/users/', { params })
export const updateUserStatus = (id, data) => api.patch(`/auth/admin/users/${id}/`, data)
