import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', isOpen, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  let bgColor = 'bg-gray-800';
  let borderColor = 'border-gray-700';
  let textColor = 'text-white';
  if (type === 'success') {
    bgColor = 'bg-green-600';
    borderColor = 'border-green-700';
    textColor = 'text-white';
  } else if (type === 'error') {
    bgColor = 'bg-red-600';
    borderColor = 'border-red-700';
    textColor = 'text-white';
  } else if (type === 'warning') {
    bgColor = 'bg-yellow-600';
    borderColor = 'border-yellow-700';
    textColor = 'text-black';
  } else if (type === 'info') {
    bgColor = 'bg-blue-600';
    borderColor = 'border-blue-700';
    textColor = 'text-white';
  }

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border ${bgColor} ${borderColor} ${textColor} animate-fade-in`}
      role="alert"
    >
      <span>{message}</span>
      <button
        className="ml-4 text-lg font-bold focus:outline-none"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

// Add this animation to your global CSS:
// @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
// .animate-fade-in { animation: fade-in 0.3s ease; } 