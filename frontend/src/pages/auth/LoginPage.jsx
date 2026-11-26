import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineSparkles } from 'react-icons/hi'
import { loginUser } from '../../api/auth'
import useAuthStore from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      })

      const { user, access, refresh, tokens } = response.data
      const accessToken = access || tokens?.access
      const refreshToken = refresh || tokens?.refresh

      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.first_name || user.username}!`)

      if (user.role === 'catering') {
        navigate('/catering/dashboard')
      } else if (user.role === 'store_owner') {
        navigate('/store/dashboard')
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid credentials. Please verify your email and password.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <HiOutlineSparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">CaterConnect</span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your orders, grocery lists, and store network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={HiOutlineMail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={HiOutlineLockClosed}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full shadow-md shadow-emerald-600/20"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">New to CaterConnect?</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/register"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Create your business account &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
