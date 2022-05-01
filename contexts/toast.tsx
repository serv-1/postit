import { createContext, useContext, useState } from 'react'

export interface ToastState {
  message?: string
  error?: boolean
}

interface ToastContextValue {
  toast: ToastState
  setToast: React.Dispatch<React.SetStateAction<ToastState>>
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

interface ToastProviderProps {
  children: React.ReactNode
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastState>({})

  const value = { toast, setToast }
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

const useToast = () => {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}

export { ToastProvider, useToast }
