import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '../../components/Toast'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

const setToast = jest.fn()

beforeEach(() => {
  jest.useFakeTimers()
  useToast.mockReturnValue({ toast: { message: 'oh' }, setToast })
})

it('renders', async () => {
  render(<Toast />)

  const toast = screen.getByRole('alert')
  expect(toast).toHaveTextContent('oh')
  expect(toast).toHaveClass('bg-fuchsia-600')
})

it('closes after clicking the close button', async () => {
  jest.useRealTimers()

  render(<Toast />)

  const closeBtn = screen.getByRole('button')
  await userEvent.click(closeBtn)

  expect(setToast).toHaveBeenNthCalledWith(1, {})
})

it('is red if the message is an error', () => {
  useToast.mockReturnValue({ toast: { message: 'error', error: true } })

  render(<Toast />)

  const toast = screen.getByRole('alert')
  expect(toast).toHaveClass('bg-rose-600')
})

it('does not render if there is no message to display', () => {
  useToast.mockReturnValue({ toast: {} })

  render(<Toast />)

  const toast = screen.queryByRole('alert')
  expect(toast).not.toBeInTheDocument()
})

it('stops rendering after 12.5 seconds', async () => {
  render(<Toast />)

  expect(setToast).not.toHaveBeenCalled()

  jest.runAllTimers()

  expect(setToast).toHaveBeenNthCalledWith(1, {})
})
