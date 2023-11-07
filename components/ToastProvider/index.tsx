'use client'

import ToastContext from 'contexts/toast'
import { useState } from 'react'

export interface ToastState {
  message?: string
  error?: boolean
}

interface ToastProviderProps {
  children: React.ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState>({})

  return (
    <ToastContext.Provider value={{ toast, setToast }}>
      {children}
    </ToastContext.Provider>
  )
}
