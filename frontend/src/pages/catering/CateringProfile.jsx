import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineLockClosed,
} from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CateringSidebar from '../../components/layout/CateringSidebar'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import useAuthStore from '../../store/authStore'
import { updateMe, changePassword } from '../../api/auth'

export const CateringProfile = () => {
  const { user, updateUser } = useAuthStore()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.catering_profile?.phone || user?.phone || '',
      business_name: user?.catering_profile?.business_name || '',
      address: user?.catering_profile?.address || '',
    },
  })

  // Password form
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
        business_name: data.business_name,
        address: data.address,
      })
      updateUser(res.data)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
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
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to change password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <DashboardLayout sidebar={CateringSidebar}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catering Business Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your kitchen details, contact information, and account security
          </p>
        </div>

        {/* Business & Personal Info Card */}
        <Card title="Business Details" subtitle="Information visible on order slips to store partners">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                icon={HiOutlineUser}
                error={profileErrors.first_name?.message}
                {...registerProfile('first_name', { required: 'First name is required' })}
              />
              <Input
                label="Last Name"
                icon={HiOutlineUser}
                error={profileErrors.last_name?.message}
                {...registerProfile('last_name', { required: 'Last name is required' })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business / Kitchen Brand Name"
                icon={HiOutlineOfficeBuilding}
                error={profileErrors.business_name?.message}
                {...registerProfile('business_name', { required: 'Business name is required' })}
              />
              <Input
                label="Direct Phone Number"
                icon={HiOutlinePhone}
                error={profileErrors.phone?.message}
                {...registerProfile('phone', { required: 'Phone number is required' })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office / Commercial Kitchen Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute top-3 left-3 text-gray-400">
                  <HiOutlineLocationMarker className="w-5 h-5" />
                </div>
                <textarea
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...registerProfile('address', { required: 'Address is required' })}
                />
              </div>
              {profileErrors.address && (
                <p className="mt-1 text-xs text-red-600">{profileErrors.address.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card title="Security & Password" subtitle="Update your account login password">
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
                required: 'Please confirm new password',
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

export default CateringProfile
