import classNames from 'classnames'
import { useToast } from '../contexts/toast'
import X from '../public/static/images/x.svg'

const Toast = () => {
  const { toast, setToast } = useToast()
  const { message, error } = toast
  return message ? (
    <div className="w-full z-[9999] absolute top-16 animate-[fadeInDown_.3s_ease-out] flex flex-row flex-nowrap justify-center">
      <div
        className={classNames(
          'fixed p-8 rounded flex flex-row flex-nowrap gap-x-8 justify-center items-start text-fuchsia-50 font-bold outline outline-4',
          error
            ? 'bg-rose-600 outline-rose-900/75'
            : 'bg-fuchsia-600 outline-fuchsia-900/75'
        )}
        role="alert"
      >
        <span>{message}</span>
        <button
          className="text-fuchsia-200 bg-fuchsia-50/[.15] rounded hover:text-fuchsia-50 hover:bg-fuchsia-50/50 transition-colors duration-200"
          onClick={() => setToast({})}
        >
          <X className="w-24 h-24" />
        </button>
      </div>
    </div>
  ) : null
}
export default Toast
