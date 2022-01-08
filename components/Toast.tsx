import { useToast } from '../contexts/toast'
import CloseButton from './CloseButton'

const needWhiteText = ['success', 'danger', 'primary', 'secondary', 'dark']

const Toast = () => {
  const { toast, setToast } = useToast()
  const { message, background } = toast

  let toastClass =
    'position-absolute start-50 p-2 rounded-pill d-flex shadow-lg justify-content-between'

  const bg = background || 'primary'
  toastClass += ' bg-' + bg

  const needWhite = needWhiteText.includes(bg)
  if (needWhite) toastClass += ' text-white'

  return message ? (
    <div
      className={toastClass}
      style={{
        zIndex: 2000,
        transform: 'translateX(-50%)',
      }}
      role="alert"
    >
      <div>{message}</div>
      <CloseButton
        className="ms-2"
        isWhite={needWhite}
        onClick={() => setToast({ message: null })}
      />
    </div>
  ) : null
}
export default Toast
