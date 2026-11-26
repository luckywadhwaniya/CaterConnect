import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getCategories,
  getItems,
  adminCreateItem,
  adminUpdateItem,
  adminDeleteItem,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../api/grocery'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    },
  })
}

export const useGroceryItems = (params = {}) => {
  return useQuery({
    queryKey: ['groceryItems', params],
    queryFn: async () => {
      const res = await getItems(params)
      return res.data
    },
  })
}

export const useAdminCreateItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminCreateItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] })
      toast.success('Grocery item created!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create item')
    },
  })
}

export const useAdminUpdateItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminUpdateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] })
      toast.success('Item updated successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update item')
    },
  })
}

export const useAdminDeleteItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminDeleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] })
      toast.success('Item deleted!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete item')
    },
  })
}

export const useAdminCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminCreateCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create category')
    },
  })
}

export const useAdminUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminUpdateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update category')
    },
  })
}

export const useAdminDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminDeleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    },
  })
}
