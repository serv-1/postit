import { MouseEventHandler } from 'react'

type ButtonProps = {
  children?: JSX.Element | JSX.Element[] | string
  className: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  ariaLabel?: string
}

const Button = ({ children, className, onClick, ariaLabel }: ButtonProps) => {
  return (
    <button
      aria-label={ariaLabel}
      className={`btn ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
