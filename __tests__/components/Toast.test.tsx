import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import Toast from '../../components/Toast'
import { ToastState } from '../../contexts/toast'
import { ToastProvider, useToast } from '../../contexts/toast'

const defaultToast = { message: 'My toast!' }

const Toaster = ({ message, background }: ToastState) => {
  const { setToast } = useToast()

  useEffect(() => {
    setToast({ message, background })
  }, [setToast, message, background])

  return <Toast />
}

const factory = ({ message, background }: ToastState = defaultToast) => {
  render(
    <ToastProvider>
      <Toaster message={message} background={background} />
    </ToastProvider>
  )
}

test('the alert renders and if the close button is clicked the alert disappears', () => {
  factory()

  let alert: HTMLElement | null = screen.getByRole('alert')
  expect(alert).toHaveTextContent(defaultToast.message)
  expect(alert).toHaveClass('bg-primary', 'text-white')

  const closeBtn = screen.getByRole('button')
  expect(closeBtn).toHaveClass('btn-close-white')

  userEvent.click(closeBtn)
  alert = screen.queryByRole('alert')
  expect(alert).not.toBeInTheDocument()
})

test('the alert do not render if there is no message to display', () => {
  factory({ message: null })

  const alert = screen.queryByRole('alert')
  expect(alert).not.toBeInTheDocument()
})

test('the alert use the given background color with the related text color', () => {
  factory({ message: defaultToast.message, background: 'white' })

  const alert = screen.getByRole('alert')
  expect(alert).toHaveClass('bg-white')
  expect(alert).not.toHaveClass('text-white')

  const closeBtn = screen.getByRole('button')
  expect(closeBtn).not.toHaveClass('btn-close-white')
})
