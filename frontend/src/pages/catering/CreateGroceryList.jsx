import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineShoppingBag,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineDocumentText,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CateringSidebar from '../../components/layout/CateringSidebar'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { getStores } from '../../api/stores'
import { useCategories, useGroceryItems } from '../../hooks/useGrocery'
import { useCreateOrder } from '../../hooks/useOrders'
import { formatDate, formatTime } from '../../utils/helpers'

const STANDARD_UNITS = [
  'kg',
  'gram',
  'litre',
  'ml',
  'packet',
  'piece',
  'dozen',
  'tin',
  'bag',
  'box',
]

export const CreateGroceryList = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1 Form
  const {
    register,
    handleSubmit: handleStep1Submit,
    getValues: getEventValues,
    setValue,
    watch,
    formState: { errors: step1Errors },
  } = useForm({
    defaultValues: {
      event_name: '',
      event_date: '',
      delivery_date: '',
      delivery_time: '09:00',
      event_location: '',
      number_of_guests: 100,
      store: '',
      additional_instructions: '',
    },
  })

  // Queries
  const { data: storesData, isLoading: loadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await getStores()
      return res.data
    },
  })
  const stores = Array.isArray(storesData) ? storesData : storesData?.results || []

  // Auto-select "Wadhwaniya Provision Store" as soon as stores load
  useEffect(() => {
    if (stores && stores.length > 0) {
      const currentStore = getEventValues('store')
      const wadhwaniya = stores.find((s) =>
        s.store_name?.toLowerCase().includes('wadhwaniya')
      )
      if (!currentStore || (wadhwaniya && currentStore !== String(wadhwaniya.id))) {
        const storeToSelect = wadhwaniya ? String(wadhwaniya.id) : String(stores[0].id)
        setValue('store', storeToSelect, { shouldValidate: true, shouldDirty: true })
      }
    }
  }, [stores, setValue, getEventValues])

  const { data: categoriesData, isLoading: loadingCategories } = useCategories()
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || []

  // Step 2 Item Selection State
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItemsMap, setSelectedItemsMap] = useState({}) // { [itemId]: { id, name, name_en, quantity, unit, is_custom } }

  // Custom Item Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    name_en: '',
    quantity: '1',
    unit: 'kg',
  })

  // Fetch Items based on selected category & search
  const { data: itemsData, isLoading: loadingItems } = useGroceryItems({
    category: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
    search: searchQuery || undefined,
  })
  const groceryItems = Array.isArray(itemsData) ? itemsData : itemsData?.results || []

  // Create Order Mutation
  const createOrderMutation = useCreateOrder()

  // Handle Step 1 Next
  const onStep1Next = () => {
    setCurrentStep(2)
  }

  // Toggle Item Selection
  const toggleItemSelection = (item) => {
    setSelectedItemsMap((prev) => {
      const newMap = { ...prev }
      if (newMap[item.id]) {
        delete newMap[item.id]
      } else {
        newMap[item.id] = {
          id: item.id,
          name: item.name,
          name_en: item.name_en || item.name,
          quantity: '1',
          unit: item.default_unit || 'kg',
          is_custom: false,
        }
      }
      return newMap
    })
  }

  // Update selected item quantity or unit
  const updateSelectedItem = (id, field, value) => {
    setSelectedItemsMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  // Remove selected item
  const removeSelectedItem = (id) => {
    setSelectedItemsMap((prev) => {
      const newMap = { ...prev }
      delete newMap[id]
    })
  }

  // Add custom item
  const handleAddCustomItem = (e) => {
    e.preventDefault()
    if (!customItemForm.name.trim()) {
      toast.error('Item name is required')
      return
    }
    const customId = `custom_${Date.now()}`
    setSelectedItemsMap((prev) => ({
      ...prev,
      [customId]: {
        id: customId,
        name: customItemForm.name.trim(),
        name_en: customItemForm.name_en.trim() || customItemForm.name.trim(),
        quantity: customItemForm.quantity || '1',
        unit: customItemForm.unit || 'kg',
        is_custom: true,
      },
    }))
    setCustomItemForm({ name: '', name_en: '', quantity: '1', unit: 'kg' })
    setIsCustomModalOpen(false)
    toast.success('Custom item added to list!')
  }

  // Final submit
  const handleFinalSubmit = async () => {
    const eventDetails = getEventValues()
    const itemsList = Object.values(selectedItemsMap)

    if (itemsList.length === 0) {
      toast.error('Please select at least one grocery item before submitting.')
      setCurrentStep(2)
      return
    }

    const selectedStoreId = eventDetails.store || (stores.length > 0 ? String(stores[0].id) : null)
    if (!selectedStoreId) {
      toast.error('Please select a grocery store partner.')
      setCurrentStep(1)
      return
    }

    const payload = {
      store: selectedStoreId,
      special_instructions: eventDetails.additional_instructions || '',
      event_data: {
        event_name: eventDetails.event_name,
        event_date: eventDetails.event_date,
        delivery_date: eventDetails.delivery_date,
        delivery_time: eventDetails.delivery_time ? (eventDetails.delivery_time.length === 5 ? `${eventDetails.delivery_time}:00` : eventDetails.delivery_time) : '09:00:00',
        event_location: eventDetails.event_location,
        num_guests: parseInt(eventDetails.number_of_guests, 10) || 1,
        additional_instructions: eventDetails.additional_instructions || '',
      },
      // Flat fields for resilience
      event_name: eventDetails.event_name,
      event_date: eventDetails.event_date,
      delivery_date: eventDetails.delivery_date,
      delivery_time: eventDetails.delivery_time,
      event_location: eventDetails.event_location,
      num_guests: parseInt(eventDetails.number_of_guests, 10) || 1,
      number_of_guests: parseInt(eventDetails.number_of_guests, 10) || 1,
      items: itemsList.map((item) => ({
        grocery_item: item.is_custom ? null : item.id,
        custom_item_name: item.is_custom ? item.name : '',
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'kg',
        notes: item.notes || '',
      })),
    }

    try {
      await createOrderMutation.mutateAsync(payload)
      navigate('/catering/orders')
    } catch {
      // Error handled by mutation onError
    }
  }

  const selectedList = Object.values(selectedItemsMap)
  const eventData = getEventValues()
  const watchedStore = watch('store')
  const selectedStore =
    stores.find((s) => String(s.id) === String(watchedStore || eventData.store)) ||
    stores.find((s) => s.store_name?.toLowerCase().includes('wadhwaniya')) ||
    stores[0]

  return (
    <DashboardLayout sidebar={CateringSidebar}>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header with Steps Breadcrumb */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Catering Grocery List</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Standardize your recipe requirements and submit directly to your grocery store
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 self-start sm:self-auto">
              Step {currentStep} of 3
            </div>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div
              className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : currentStep > 1
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              1. Event Info
            </div>
            <div
              className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                currentStep === 2
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : currentStep > 2
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              2. Select Items ({selectedList.length})
            </div>
            <div
              className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                currentStep === 3
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              3. Review & Submit
            </div>
          </div>
        </div>

        {/* STEP 1: Event Information */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit(onStep1Next)}>
            <Card title="Event & Delivery Details" subtitle="Provide the schedule and location for order dispatch">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Event / Function Name"
                    placeholder="e.g. Shah Wedding Reception & Dinner"
                    icon={HiOutlineDocumentText}
                    error={step1Errors.event_name?.message}
                    {...register('event_name', { required: 'Event name is required' })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Grocery Store Partner <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <HiOutlineShoppingBag className="h-5 w-5" />
                      </div>
                      <select
                        className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        {...register('store', { required: 'Please select a store partner' })}
                      >
                        {loadingStores ? (
                          <option value="">Loading grocery stores...</option>
                        ) : stores.length === 0 ? (
                          <option value="">No stores found</option>
                        ) : (
                          <option value="">-- Choose Grocery Store --</option>
                        )}
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.store_name} {s.phone ? `(${s.phone})` : s.address ? `(${s.address})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {step1Errors.store && (
                      <p className="mt-1 text-xs text-red-600">{step1Errors.store.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Input
                    label="Event Date"
                    type="date"
                    icon={HiOutlineCalendar}
                    error={step1Errors.event_date?.message}
                    {...register('event_date', { required: 'Event date is required' })}
                  />
                  <Input
                    label="Required Delivery Date"
                    type="date"
                    icon={HiOutlineCalendar}
                    error={step1Errors.delivery_date?.message}
                    {...register('delivery_date', { required: 'Delivery date is required' })}
                  />
                  <Input
                    label="Delivery Time"
                    type="time"
                    icon={HiOutlineClock}
                    error={step1Errors.delivery_time?.message}
                    {...register('delivery_time', { required: 'Delivery time is required' })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Estimated Number of Guests"
                    type="number"
                    min="1"
                    placeholder="e.g. 250"
                    icon={HiOutlineUserGroup}
                    error={step1Errors.number_of_guests?.message}
                    {...register('number_of_guests', {
                      required: 'Guest count is required',
                      min: { value: 1, message: 'Minimum 1 guest required' },
                    })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event / Hall Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute top-3 left-3 text-gray-400">
                        <HiOutlineLocationMarker className="w-5 h-5" />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Party Plot 7, Vaishnodevi Circle, Ahmedabad"
                        className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        {...register('event_location', { required: 'Location is required' })}
                      />
                    </div>
                    {step1Errors.event_location && (
                      <p className="mt-1 text-xs text-red-600">{step1Errors.event_location.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Packaging & Delivery Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please pack spices in moisture-proof containers. Deliver pulses before 8:00 AM."
                    className="block w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    {...register('additional_instructions')}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" variant="primary" size="lg" icon={HiOutlineArrowRight}>
                    Next: Select Items &rarr;
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        )}

        {/* STEP 2: Select Grocery Items */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Catalog (2 cols on large screen) */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                {/* Search & Custom Item bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between mb-4">
                  <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items by Gujarati or English name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <Button
                    onClick={() => setIsCustomModalOpen(true)}
                    variant="outline"
                    size="sm"
                    icon={HiOutlinePlus}
                  >
                    Add Custom Item
                  </Button>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategoryId === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryId === cat.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Items Grid */}
                {loadingItems ? (
                  <LoadingSpinner text="Loading catalog items..." />
                ) : groceryItems.length === 0 ? (
                  <EmptyState
                    title="No items found"
                    description="No grocery items matched your query. You can add a custom item."
                    actionText="Add Custom Item"
                    onAction={() => setIsCustomModalOpen(true)}
                    actionIcon={HiOutlinePlus}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
                    {groceryItems.map((item) => {
                      const isSelected = Boolean(selectedItemsMap[item.id])
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItemSelection(item)}
                          className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600'
                              : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50/60'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <HiOutlineCheck className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-base leading-tight pr-6">
                              {item.name}
                            </p>
                            {item.name_en && (
                              <p className="text-xs text-gray-500 mt-0.5">{item.name_en}</p>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-1.5">
                            <span>Default: {item.default_unit || 'kg'}</span>
                            <span className="text-emerald-700 font-semibold">
                              {isSelected ? 'Selected' : '+ Add'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Navigation Back */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  icon={HiOutlineArrowLeft}
                >
                  Back to Event Info
                </Button>
                <Button
                  onClick={() => {
                    if (selectedList.length === 0) {
                      toast.error('Select at least one grocery item.')
                      return
                    }
                    setCurrentStep(3)
                  }}
                  variant="primary"
                  icon={HiOutlineArrowRight}
                >
                  Review Order ({selectedList.length} items) &rarr;
                </Button>
              </div>
            </div>

            {/* Selected Items Panel (1 col) */}
            <div className="lg:col-span-1">
              <Card
                title={`Selected Items (${selectedList.length})`}
                subtitle="Specify exact quantity and units"
                className="sticky top-20"
              >
                {selectedList.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    Click items on the left to add them to your grocery requisition.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {selectedList.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-gray-100 bg-gray-50/80 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.name_en}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Remove"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Quantity and Unit Row */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            value={item.quantity}
                            onChange={(e) => updateSelectedItem(item.id, 'quantity', e.target.value)}
                            className="w-20 px-2.5 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Qty"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => updateSelectedItem(item.id, 'unit', e.target.value)}
                            className="flex-1 px-2.5 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {STANDARD_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedList.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="primary"
                      className="w-full"
                    >
                      Proceed to Review
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card
              title="Review Order Requisition"
              subtitle="Verify all quantities, event schedules, and store details before dispatching"
              action={
                <Button onClick={() => setCurrentStep(2)} variant="outline" size="sm">
                  Edit Items
                </Button>
              }
            >
              {/* Event Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 mb-6 text-sm">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Event Name</span>
                  <p className="font-bold text-gray-900 mt-0.5">{eventData.event_name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Store Partner</span>
                  <p className="font-bold text-emerald-700 mt-0.5">
                    {selectedStore?.store_name || 'Selected Partner'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Event & Delivery</span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {formatDate(eventData.delivery_date)} at {formatTime(eventData.delivery_time)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Guests & Venue</span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {eventData.number_of_guests} Guests | {eventData.event_location}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto -mx-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/70">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item Name (Gujarati)</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">English Translation</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Required Quantity</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {selectedList.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50/80">
                        <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                        <td className="px-6 py-3 font-semibold text-gray-900">{item.name}</td>
                        <td className="px-6 py-3 text-gray-500">{item.name_en || '-'}</td>
                        <td className="px-6 py-3 text-right font-bold text-emerald-700">{item.quantity}</td>
                        <td className="px-6 py-3 text-center text-gray-600 uppercase text-xs font-semibold">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {eventData.additional_instructions && (
                <div className="mt-6 p-4 rounded-xl bg-yellow-50/70 border border-yellow-200 text-sm text-yellow-900">
                  <strong className="block text-xs uppercase font-bold text-yellow-800 mb-1">
                    Special Packaging & Delivery Notes:
                  </strong>
                  {eventData.additional_instructions}
                </div>
              )}
            </Card>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                icon={HiOutlineArrowLeft}
              >
                Back to Item Selection
              </Button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleFinalSubmit}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-md shadow-emerald-600/20"
                  isLoading={createOrderMutation.isPending}
                >
                  Submit Order to Store Partner &rarr;
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Item Modal */}
        <Modal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          title="Add Custom Grocery Item"
        >
          <form onSubmit={handleAddCustomItem} className="space-y-4">
            <Input
              label="Item Name (Gujarati / Local)"
              placeholder="e.g. કાજુ ટુકડા / જીરાળુ મસાલો"
              value={customItemForm.name}
              onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
              required
            />
            <Input
              label="English Name (Optional)"
              placeholder="e.g. Broken Cashews"
              value={customItemForm.name_en}
              onChange={(e) => setCustomItemForm({ ...customItemForm, name_en: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity"
                type="number"
                step="any"
                min="0.1"
                value={customItemForm.quantity}
                onChange={(e) => setCustomItemForm({ ...customItemForm, quantity: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={customItemForm.unit}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, unit: e.target.value })}
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
              <Button type="button" variant="outline" onClick={() => setIsCustomModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add to List
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default CreateGroceryList
