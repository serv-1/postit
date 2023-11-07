import ToastContext from 'contexts/toast'
import { useContext } from 'react'

export default function useToast() {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
