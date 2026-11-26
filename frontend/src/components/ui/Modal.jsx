import React, { useEffect } from 'react'
import { HiX } from 'react-icons/hi'

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-gray-100 z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <HiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export default Modal
