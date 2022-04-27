import classNames from 'classnames'
import { useToast } from '../contexts/toast'
import X from '../public/static/images/x.svg'

const Toast = () => {
  const { toast, setToast } = useToast()

  const toastClass = classNames(
    'z-[9999] absolute top-56 w-full md:w-auto md:top-64 md:left-1/2 md:-translate-x-1/2 p-8 md:rounded flex flex-row flex-nowrap justify-center',
    toast.error
      ? 'bg-red-500 text-white shadow-[0_4px_8px_rgba(239,68,68,0.5)]'
      : 'bg-indigo-200 text-indigo-600 shadow-[0_4px_8px_rgba(79,70,229,0.25)]'
  )

  const closeBtnClass = classNames(
    'ml-16',
    toast.error ? 'text-red-600' : 'text-white'
  )

  return toast.message ? (
    <div className={toastClass} role="alert">
      <div>{toast.message}</div>
      <button className={closeBtnClass} onClick={() => setToast({})}>
        <X className="w-24 h-24" />
      </button>
    </div>
  ) : null
}
export default Toast
