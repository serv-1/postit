import React from 'react'

export interface ToastState {
  message?: string
  error?: boolean
}
type SetToast = React.Dispatch<React.SetStateAction<ToastState>>
interface ToastProviderProps {
  children: React.ReactNode
}

const ToastContext = React.createContext<
  | {
      toast: ToastState
      setToast: SetToast
    }
  | undefined
>(undefined)

const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = React.useState<ToastState>({})

  const value = { toast, setToast }
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

const useToast = () => {
  const context = React.useContext(ToastContext)

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}

export { ToastProvider, useToast }
