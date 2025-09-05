'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface ToastProps {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300) // Wait for exit animation
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, id, onClose])
  
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }
  
  const typeStyles = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  }
  
  if (typeof window === 'undefined') return null
  
  return createPortal(
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg transition-all duration-300 ease-out",
        typeStyles[type],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start p-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium">{title}</h4>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  )
}

export interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </>
  )
}



