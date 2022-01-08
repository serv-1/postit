import { useToast } from '../contexts/toast'

const needWhiteText = ['success', 'danger', 'primary', 'secondary', 'dark']

const Toast = () => {
  const { toast, setToast } = useToast()

  const { message, background } = toast
  const bg = background || 'primary'
  const textColor = needWhiteText.includes(bg) ? ' text-white' : ''
  const btnColor = textColor ? ' btn-close-white' : ''

  return message ? (
    <div
      className={`position-absolute start-50 bg-${
        bg + textColor
      } p-2 rounded-pill d-flex shadow-lg justify-content-between`}
      style={{
        zIndex: 2000,
        transform: 'translateX(-50%)',
      }}
      role="alert"
    >
      <div>{message}</div>
      <button
        className={`btn-close${btnColor} ms-2`}
        aria-label="close"
        onClick={() => setToast({ message: null })}
      ></button>
    </div>
  ) : null
}
export default Toast
