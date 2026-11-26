import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineLockClosed,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StoreSidebar from '../../components/layout/StoreSidebar'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import useAuthStore from '../../store/authStore'
import { updateMe, changePassword } from '../../api/auth'

export const StoreProfile = () => {
  const { user, updateUser } = useAuthStore()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || user?.store_profile?.phone || '',
      store_name: user?.store_profile?.store_name || '',
      address: user?.store_profile?.address || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const onProfileSubmit = async (data) => {
    setIsUpdatingProfile(true)
    try {
      const res = await updateMe({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        store_name: data.store_name,
        address: data.address,
      })
      updateUser(res.data)
      toast.success('Store profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update store profile.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    setIsChangingPassword(true)
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully!')
      resetPasswordForm()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <DashboardLayout sidebar={StoreSidebar}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grocery Store Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your store location, representative contact, and security settings
          </p>
        </div>

        {/* Store Info Card */}
        <Card title="Store Business Information" subtitle="Publicly displayed to caterers when selecting fulfillment stores">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Store Name"
                icon={HiOutlineShoppingBag}
                error={profileErrors.store_name?.message}
                {...registerProfile('store_name', { required: 'Store name is required' })}
              />
              <Input
                label="Store Contact Phone"
                icon={HiOutlinePhone}
                error={profileErrors.phone?.message}
                {...registerProfile('phone', { required: 'Phone is required' })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner / Manager First Name"
                icon={HiOutlineUser}
                error={profileErrors.first_name?.message}
                {...registerProfile('first_name', { required: 'First name is required' })}
              />
              <Input
                label="Owner / Manager Last Name"
                icon={HiOutlineUser}
                error={profileErrors.last_name?.message}
                {...registerProfile('last_name', { required: 'Last name is required' })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Physical Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute top-3 left-3 text-gray-400">
                  <HiOutlineLocationMarker className="w-5 h-5" />
                </div>
                <textarea
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...registerProfile('address', { required: 'Store address is required' })}
                />
              </div>
              {profileErrors.address && (
                <p className="mt-1 text-xs text-red-600">{profileErrors.address.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
                Save Store Information
              </Button>
            </div>
          </form>
        </Card>

        {/* Password Card */}
        <Card title="Account Password" subtitle="Change login credentials">
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
            <Input
              label="Current Password"
              type="password"
              icon={HiOutlineLockClosed}
              error={passwordErrors.current_password?.message}
              {...registerPassword('current_password', { required: 'Current password is required' })}
            />
            <Input
              label="New Password"
              type="password"
              icon={HiOutlineLockClosed}
              error={passwordErrors.new_password?.message}
              {...registerPassword('new_password', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              icon={HiOutlineLockClosed}
              error={passwordErrors.confirm_password?.message}
              {...registerPassword('confirm_password', {
                required: 'Please confirm password',
              })}
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default StoreProfile
