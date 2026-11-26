import React from 'react'

const variants = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-sm focus:ring-gray-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-emerald-500',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-lg gap-2.5',
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
    </button>
  )
}

export default Button
