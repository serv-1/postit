import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '.'
import useToast from 'hooks/useToast'

jest.mock('hooks/useToast', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const mockSetToast = jest.fn()

beforeEach(() => {
  jest.useFakeTimers()

  useToastMock.mockReturnValue({
    toast: { message: 'oh' },
    setToast: mockSetToast,
  })
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

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {})
})

it('is red if the message is an error', () => {
  useToastMock.mockReturnValue({
    toast: { message: 'error', error: true },
    setToast() {},
  })

  render(<Toast />)

  const toast = screen.getByRole('alert')
  expect(toast).toHaveClass('bg-rose-600')
})

it('does not render if there is no message to display', () => {
  useToastMock.mockReturnValue({ toast: {}, setToast() {} })

  render(<Toast />)

  const toast = screen.queryByRole('alert')
  expect(toast).not.toBeInTheDocument()
})

it('stops rendering after 8 seconds', async () => {
  render(<Toast />)

  expect(mockSetToast).not.toHaveBeenCalled()

  jest.runAllTimers()

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {})
})
