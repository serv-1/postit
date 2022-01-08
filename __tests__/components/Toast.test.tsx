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

describe('Toast', () => {
  it('should be rendered with the message', async () => {
    factory()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      defaultToast.message
    )
  })

  it('should not be rendered if there is no message', () => {
    factory({ message: null })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should use "primary" bg color if no bg color is defined', () => {
    factory()
    expect(screen.getByRole('alert')).toHaveClass('bg-primary')
  })

  it('should use the bg color', () => {
    factory({ ...defaultToast, background: 'success' })
    expect(screen.getByRole('alert')).toHaveClass('bg-success')
  })

  it('should have a white text if the bg color is one of the bg colors that needs it', () => {
    factory({ ...defaultToast, background: 'danger' })
    expect(screen.getByRole('alert')).toHaveClass('text-white')
    expect(screen.getByRole('button')).toHaveClass('btn-close-white')
  })

  it('should not have a white text if the bg color is not one of the bg colors that needs it', () => {
    factory({ ...defaultToast, background: 'white' })
    expect(screen.getByRole('alert')).not.toHaveClass('text-white')
    expect(screen.getByRole('button')).not.toHaveClass('btn-close-white')
  })

  it('should be removed if the close button is clicked', () => {
    factory()
    userEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
