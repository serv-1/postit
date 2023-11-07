import { ToastState } from 'components/ToastProvider'
import { createContext } from 'react'

interface ToastContextValue {
  toast: ToastState
  setToast: React.Dispatch<React.SetStateAction<ToastState>>
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export default ToastContext
