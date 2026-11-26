import React, { forwardRef } from 'react'

export const Input = forwardRef(
  ({ label, error, helperText, icon: Icon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {Icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:text-gray-500 ${
              Icon ? 'pl-10' : 'pl-3'
            } pr-3 py-2 ${
              error
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
