import React from 'react'

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } border-emerald-200 border-t-emerald-600 rounded-full animate-spin`}
      />
      {text && <p className="mt-3 text-sm font-medium text-gray-500">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
