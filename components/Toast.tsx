import classNames from 'classnames'
import { useToast } from '../contexts/toast'
import CloseButton from './CloseButton'

const needWhiteText = ['success', 'danger', 'primary', 'secondary', 'dark']

const Toast = () => {
  const { toast, setToast } = useToast()

  const bg = toast.background || 'primary'
  const needWhite = needWhiteText.includes(bg)

  const className = classNames(
    'position-absolute start-50 p-2 rounded-pill',
    'd-flex shadow-lg justify-content-between',
    `bg-${bg}`,
    { 'text-white': needWhite }
  )

  return toast.message ? (
    <div
      className={className}
      style={{
        zIndex: 2000,
        transform: 'translateX(-50%)',
      }}
      role="alert"
    >
      <div>{toast.message}</div>
      <CloseButton
        className="ms-2"
        isWhite={needWhite}
        onClick={() => setToast({ message: null })}
      />
    </div>
  ) : null
}
export default Toast
