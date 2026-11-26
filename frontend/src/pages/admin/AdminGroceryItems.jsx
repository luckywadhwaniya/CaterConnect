import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFolder,
  HiOutlineSearch,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import {
  useCategories,
  useGroceryItems,
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminDeleteCategory,
  useAdminCreateItem,
  useAdminUpdateItem,
  useAdminDeleteItem,
} from '../../hooks/useGrocery'

const STANDARD_UNITS = ['kg', 'gm', 'liter', 'ml', 'packet', 'tin', 'bag', 'piece', 'box']

export const AdminGroceryItems = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Queries
  const { data: categoriesData, isLoading: loadingCategories } = useCategories()
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || []

  const { data: itemsData, isLoading: loadingItems } = useGroceryItems({
    category: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
    search: searchQuery || undefined,
  })
  const items = Array.isArray(itemsData) ? itemsData : itemsData?.results || []

  // Category Mutations
  const createCategoryMutation = useAdminCreateCategory()
  const updateCategoryMutation = useAdminUpdateCategory()
  const deleteCategoryMutation = useAdminDeleteCategory()

  // Item Mutations
  const createItemMutation = useAdminCreateItem()
  const updateItemMutation = useAdminUpdateItem()
  const deleteItemMutation = useAdminDeleteItem()

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryModalMode, setCategoryModalMode] = useState('create') // 'create' or 'edit'
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryNameInput, setCategoryNameInput] = useState('')

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [itemModalMode, setItemModalMode] = useState('create') // 'create' or 'edit'
  const [editingItem, setEditingItem] = useState(null)
  const [itemForm, setItemForm] = useState({
    name: '',
    name_en: '',
    category: '',
    default_unit: 'kg',
  })

  // Category Actions
  const handleOpenCreateCategory = () => {
    setCategoryModalMode('create')
    setCategoryNameInput('')
    setIsCategoryModalOpen(true)
  }

  const handleOpenEditCategory = (cat, e) => {
    e.stopPropagation()
    setCategoryModalMode('edit')
    setEditingCategory(cat)
    setCategoryNameInput(cat.name)
    setIsCategoryModalOpen(true)
  }

  const handleDeleteCategory = (cat, e) => {
    e.stopPropagation()
    if (window.confirm(`Delete category "${cat.name}"? This may affect items inside it.`)) {
      deleteCategoryMutation.mutate(cat.id)
      if (selectedCategoryId === cat.id) {
        setSelectedCategoryId('all')
      }
    }
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!categoryNameInput.trim()) {
      toast.error('Category name is required')
      return
    }
    if (categoryModalMode === 'create') {
      await createCategoryMutation.mutateAsync({ name: categoryNameInput.trim() })
    } else {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: { name: categoryNameInput.trim() },
      })
    }
    setIsCategoryModalOpen(false)
  }

  // Item Actions
  const handleOpenCreateItem = () => {
    setItemModalMode('create')
    setItemForm({
      name: '',
      name_en: '',
      category: selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || '',
      default_unit: 'kg',
    })
    setIsItemModalOpen(true)
  }

  const handleOpenEditItem = (item) => {
    setItemModalMode('edit')
    setEditingItem(item)
    setItemForm({
      name: item.name,
      name_en: item.name_en || '',
      category: item.category?.id || item.category || '',
      default_unit: item.default_unit || 'kg',
    })
    setIsItemModalOpen(true)
  }

  const handleDeleteItem = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id)
    }
  }

  const handleSaveItem = async (e) => {
    e.preventDefault()
    if (!itemForm.name.trim()) {
      toast.error('Gujarati name is required')
      return
    }
    if (itemModalMode === 'create') {
      await createItemMutation.mutateAsync({
        name: itemForm.name.trim(),
        name_en: itemForm.name_en.trim(),
        category: itemForm.category ? parseInt(itemForm.category, 10) : null,
        default_unit: itemForm.default_unit,
      })
    } else {
      await updateItemMutation.mutateAsync({
        id: editingItem.id,
        data: {
          name: itemForm.name.trim(),
          name_en: itemForm.name_en.trim(),
          category: itemForm.category ? parseInt(itemForm.category, 10) : null,
          default_unit: itemForm.default_unit,
        },
      })
    }
    setIsItemModalOpen(false)
  }

  return (
    <DashboardLayout sidebar={AdminSidebar}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Grocery Catalog</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Curate categories and standard bilingual Gujarati & English items for catering requisition
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleOpenCreateCategory} variant="outline" icon={HiOutlineFolder}>
              Add Category
            </Button>
            <Button onClick={handleOpenCreateItem} variant="primary" icon={HiOutlinePlus}>
              Add New Item
            </Button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Category List (1 col) */}
          <div className="lg:col-span-1">
            <Card
              title="Categories"
              subtitle={`${categories.length} available`}
              bodyClassName="p-2"
            >
              {loadingCategories ? (
                <div className="py-6">
                  <LoadingSpinner size="sm" text="Loading categories..." />
                </div>
              ) : (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('all')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCategoryId === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`group cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="truncate mr-2">{cat.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditCategory(cat, e)}
                            className={`p-1 rounded ${
                              isSelected ? 'hover:bg-emerald-700' : 'hover:bg-gray-200'
                            }`}
                            title="Edit Category"
                          >
                            <HiOutlinePencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCategory(cat, e)}
                            className={`p-1 rounded ${
                              isSelected ? 'hover:bg-emerald-700' : 'hover:bg-gray-200 text-red-500'
                            }`}
                            title="Delete Category"
                          >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right: Items Table (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item by Gujarati or English name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <Card bodyClassName="p-0">
              {loadingItems ? (
                <div className="py-12">
                  <LoadingSpinner text="Fetching items catalog..." />
                </div>
              ) : items.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No items found"
                    description="No grocery items found in this category or search."
                    actionText="Add Item"
                    onAction={handleOpenCreateItem}
                    actionIcon={HiOutlinePlus}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/70">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Gujarati Name</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">English Translation</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Default Unit</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                      {items.map((item, index) => {
                        const catObj = categories.find((c) => c.id === (item.category?.id || item.category))
                        const catName = catObj?.name || item.category_name || '-'

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/80">
                            <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-900 text-base">{item.name}</td>
                            <td className="px-6 py-4 text-gray-500">{item.name_en || '-'}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {catName}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-emerald-700 uppercase text-xs">
                              {item.default_unit || 'kg'}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditItem(item)}
                                className="inline-flex items-center text-xs text-gray-600 hover:text-emerald-700 font-semibold p-1 hover:bg-emerald-50 rounded"
                                title="Edit Item"
                              >
                                <HiOutlinePencil className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="inline-flex items-center text-xs text-red-600 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded"
                                title="Delete Item"
                              >
                                <HiOutlineTrash className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Category Modal */}
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title={categoryModalMode === 'create' ? 'Add Grocery Category' : 'Edit Grocery Category'}
        >
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <Input
              label="Category Name"
              placeholder="e.g. મસાલા (Spices) or દાળ / કઠોળ (Pulses)"
              value={categoryNameInput}
              onChange={(e) => setCategoryNameInput(e.target.value)}
              required
            />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {categoryModalMode === 'create' ? 'Create Category' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Item Modal */}
        <Modal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          title={itemModalMode === 'create' ? 'Add Master Grocery Item' : 'Edit Grocery Item'}
        >
          <form onSubmit={handleSaveItem} className="space-y-4">
            <Input
              label="Gujarati Name"
              placeholder="e.g. જીરું / હળદર પાવડર / તુવેર દાળ"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              required
            />
            <Input
              label="English Translation Name"
              placeholder="e.g. Cumin Seeds / Turmeric Powder"
              value={itemForm.name_en}
              onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- No Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Unit</label>
                <select
                  value={itemForm.default_unit}
                  onChange={(e) => setItemForm({ ...itemForm, default_unit: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {STANDARD_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsItemModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createItemMutation.isPending || updateItemMutation.isPending}
              >
                {itemModalMode === 'create' ? 'Create Item' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default AdminGroceryItems
