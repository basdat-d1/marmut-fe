'use client'

import { useState } from 'react'
import { Button } from './button'
import { 
  AlertTriangle, 
  Download, 
  Plus, 
  Trash2, 
  Music,
  X
} from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type: 'delete' | 'download' | 'add' | 'custom'
  confirmText?: string
  cancelText?: string
  icon?: React.ReactNode
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  confirmText,
  cancelText = 'Cancel',
  icon
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  const getDefaultIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="w-6 h-6 text-red-500" />
      case 'download':
        return <Download className="w-6 h-6 text-blue-500" />
      case 'add':
        return <Plus className="w-6 h-6 text-green-500" />
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
    }
  }

  const getDefaultConfirmText = () => {
    switch (type) {
      case 'delete':
        return 'Delete'
      case 'download':
        return 'Download'
      case 'add':
        return 'Add to Playlist'
      default:
        return 'Confirm'
    }
  }

  const getButtonVariant = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700'
      case 'download':
        return 'bg-blue-600 hover:bg-blue-700'
      case 'add':
        return 'bg-green-600 hover:bg-green-700'
      default:
        return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {icon || getDefaultIcon()}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-300 text-center mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          
          <Button
            onClick={handleConfirm}
            className={`flex-1 text-white ${getButtonVariant()}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              confirmText || getDefaultConfirmText()
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 