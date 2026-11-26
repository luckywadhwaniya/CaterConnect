import React from 'react'

const badgeStyles = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
}

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

export const Badge = ({ status = 'default', label, className = '' }) => {
  const normalizedStatus = status.toLowerCase()
  const style = badgeStyles[normalizedStatus] || badgeStyles.default
  const displayText = label || statusLabels[normalizedStatus] || status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wide ${style} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          normalizedStatus === 'ready'
            ? 'bg-emerald-500'
            : normalizedStatus === 'pending'
            ? 'bg-yellow-500'
            : normalizedStatus === 'accepted'
            ? 'bg-blue-500'
            : normalizedStatus === 'preparing'
            ? 'bg-orange-500'
            : normalizedStatus === 'completed'
            ? 'bg-gray-500'
            : normalizedStatus === 'rejected' || normalizedStatus === 'cancelled'
            ? 'bg-red-500'
            : 'bg-gray-400'
        }`}
      />
      {displayText}
    </span>
  )
}

export default Badge
