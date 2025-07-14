"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authAPI } from '@/lib/api'
import { Toast, ToastProps } from '@/components/ui/toast';

interface User {
  email: string
  nama: string
  gender?: number
  tempat_lahir?: string
  tanggal_lahir?: string
  kota_asal?: string
  is_verified?: boolean
  is_artist?: boolean
  is_songwriter?: boolean
  is_podcaster?: boolean
  is_premium?: boolean
  kontak?: string
  type?: string
  roles?: string[]
}

interface Label {
  email: string
  nama: string
  kontak?: string
}

interface AuthContextType {
  user: User | null
  label: Label | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: any, type: 'user' | 'label') => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastProps['type']) => void;
} | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastProps['type']; isOpen: boolean }>({
    message: '',
    type: 'info',
    isOpen: false,
  });

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    setToast({ message, type, isOpen: true });
  };

  const handleClose = () => setToast((t) => ({ ...t, isOpen: false }));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={handleClose}
      />
    </ToastContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [label, setLabel] = useState<Label | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Try to get current user info from session
      const response = await authAPI.getCurrentUser()
      if (response.user) {
        setUser(response.user)
        setLabel(null)
      } else if (response.label) {
        setLabel(response.label)
        setUser(null)
      } else if (response.email) {
        // Handle direct user object response (fallback)
        setUser(response)
        setLabel(null)
      }
    } catch (error) {
      setUser(null)
      setLabel(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      if (response.user) {
        setUser(response.user)
        setLabel(null)
      } else if (response.label) {
        setLabel(response.label)
        setUser(null)
      } else if (response.email) {
        // Handle direct user object response (fallback)
        setUser(response)
        setLabel(null)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await authAPI.login(email, password)
      await refreshUser()
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      setLabel(null)
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      setLabel(null)
    }
  }

  const register = async (userData: any, type: 'user' | 'label') => {
    try {
      if (type === 'user') {
        const response = await authAPI.registerUser(userData)
        if (response.error) {
          throw new Error(response.error)
        }
      } else {
        const response = await authAPI.registerLabel(userData)
        if (response.error) {
          throw new Error(response.error)
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed')
    }
  }

  const value = {
    user,
    label,
    loading,
    login,
    logout,
    register,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 