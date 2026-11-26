import React from 'react'

export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footer,
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${headerClassName}`}>
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && <div className="px-6 py-3 bg-gray-50/70 border-t border-gray-100">{footer}</div>}
    </div>
  )
}

export default Card
