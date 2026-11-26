import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  HiOutlineSparkles,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
} from 'react-icons/hi'
import { registerUser } from '../../api/auth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export const RegisterPage = () => {
  const [role, setRole] = useState('catering') // 'catering' or 'store_owner'
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      business_name: '',
      store_name: '',
      address: '',
      store_address: '',
    },
  })

  const passwordValue = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        username: data.email, // backend fallback
        password: data.password,
        role: role,
        phone: data.phone,
      }

      if (role === 'catering') {
        payload.business_name = data.business_name
        payload.address = data.address
      } else {
        payload.store_name = data.store_name
        payload.address = data.store_address
      }

      await registerUser(payload)
      toast.success('Registration successful! Please log in with your credentials.')
      navigate('/login')
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data && typeof err.response.data === 'object'
          ? Object.entries(err.response.data)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
              .join(' | ')
          : 'Failed to register account. Please check your information.')
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Link to="/" className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <HiOutlineSparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">CaterConnect</span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Create your business account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select your organization role to get started with CaterConnect
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-6 grid grid-cols-2 gap-3 p-1 bg-gray-200/70 rounded-xl max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setRole('catering')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              role === 'catering'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HiOutlineOfficeBuilding className="w-5 h-5" />
            <span>Catering Pro</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('store_owner')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              role === 'store_owner'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HiOutlineShoppingBag className="w-5 h-5" />
            <span>Grocery Store</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Rajesh"
                icon={HiOutlineUser}
                error={errors.first_name?.message}
                {...register('first_name', { required: 'First name is required' })}
              />
              <Input
                label="Last Name"
                placeholder="Patel"
                icon={HiOutlineUser}
                error={errors.last_name?.message}
                {...register('last_name', { required: 'Last name is required' })}
              />
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email address"
                type="email"
                placeholder="rajesh@example.com"
                icon={HiOutlineMail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              <Input
                label="Phone number"
                type="tel"
                placeholder="98765 43210"
                icon={HiOutlinePhone}
                error={errors.phone?.message}
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+ -]{10,15}$/,
                    message: 'Enter a valid phone number',
                  },
                })}
              />
            </div>

            {/* Role-Specific Fields */}
            {role === 'catering' ? (
              <>
                <Input
                  label="Catering Business / Kitchen Name"
                  placeholder="Shreeji Caterers & Decorators"
                  icon={HiOutlineOfficeBuilding}
                  error={errors.business_name?.message}
                  {...register('business_name', {
                    required: 'Business name is required for catering',
                  })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kitchen / Office Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute top-3 left-3 text-gray-400">
                      <HiOutlineLocationMarker className="w-5 h-5" />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="101, Anand Commercial Hub, SG Highway, Ahmedabad"
                      className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      {...register('address', { required: 'Address is required' })}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <Input
                  label="Grocery Store Name"
                  placeholder="Navrang Provision & Kirana Store"
                  icon={HiOutlineShoppingBag}
                  error={errors.store_name?.message}
                  {...register('store_name', {
                    required: 'Store name is required for store owners',
                  })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Physical Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute top-3 left-3 text-gray-400">
                      <HiOutlineLocationMarker className="w-5 h-5" />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Shop 12-14, Grain Market, Station Road, Ahmedabad"
                      className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      {...register('store_address', { required: 'Store address is required' })}
                    />
                  </div>
                  {errors.store_address && (
                    <p className="mt-1 text-xs text-red-600">{errors.store_address.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={HiOutlineLockClosed}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                icon={HiOutlineLockClosed}
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: (value) => value === passwordValue || 'Passwords do not match',
                })}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full shadow-md shadow-emerald-600/20"
                isLoading={isLoading}
              >
                Register as {role === 'catering' ? 'Catering Professional' : 'Grocery Store Owner'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Log in &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
