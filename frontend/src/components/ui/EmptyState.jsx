import React from 'react'
import Button from './Button'
import { HiOutlineFolderOpen } from 'react-icons/hi'

export const EmptyState = ({
  icon: Icon = HiOutlineFolderOpen,
  title = 'No data found',
  description = 'There are no items to display at this time.',
  actionText,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white ${className}`}>
      <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} icon={actionIcon} variant="primary" size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState
